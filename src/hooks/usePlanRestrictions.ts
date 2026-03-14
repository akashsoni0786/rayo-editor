import { useState, useEffect, useCallback } from 'react';
import { 
  getUserPlanRestrictions, 
  canUserRetryTitles, 
  canUserAccessPremiumFeatures,
  PlanRestrictionResponse,
  initializePlanUpdateListeners,
  clearPlanCache
} from '../services/planRestrictionService';

interface UsePlanRestrictionsReturn {
  // Plan data
  planData: PlanRestrictionResponse | null;
  isPro: boolean;
  isFree: boolean;
  
  // Loading states
  isLoading: boolean;
  isRefreshing: boolean;
  
  // Error state
  error: string | null;
  
  // Specific permissions
  canRetryTitles: boolean;
  canAccessPremiumFeatures: boolean;
  
  // Actions
  refreshPlanData: () => Promise<void>;
  checkRetryPermission: () => Promise<{ allowed: boolean; message?: string }>;
  checkPremiumAccess: () => Promise<{ allowed: boolean; message?: string }>;
}

export function usePlanRestrictions(): UsePlanRestrictionsReturn {
  const [planData, setPlanData] = useState<PlanRestrictionResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);

  // Fetch plan data function
  const fetchPlanData = useCallback(async (options: { initial?: boolean } = {}) => {
    const { initial = false } = options;
    
    
    if (initial) {
      setIsLoading(true);
      setError(null);
    } else {
      setIsRefreshing(true);
    }

    try {
      const data = await getUserPlanRestrictions();
      setPlanData(data);
      
      if (data.success) {
        setError(null);
      } else {
        console.warn('⚠️ [usePlanRestrictions] Plan data fetch unsuccessful');
        if (!hasLoadedOnce) {
          setError('Unable to load plan information');
        }
      }
    } catch (err: any) {
      console.error('❌ [usePlanRestrictions] Error fetching plan data:', err);
      if (!hasLoadedOnce) {
        setError(err.message || 'Failed to load plan information');
      }
    } finally {
      if (initial) {
        setIsLoading(false);
        setHasLoadedOnce(true);
      } else {
        setIsRefreshing(false);
      }
    }
  }, [hasLoadedOnce]);

  // Initial load and event listeners
  useEffect(() => {
    fetchPlanData({ initial: true });

    // Set up plan update listeners
    const cleanup = initializePlanUpdateListeners();
    
    // Listen for plan updates and refresh
    const handlePlanUpdate = () => {
      fetchPlanData({ initial: !hasLoadedOnce });
    };

    window.addEventListener('subscription-updated', handlePlanUpdate);
    window.addEventListener('wallet-updated', handlePlanUpdate);
    window.addEventListener('plan-upgraded', handlePlanUpdate);

    return () => {
      if (typeof cleanup === 'function') cleanup();
      window.removeEventListener('subscription-updated', handlePlanUpdate);
      window.removeEventListener('wallet-updated', handlePlanUpdate);
      window.removeEventListener('plan-upgraded', handlePlanUpdate);
    };
  }, [fetchPlanData, hasLoadedOnce]);

  // Refresh function for manual refresh
  const refreshPlanData = useCallback(async () => {
    clearPlanCache();
    await fetchPlanData({ initial: false });
  }, [fetchPlanData]);

  // Check retry permission
  const checkRetryPermission = useCallback(async () => {
    return await canUserRetryTitles();
  }, []);

  // Check premium access
  const checkPremiumAccess = useCallback(async () => {
    return await canUserAccessPremiumFeatures();
  }, []);

  // Derived values
  const isPro = planData?.plan_type === 'pro';
  const isFree = planData?.plan_type === 'free';
  const canRetryTitles = planData?.restrictions.canRetryTitles ?? false;
  const canAccessPremiumFeatures = planData?.restrictions.canAccessPremiumFeatures ?? false;

  return {
    // Plan data
    planData,
    isPro,
    isFree,
    
    // Loading states
    isLoading,
    isRefreshing,
    
    // Error state
    error,
    
    // Specific permissions
    canRetryTitles,
    canAccessPremiumFeatures,
    
    // Actions
    refreshPlanData,
    checkRetryPermission,
    checkPremiumAccess
  };
}

// Lightweight hook for just checking if user is pro (with caching)
export function useIsPro(): { 
  isPro: boolean; 
  isLoading: boolean; 
  planType: 'free' | 'pro' | null;
} {
  const [isPro, setIsPro] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [planType, setPlanType] = useState<'free' | 'pro' | null>(null);

  useEffect(() => {
    const checkProStatus = async () => {
      try {
        const data = await getUserPlanRestrictions();
        const isProUser = data.plan_type === 'pro';
        setIsPro(isProUser);
        setPlanType(data.plan_type);
      } catch (error) {
        console.error('Error checking pro status:', error);
        setIsPro(false);
        setPlanType('free');
      } finally {
        setIsLoading(false);
      }
    };

    checkProStatus();
  }, []);

  return { isPro, isLoading, planType };
}
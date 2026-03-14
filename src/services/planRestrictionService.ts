import { api } from './api';

// Plan restriction response interface
export interface PlanRestrictionResponse {
  success: boolean;
  plan_type: 'free' | 'pro';
  plan_name?: string | null;
  balance: number;
  currency: string;
  plan_status?: string | null;
  plan_expiry?: string | null;
  days_left?: number | null;
  expiring_within_7_days?: boolean;
  restrictions: {
    canRetryTitles: boolean;
    canGenerateMore: boolean;
    canAccessPremiumFeatures: boolean;
  };
}

// Cache for plan data to avoid frequent API calls
let planDataCache: {
  data: PlanRestrictionResponse | null;
  timestamp: number;
  expiryTime: number;
} = {
  data: null,
  timestamp: 0,
  expiryTime: 5 * 60 * 1000 // 5 minutes cache
};

/**
 * Get user's plan type and restrictions from balance endpoint
 */
export async function getUserPlanRestrictions(): Promise<PlanRestrictionResponse> {
  try {
    
    // Cache disabled - always fetch fresh data

    // Fetch from balance API
    const response = await api.get('/api/v1/account/balance');
    const balanceData = response.data;


    if (!balanceData.success) {
      throw new Error('Failed to fetch account balance');
    }

    const planType = balanceData.plan_type || 'free';
    const isPro = planType === 'pro';

    // Create restrictions based on plan type
    const restrictions = {
      canRetryTitles: isPro, // Only pro users can retry/generate more titles
      canGenerateMore: isPro, // Only pro users can generate more suggestions
      canAccessPremiumFeatures: isPro // Only pro users can access premium features
    };

    const planRestrictionData: PlanRestrictionResponse = {
      success: true,
      plan_type: planType as 'free' | 'pro',
      plan_name: balanceData.plan_name,
      balance: balanceData.balance || 0,
      currency: balanceData.currency || 'USD',
      plan_status: balanceData.plan_status,
      plan_expiry: balanceData.plan_expiry,
      days_left: balanceData.days_left,
      expiring_within_7_days: balanceData.expiring_within_7_days,
      restrictions
    };

    // Cache disabled - no caching

    

    return planRestrictionData;

  } catch (error: any) {
    console.error('❌ [PlanRestriction] Error fetching plan restrictions:', error);
    
    // Return default free plan restrictions on error
    const fallbackData: PlanRestrictionResponse = {
      success: false,
      plan_type: 'free',
      balance: 0,
      currency: 'USD',
      restrictions: {
        canRetryTitles: false,
        canGenerateMore: false,
        canAccessPremiumFeatures: false
      }
    };

    return fallbackData;
  }
}

/**
 * Check if user can retry/generate more titles
 */
export async function canUserRetryTitles(): Promise<{
  allowed: boolean;
  planType: 'free' | 'pro';
  message?: string;
}> {
  try {
    const planData = await getUserPlanRestrictions();
    
    if (planData.restrictions.canRetryTitles) {
      return {
        allowed: true,
        planType: planData.plan_type
      };
    } else {
      return {
        allowed: false,
        planType: planData.plan_type,
        message: 'Upgrade to Pro to generate more title suggestions'
      };
    }
  } catch (error) {
    console.error('❌ [PlanRestriction] Error checking retry permissions:', error);
    return {
      allowed: false,
      planType: 'free',
      message: 'Unable to verify plan permissions'
    };
  }
}

/**
 * Check if user has premium features access
 */
export async function canUserAccessPremiumFeatures(): Promise<{
  allowed: boolean;
  planType: 'free' | 'pro';
  message?: string;
}> {
  try {
    const planData = await getUserPlanRestrictions();
    
    if (planData.restrictions.canAccessPremiumFeatures) {
      return {
        allowed: true,
        planType: planData.plan_type
      };
    } else {
      return {
        allowed: false,
        planType: planData.plan_type,
        message: 'Upgrade to Pro to access premium features'
      };
    }
  } catch (error) {
    console.error('❌ [PlanRestriction] Error checking premium access:', error);
    return {
      allowed: false,
      planType: 'free',
      message: 'Unable to verify plan permissions'
    };
  }
}

/**
 * Clear the plan data cache (useful after plan upgrades)
 */
export function clearPlanCache(): void {
  planDataCache = {
    data: null,
    timestamp: 0,
    expiryTime: 5 * 60 * 1000
  };
}

/**
 * Force refresh plan data (bypass cache)
 */
export async function refreshPlanData(): Promise<PlanRestrictionResponse> {
  clearPlanCache();
  return await getUserPlanRestrictions();
}

/**
 * Get cached plan data without making API call
 */
export function getCachedPlanData(): PlanRestrictionResponse | null {
  const now = Date.now();
  if (planDataCache.data && (now - planDataCache.timestamp) < planDataCache.expiryTime) {
    return planDataCache.data;
  }
  return null;
}

/**
 * Listen for plan updates and refresh cache
 */
export function initializePlanUpdateListeners(): (() => void) | void {
  // Listen for subscription updates
  const handlePlanUpdate = () => {
    clearPlanCache();
  };

  window.addEventListener('subscription-updated', handlePlanUpdate);
  window.addEventListener('wallet-updated', handlePlanUpdate);
  window.addEventListener('plan-upgraded', handlePlanUpdate);

  // Return cleanup function
  return () => {
    window.removeEventListener('subscription-updated', handlePlanUpdate);
    window.removeEventListener('wallet-updated', handlePlanUpdate);
    window.removeEventListener('plan-upgraded', handlePlanUpdate);
  };
}
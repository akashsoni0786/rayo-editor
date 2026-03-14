import { PlanRestrictionResponse } from '../services/planRestrictionService';
interface UsePlanRestrictionsReturn {
    planData: PlanRestrictionResponse | null;
    isPro: boolean;
    isFree: boolean;
    isLoading: boolean;
    isRefreshing: boolean;
    error: string | null;
    canRetryTitles: boolean;
    canAccessPremiumFeatures: boolean;
    refreshPlanData: () => Promise<void>;
    checkRetryPermission: () => Promise<{
        allowed: boolean;
        message?: string;
    }>;
    checkPremiumAccess: () => Promise<{
        allowed: boolean;
        message?: string;
    }>;
}
export declare function usePlanRestrictions(): UsePlanRestrictionsReturn;
export declare function useIsPro(): {
    isPro: boolean;
    isLoading: boolean;
    planType: 'free' | 'pro' | null;
};
export {};
//# sourceMappingURL=usePlanRestrictions.d.ts.map
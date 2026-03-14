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
/**
 * Get user's plan type and restrictions from balance endpoint
 */
export declare function getUserPlanRestrictions(): Promise<PlanRestrictionResponse>;
/**
 * Check if user can retry/generate more titles
 */
export declare function canUserRetryTitles(): Promise<{
    allowed: boolean;
    planType: 'free' | 'pro';
    message?: string;
}>;
/**
 * Check if user has premium features access
 */
export declare function canUserAccessPremiumFeatures(): Promise<{
    allowed: boolean;
    planType: 'free' | 'pro';
    message?: string;
}>;
/**
 * Clear the plan data cache (useful after plan upgrades)
 */
export declare function clearPlanCache(): void;
/**
 * Force refresh plan data (bypass cache)
 */
export declare function refreshPlanData(): Promise<PlanRestrictionResponse>;
/**
 * Get cached plan data without making API call
 */
export declare function getCachedPlanData(): PlanRestrictionResponse | null;
/**
 * Listen for plan updates and refresh cache
 */
export declare function initializePlanUpdateListeners(): (() => void) | void;
//# sourceMappingURL=planRestrictionService.d.ts.map
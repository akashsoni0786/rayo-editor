export interface ValidationResult {
    isValid: boolean;
    error?: string;
    normalizedUrl?: string;
}
export declare const strictUrlValidator: (url: string) => ValidationResult;
export declare const getDomainInfo: (url: string) => {
    protocol: string;
    hostname: string;
    pathname: string;
    hasRegionCode: boolean;
} | null;
//# sourceMappingURL=urlValidator.d.ts.map
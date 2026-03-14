interface IntercomSupportProps {
    appId: string;
    customAttributes?: Record<string, string | number | boolean>;
    showButton?: boolean;
}
/**
 * IntercomSupport component for integrating Intercom chat functionality
 * This component only initializes Intercom and doesn't render any visible UI
 * @param appId - Your Intercom application ID
 * @param customAttributes - Optional custom attributes to pass to Intercom
 * @param showButton - Deprecated: No longer used as button has been removed
 */
export declare function IntercomSupport({ appId, customAttributes }: IntercomSupportProps): null;
export default IntercomSupport;
//# sourceMappingURL=IntercomSupport.d.ts.map
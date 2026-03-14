declare global {
    interface Window {
        Intercom: any;
        intercomSettings: any;
    }
}
interface IntercomWithAuthProps {
    appId?: string;
    customAttributes?: Record<string, any>;
}
export declare function IntercomWithAuth({ appId, customAttributes }: IntercomWithAuthProps): null;
export default IntercomWithAuth;
//# sourceMappingURL=IntercomWithAuth.d.ts.map
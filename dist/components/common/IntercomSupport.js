import { useEffect } from 'react';
/**
 * IntercomSupport component for integrating Intercom chat functionality
 * This component only initializes Intercom and doesn't render any visible UI
 * @param appId - Your Intercom application ID
 * @param customAttributes - Optional custom attributes to pass to Intercom
 * @param showButton - Deprecated: No longer used as button has been removed
 */
export function IntercomSupport({ appId, customAttributes = {} }) {
    // Initialize Intercom when the component mounts
    useEffect(() => {
        const intercomWindow = window;
        if (!intercomWindow.Intercom) {
            // Load the Intercom script
            const script = document.createElement('script');
            script.async = true;
            script.src = `https://widget.intercom.io/widget/${appId}`;
            document.body.appendChild(script);
            script.onload = () => {
                // Initialize Intercom with your app ID and any custom attributes
                if (intercomWindow.Intercom) {
                    intercomWindow.Intercom('boot', {
                        app_id: appId,
                        ...customAttributes
                    });
                }
            };
        }
        else {
            // If Intercom is already loaded, just update the settings
            intercomWindow.Intercom('update', {
                app_id: appId,
                ...customAttributes
            });
        }
        // Clean up when component unmounts
        return () => {
            if (intercomWindow.Intercom) {
                intercomWindow.Intercom('shutdown');
            }
        };
    }, [appId, customAttributes]);
    // No visible UI
    return null;
}
export default IntercomSupport;
//# sourceMappingURL=IntercomSupport.js.map
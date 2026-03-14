import { useEffect } from 'react';
import { tokenManager } from '../../auth/tokenManager';
// Get app ID from environment variable
const INTERCOM_APP_ID = import.meta.env.VITE_INTERCOM_APP_ID || 'u3ugv8d2';
export function IntercomWithAuth({ appId = INTERCOM_APP_ID, customAttributes = {} }) {
    useEffect(() => {
        // Get user data
        const userId = tokenManager.getUserId();
        const userEmail = tokenManager.getUserEmail();
        const userName = tokenManager.getUserName();
        const userAvatar = tokenManager.getUserAvatar();
        // Build intercom settings
        const settings = {
            app_id: appId,
            hide_default_launcher: false,
            ...customAttributes,
        };
        // Add user data if available
        if (userId && userEmail) {
            settings.user_id = userId;
            settings.email = userEmail;
            settings.name = userName || userEmail.split('@')[0];
            if (userAvatar) {
                settings.avatar = { type: 'avatar', image_url: userAvatar };
            }
        }
        // Set global settings
        window.intercomSettings = settings;
        // Load Intercom script if not already loaded
        const loadIntercom = () => {
            const w = window;
            const ic = w.Intercom;
            if (typeof ic === 'function') {
                ic('reattach_activator');
                ic('update', settings);
            }
            else {
                const i = function () { i.c(arguments); };
                i.q = [];
                i.c = function (args) { i.q.push(args); };
                w.Intercom = i;
                const script = document.createElement('script');
                script.type = 'text/javascript';
                script.async = true;
                script.src = `https://widget.intercom.io/widget/${appId}`;
                script.onload = () => {
                    if (w.Intercom) {
                        w.Intercom('boot', settings);
                        // Check if we need to auto-open Intercom from URL parameter
                        const params = new URLSearchParams(window.location.search);
                        if (params.get('open_support') === 'true') {
                            setTimeout(() => {
                                w.Intercom('show');
                            }, 500);
                        }
                    }
                };
                document.body.appendChild(script);
            }
        };
        // Load and boot
        if (document.readyState === 'complete') {
            loadIntercom();
        }
        else {
            window.addEventListener('load', loadIntercom);
        }
        // If already loaded, boot now
        if (window.Intercom && typeof window.Intercom === 'function') {
            window.Intercom('boot', settings);
            // Check if we need to auto-open Intercom from URL parameter
            const params = new URLSearchParams(window.location.search);
            if (params.get('open_support') === 'true') {
                setTimeout(() => {
                    window.Intercom('show');
                }, 500);
            }
        }
        // Cleanup
        return () => {
            window.removeEventListener('load', loadIntercom);
            if (window.Intercom) {
                window.Intercom('shutdown');
            }
        };
    }, [appId]);
    return null;
}
export default IntercomWithAuth;
//# sourceMappingURL=IntercomWithAuth.js.map
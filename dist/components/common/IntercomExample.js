import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { tokenManager } from '../../auth/tokenManager';
import IntercomWithAuth from './IntercomWithAuth';
/**
 * Example component demonstrating how to use the IntercomWithAuth component
 * This shows proper integration patterns for different parts of the application
 */
export function IntercomExample({ pageName, showFeatures = false }) {
    const [isHelpVisible, setIsHelpVisible] = useState(false);
    const [userEmail, setUserEmail] = useState(null);
    // Get user email on component mount
    useEffect(() => {
        const email = tokenManager.getUserEmail();
        setUserEmail(email);
    }, []);
    // Toggle help visibility
    const toggleHelp = () => {
        setIsHelpVisible(prev => !prev);
    };
    return (_jsxs("div", { className: "relative", children: [_jsxs("div", { className: "p-4 bg-white rounded-lg shadow-sm", children: [_jsxs("div", { className: "flex items-center justify-between mb-4", children: [_jsx("h2", { className: "text-lg font-medium text-gray-800", children: "Intercom Integration Example" }), _jsxs("button", { className: "flex items-center px-3 py-2 text-sm font-medium text-white bg-[#5E33FF] rounded-md hover:bg-[#4926cc] transition-colors", onClick: toggleHelp, children: [_jsx("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-4 w-4 mr-2", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" }) }), "Need Help?"] })] }), _jsx("div", { className: "text-sm text-gray-600", children: userEmail ? (_jsxs("p", { children: ["Currently logged in as: ", _jsx("span", { className: "font-medium", children: userEmail })] })) : (_jsx("p", { children: "Not currently logged in. Intercom will show in anonymous mode." })) }), showFeatures && (_jsxs("div", { className: "mt-4 bg-gray-50 p-3 rounded-md", children: [_jsx("h3", { className: "font-medium text-gray-700 mb-2", children: "Key Intercom Features" }), _jsxs("ul", { className: "list-disc list-inside space-y-1 text-gray-600 text-sm", children: [_jsx("li", { children: "Automatic user identification from JWT token" }), _jsx("li", { children: "Page context passed to support team" }), _jsx("li", { children: "Clean React integration with proper cleanup" }), _jsx("li", { children: "Fallback to anonymous mode when not logged in" })] })] }))] }), _jsx(IntercomWithAuth, { appId: "u3ugv8d2", customAttributes: {
                    page: pageName,
                    feature_viewed: showFeatures ? "intercom_features" : undefined,
                    last_action: isHelpVisible ? "clicked_help" : "viewing_page"
                } })] }));
}
export default IntercomExample;
//# sourceMappingURL=IntercomExample.js.map
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';
const Notification = ({ message, type, isVisible, onClose }) => {
    useEffect(() => {
        if (isVisible) {
            const timer = setTimeout(() => {
                onClose();
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [isVisible, onClose]);
    const getIcon = () => {
        switch (type) {
            case 'success':
                return _jsx(CheckCircle, { className: "w-5 h-5 text-gray-500" });
            case 'error':
                return _jsx(XCircle, { className: "w-5 h-5 text-red-500" });
            case 'info':
                return _jsx(AlertCircle, { className: "w-5 h-5 text-gray-500" });
        }
    };
    const getBackgroundColor = () => {
        switch (type) {
            case 'success':
                return 'bg-gray-50 border-gray-500';
            case 'error':
                return 'bg-red-50 border-red-500';
            case 'info':
                return 'bg-gray-50 border-gray-500';
        }
    };
    return (_jsx(AnimatePresence, { children: isVisible && (_jsx(motion.div, { initial: { x: 300, opacity: 0 }, animate: { x: 0, opacity: 1 }, exit: { x: 300, opacity: 0 }, transition: { type: "spring", stiffness: 300, damping: 30 }, className: "fixed top-5 right-5 z-50", children: _jsx("div", { className: `rounded-lg shadow-lg p-4 border-l-4 ${getBackgroundColor()} max-w-md`, children: _jsxs("div", { className: "flex items-center space-x-3", children: [getIcon(), _jsx("p", { className: "text-gray-700", children: message })] }) }) })) }));
};
export default Notification;
//# sourceMappingURL=Notification.js.map
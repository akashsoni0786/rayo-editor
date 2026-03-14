import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { motion } from 'framer-motion';
export default function ConfirmationModal({ isOpen, onClose, onConfirm, title, message, icon, confirmText = 'Confirm', cancelText = 'Cancel', confirmColor = 'red', isLoading = false, loadingText = 'Processing...' }) {
    const handleClose = () => {
        onClose();
    };
    const handleBackdropClick = () => {
        onClose();
    };
    const handleXClick = () => {
        onClose();
    };
    const handleConfirm = () => {
        onConfirm();
    };
    console.log('ConfirmationModal render:', { isOpen, title });
    const confirmStyles = {
        red: 'bg-red-600-700 focus:ring-red-500',
        indigo: 'bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500'
    };
    if (typeof document === 'undefined') {
        return null;
    }
    if (!isOpen)
        return null;
    return createPortal(_jsx("div", { className: "fixed inset-0 flex items-center justify-center", style: {
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 999999,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(8px)'
        }, onClick: handleBackdropClick, children: _jsxs("div", { onClick: (e) => e.stopPropagation(), className: "bg-white rounded-xl max-w-md w-full mx-4 p-6 relative shadow-2xl", style: {
                zIndex: 1000000,
                position: 'relative'
            }, children: [_jsx("div", { className: "absolute top-4 right-4", children: _jsx("button", { onClick: handleXClick, className: "p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100", children: _jsx(X, { className: "h-5 w-5" }) }) }), _jsxs("div", { className: "text-center mb-6", children: [icon && (_jsx("div", { className: "mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4", children: icon })), _jsx("h3", { className: "text-lg font-semibold text-gray-900 mb-2", children: title }), _jsx("p", { className: "text-gray-600", children: message })] }), _jsxs("div", { className: "flex flex-col sm:flex-row justify-center gap-3", children: [_jsx("button", { onClick: handleClose, disabled: isLoading, className: "px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors w-full sm:w-auto disabled:opacity-50", children: cancelText }), _jsx("button", { onClick: handleConfirm, disabled: isLoading, className: `px-4 py-2 text-[#D43F35] rounded-lg bg-[#FCE0E0] transition-colors flex items-center justify-center w-full sm:w-auto disabled:opacity-50 ${confirmStyles[confirmColor]}`, children: isLoading ? (_jsxs(_Fragment, { children: [_jsx(motion.div, { animate: { rotate: 360 }, transition: { duration: 1, repeat: Infinity, ease: "linear" }, className: "w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" }), loadingText] })) : (confirmText) })] })] }) }), document.body);
}
//# sourceMappingURL=ConfirmationModal.js.map
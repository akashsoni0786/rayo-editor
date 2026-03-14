import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Trash2 } from 'lucide-react';
export default function DeleteModal({ isOpen, onClose, onConfirm, projectName, isLoading = false }) {
    // Handle escape key and body scroll
    useEffect(() => {
        if (isOpen) {
            const handleEscape = (e) => {
                if (e.key === 'Escape')
                    onClose();
            };
            document.addEventListener('keydown', handleEscape);
            document.body.style.overflow = 'hidden';
            return () => {
                document.removeEventListener('keydown', handleEscape);
                document.body.style.overflow = '';
            };
        }
    }, [isOpen, onClose]);
    if (!isOpen)
        return null;
    return createPortal(_jsxs("div", { className: "fixed inset-0 z-[10000] flex items-center justify-center p-4", children: [_jsx("div", { className: "absolute inset-0 bg-black/50 backdrop-blur-sm", onClick: (e) => {
                    e.stopPropagation();
                    onClose();
                } }), _jsxs("div", { className: "relative bg-white rounded-xl max-w-md w-full p-6 shadow-2xl", children: [_jsx("button", { onClick: (e) => {
                            e.stopPropagation();
                            onClose();
                        }, className: "absolute top-4 right-4 p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100", children: _jsx(X, { className: "h-5 w-5" }) }), _jsxs("div", { className: "text-center mb-6", children: [_jsx("div", { className: "mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4", children: _jsx(Trash2, { className: "w-6 h-6 text-red-600" }) }), _jsx("h3", { className: "text-lg font-semibold text-gray-900 mb-2", children: "Delete Project" }), _jsxs("p", { className: "text-gray-600", children: ["Are you sure you want to delete ", _jsxs("span", { className: "font-medium", children: ["\"", projectName, "\""] }), "? This action cannot be undone."] })] }), _jsxs("div", { className: "flex flex-col sm:flex-row gap-3", children: [_jsx("button", { onClick: (e) => {
                                    e.stopPropagation();
                                    onClose();
                                }, disabled: isLoading, className: "flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50", children: "Cancel" }), _jsx("button", { onClick: (e) => {
                                    e.stopPropagation();
                                    onConfirm();
                                }, disabled: isLoading, className: "flex-1 px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center", children: isLoading ? (_jsxs(_Fragment, { children: [_jsx("div", { className: "w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" }), "Deleting..."] })) : ('Delete Project') })] })] })] }), document.body);
}
//# sourceMappingURL=DeleteModal.js.map
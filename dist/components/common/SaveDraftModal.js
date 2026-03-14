import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate, useParams } from "react-router-dom";
import { DI } from "@/core/DependencyInjection";
import toast from "react-hot-toast";
function SaveDraftModal({ isOpen, onClose, onCloseModal, onConfirm, title, message, icon, confirmText = "Confirm", cancelText = "Cancel", confirmColor = "red", isLoading = false, loadingText = "Processing...", request, currentTitle, }) {
    const { projectId, blogId } = useParams();
    const [blogTitle, setBlogTitle] = useState(currentTitle ?? "");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const navigate = useNavigate();
    const handleClose = () => {
        onClose();
        setBlogTitle("");
        setError("");
        setLoading(false);
        navigate(`/project/${projectId}/blog`);
    };
    const handleBackdropClick = () => {
        onClose();
    };
    const handleXClick = () => {
        onCloseModal();
    };
    const handleConfirm = () => {
        onConfirm();
    };
    const handleSaveTitle = () => {
        if (blogTitle?.trim()) {
            if (request) {
                setLoading(true);
                request
                    .PUT(`/api/v1/projects/${projectId}/blog/check-untitled/${blogId}`, {
                    title: blogTitle?.trim(),
                    is_active: true,
                })
                    .then((res) => {
                    if (res?.status === "success") {
                        handleClose();
                    }
                    else {
                        toast.error("Unable to save title!");
                    }
                })
                    .finally(() => {
                    setLoading(false);
                });
            }
        }
        else {
            setError("Enter valid title!");
        }
    };
    console.log("ConfirmationModal render:", { isOpen, title });
    const confirmStyles = {
        red: "bg-red-600-700 focus:ring-red-500",
        indigo: "bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500",
    };
    if (typeof document === "undefined") {
        return null;
    }
    if (!isOpen)
        return null;
    return createPortal(_jsx("div", { className: "fixed inset-0 flex items-center justify-center", style: {
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 999999,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            backdropFilter: "blur(8px)",
        }, onClick: handleBackdropClick, children: _jsxs("div", { onClick: (e) => e.stopPropagation(), className: "bg-white rounded-xl max-w-md w-[348px] mx-4 p-6 relative shadow-2xl", style: {
                zIndex: 1000000,
                position: "relative",
            }, children: [_jsx("div", { className: "absolute top-4 right-4", children: _jsx("button", { onClick: handleXClick, className: "p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100", children: _jsx(X, { className: "h-5 w-5" }) }) }), _jsxs("div", { className: "text-center mb-3", children: [icon && (_jsx("div", { className: "mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4", children: icon })), _jsx("h3", { className: "text-lg font-semibold text-gray-900 ", children: "This blog is untitled" }), _jsx("p", { className: "text-gray-600", children: "Add a title to prevent losing this blog" })] }), _jsxs("div", { className: "mb-3", children: [_jsx("input", { id: "projectUrl", type: "url", value: blogTitle, onChange: (e) => {
                                setError("");
                                setBlogTitle(e.target.value);
                            }, className: `bg-[#F2F3F7] text-[#182234] w-full pl-3 pr-3 py-1 border
               ${error != "" ? "border-[#B12E26]" : "border-gray-300"} rounded-[10px] shadow-sm focus:outline-none focus:ring-1`, disabled: loading, placeholder: "Enter blog title" }), error != "" && (_jsx("p", { style: {
                                color: "#B12E26",
                                fontSize: "12px",
                            }, children: error }))] }), _jsxs("div", { className: "flex flex-col sm:flex-row justify-center gap-3", children: [_jsx("button", { onClick: handleSaveTitle, disabled: isLoading, className: `px-4 py-2 text-[#fff] rounded-lg bg-[${confirmColor}] transition-colors flex items-center justify-center w-full sm:w-auto disabled:opacity-50 ${confirmStyles[confirmColor]}`, children: isLoading ? (_jsxs(_Fragment, { children: [_jsx(motion.div, { animate: { rotate: 360 }, transition: { duration: 1, repeat: Infinity, ease: "linear" }, className: "w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" }), loadingText] })) : (confirmText) }), _jsx("button", { onClick: handleClose, disabled: loading, className: "px-4 py-2 text-[#D43F35] bg-[#FCE0E0] rounded-lg transition-colors w-full sm:w-auto disabled:opacity-50", children: cancelText })] })] }) }), document.body);
}
export default DI(SaveDraftModal);
//# sourceMappingURL=SaveDraftModal.js.map
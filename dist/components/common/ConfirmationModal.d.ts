import React from 'react';
interface ConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    icon?: React.ReactNode;
    confirmText?: string;
    cancelText?: string;
    confirmColor?: 'red' | 'indigo';
    isLoading?: boolean;
    loadingText?: string;
}
export default function ConfirmationModal({ isOpen, onClose, onConfirm, title, message, icon, confirmText, cancelText, confirmColor, isLoading, loadingText }: ConfirmationModalProps): React.ReactPortal | null;
export {};
//# sourceMappingURL=ConfirmationModal.d.ts.map
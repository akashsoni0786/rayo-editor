import { default as React } from 'react';
interface SimpleModalProps {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
    className?: string;
    hideBackdrop?: boolean;
}
export declare function SimpleModal({ isOpen, onClose, children, className, hideBackdrop }: SimpleModalProps): React.ReactPortal;
export {};
//# sourceMappingURL=simple-modal.d.ts.map
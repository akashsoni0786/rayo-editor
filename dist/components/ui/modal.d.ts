import { default as React } from 'react';
interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
    title?: string;
    size?: 'sm' | 'md' | 'lg' | 'xl';
}
export declare function Modal({ isOpen, onClose, children, title, size }: ModalProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=modal.d.ts.map
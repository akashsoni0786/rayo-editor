import { ReactNode } from 'react';
interface SuccessPopupProps {
    message?: ReactNode;
    isOpen: boolean;
    onClose: () => void;
    buttonText?: string;
    showConfetti?: boolean;
}
declare function SuccessPopup({ message, isOpen, onClose, buttonText, showConfetti }: SuccessPopupProps): import("react/jsx-runtime").JSX.Element;
export default SuccessPopup;
//# sourceMappingURL=SuccessPopup.d.ts.map
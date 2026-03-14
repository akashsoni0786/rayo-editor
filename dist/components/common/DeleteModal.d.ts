import React from 'react';
interface DeleteModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    projectName: string;
    isLoading?: boolean;
}
export default function DeleteModal({ isOpen, onClose, onConfirm, projectName, isLoading }: DeleteModalProps): React.ReactPortal | null;
export {};
//# sourceMappingURL=DeleteModal.d.ts.map
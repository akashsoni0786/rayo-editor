import React from 'react';
import { ReviewButtonsProps } from '@/types/editor.types';

const AcceptIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <path d="M9 15.75C5.27175 15.75 2.25 12.7282 2.25 9C2.25 5.27175 5.27175 2.25 9 2.25C12.7282 2.25 15.75 5.27175 15.75 9C15.75 12.7282 12.7282 15.75 9 15.75Z" stroke="white" strokeWidth="1.5"/>
    <path d="M12 7.5L8.25 11.25L6 9" stroke="white" strokeWidth="1.5"/>
  </svg>
);

const RejectIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <path d="M2.25 15.75V2.25H12.5325L15.75 5.4675V15.75H2.25ZM5.99625 2.25V5.99625M5.99625 2.25H11.9962M11.9962 2.25V5.99625M5.25 15.75V9H12.75V15.75" stroke="#AFB0B6" strokeWidth="1.5"/>
  </svg>
);

export const ReviewButtons: React.FC<ReviewButtonsProps> = ({ onAccept, onReject, position }) => {
  return (
    <div
      className="fixed flex gap-2 z-50"
      style={{ top: `${position.top}px`, left: `${position.left}px` }}
      data-testid="review-buttons"
    >
      <button
        onClick={onAccept}
        className="p-2 bg-green-500 rounded hover:bg-green-600"
        title="Accept changes"
        data-testid="accept-button"
      >
        <AcceptIcon />
      </button>
      <button
        onClick={onReject}
        className="p-2 bg-red-500 rounded hover:bg-red-600"
        title="Reject changes"
        data-testid="reject-button"
      >
        <RejectIcon />
      </button>
    </div>
  );
};

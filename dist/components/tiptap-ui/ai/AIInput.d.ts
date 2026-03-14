import { default as React } from 'react';
interface AIInputProps {
    value: string;
    onChange: (value: string) => void;
    onSubmit: () => void;
    onKeyDown?: (e: React.KeyboardEvent) => void;
    placeholder?: string;
    disabled?: boolean;
}
export declare const AIInput: React.FC<AIInputProps>;
export {};
//# sourceMappingURL=AIInput.d.ts.map
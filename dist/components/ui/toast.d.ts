import { ReactNode } from 'react';
interface Toast {
    id: string;
    title: string;
    description?: string;
    variant?: "default" | "destructive";
}
export declare function ToastProvider({ children }: {
    children: ReactNode;
}): import("react/jsx-runtime").JSX.Element;
export declare function useToast(): {
    toast: (toast: Omit<Toast, "id">) => void;
};
export {};
//# sourceMappingURL=toast.d.ts.map
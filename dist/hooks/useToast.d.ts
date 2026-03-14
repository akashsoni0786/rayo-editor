export interface ToastOptions {
    title?: string;
    description: string;
    variant?: 'default' | 'destructive';
}
export interface ToastAPI {
    toast: (options: ToastOptions) => void;
}
export declare function useToast(): ToastAPI;
//# sourceMappingURL=useToast.d.ts.map
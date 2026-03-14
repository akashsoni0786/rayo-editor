import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Component } from 'react';
import { AlertTriangle } from 'lucide-react';
export class ErrorBoundary extends Component {
    constructor() {
        super(...arguments);
        Object.defineProperty(this, "state", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: {
                hasError: false,
                error: null,
            }
        });
    }
    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }
    componentDidCatch(error, errorInfo) {
        console.error('Uncaught error:', error, errorInfo);
    }
    render() {
        if (this.state.hasError) {
            return this.props.fallback || (_jsxs("div", { className: "flex flex-col items-center justify-center p-8 bg-red-50 rounded-lg", children: [_jsx(AlertTriangle, { className: "w-12 h-12 text-red-500 mb-4" }), _jsx("h2", { className: "text-xl font-semibold text-red-700 mb-2", children: "Something went wrong" }), _jsx("p", { className: "text-red-600 mb-4", children: this.state.error?.message || 'An unexpected error occurred' }), _jsx("button", { onClick: () => this.setState({ hasError: false, error: null }), className: "px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700", children: "Try again" })] }));
        }
        return this.props.children;
    }
}
//# sourceMappingURL=ErrorBoundary.js.map
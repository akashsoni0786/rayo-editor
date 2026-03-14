import { Variants, HTMLMotionProps } from 'framer-motion';
import { ReactNode } from 'react';
export declare const easeOutQuint: number[];
interface BaseTransitionProps {
    children: ReactNode;
    duration?: number;
    delay?: number;
    className?: string;
    style?: React.CSSProperties;
}
interface TransitionProps extends BaseTransitionProps, Omit<HTMLMotionProps<"div">, keyof BaseTransitionProps> {
}
export declare const fadeInVariants: Variants;
export declare const slideUpVariants: Variants;
export declare const slideDownVariants: Variants;
export declare const slideLeftVariants: Variants;
export declare const slideRightVariants: Variants;
export declare const scaleVariants: Variants;
export declare const staggerChildrenVariants: Variants;
export declare const staggerItemVariants: Variants;
export declare function FadeIn({ children, duration, delay, className, style, ...motionProps }: TransitionProps): import("react/jsx-runtime").JSX.Element;
export declare function SlideUp({ children, duration, delay, className, style, ...motionProps }: TransitionProps): import("react/jsx-runtime").JSX.Element;
export declare function SlideDown({ children, duration, delay, className, style, ...motionProps }: TransitionProps): import("react/jsx-runtime").JSX.Element;
export declare function SlideLeft({ children, duration, delay, className, style, ...motionProps }: TransitionProps): import("react/jsx-runtime").JSX.Element;
export declare function SlideRight({ children, duration, delay, className, style, ...motionProps }: TransitionProps): import("react/jsx-runtime").JSX.Element;
export declare function Scale({ children, duration, delay, className, style, ...motionProps }: TransitionProps): import("react/jsx-runtime").JSX.Element;
export declare function StaggerContainer({ children, duration, delay, className, style, staggerDelay, ...motionProps }: TransitionProps & {
    staggerDelay?: number;
}): import("react/jsx-runtime").JSX.Element;
export declare function StaggerItem({ children, duration, className, style, ...motionProps }: Omit<TransitionProps, 'delay'>): import("react/jsx-runtime").JSX.Element;
export declare function useCustomTransition(): {
    triggerFade: (element: HTMLElement) => void;
    easeOutQuint: number[];
};
export declare function withTransition<T extends object>(Component: React.ComponentType<T>, transitionType?: 'fadeIn' | 'slideUp' | 'slideDown' | 'slideLeft' | 'slideRight' | 'scale', duration?: number): (props: T & {
    delay?: number;
    className?: string;
}) => import("react/jsx-runtime").JSX.Element;
export declare const globalTransitionStyles = "\n  .fadeIn {\n    -webkit-animation-name: fadeIn;\n    animation-name: fadeIn;\n    -webkit-animation-duration: 500ms;\n    animation-duration: 500ms;\n    -webkit-animation-fill-mode: both;\n    animation-fill-mode: both;\n    animation-timing-function: cubic-bezier(0.23, 1, 0.32, 1);\n    -webkit-animation-timing-function: cubic-bezier(0.23, 1, 0.32, 1);\n  }\n\n  @-webkit-keyframes fadeIn {\n    0% { opacity: 0; }\n    100% { opacity: 1; }\n  }\n\n  @keyframes fadeIn {\n    0% { opacity: 0; }\n    100% { opacity: 1; }\n  }\n";
export {};
//# sourceMappingURL=Transitions.d.ts.map
import { ComponentPropsWithoutRef } from 'react';
export interface AnimatedGradientTextProps extends ComponentPropsWithoutRef<"span"> {
    speed?: "slow" | "normal" | "fast";
    pauseOnHover?: boolean;
    pause?: boolean;
}
export declare function AnimatedGradientText({ children, className, speed, pauseOnHover, pause, ...props }: AnimatedGradientTextProps): import("react/jsx-runtime").JSX.Element;
export { AnimatedGradientText as BrandGradientText };
export default AnimatedGradientText;
//# sourceMappingURL=AnimatedGradientText.d.ts.map
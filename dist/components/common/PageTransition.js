import { jsx as _jsx } from "react/jsx-runtime";
import { motion } from 'framer-motion';
// Custom easing function: cubic-bezier(0.23, 1, 0.32, 1) - ease-out quint
const easeOutQuint = [0.23, 1, 0.32, 1];
const fadeInVariants = {
    initial: {
        opacity: 0
    },
    animate: {
        opacity: 1
    },
    exit: {
        opacity: 0
    }
};
function PageTransition({ children, duration = 0.5, className = "w-full h-full", style }) {
    return (_jsx(motion.div, { initial: "initial", animate: "animate", exit: "exit", variants: fadeInVariants, transition: {
            duration,
            ease: easeOutQuint,
            fill: 'both'
        }, className: className, style: style, children: children }));
}
export default PageTransition;
//# sourceMappingURL=PageTransition.js.map
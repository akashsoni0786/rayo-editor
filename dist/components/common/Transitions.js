import { jsx as _jsx } from "react/jsx-runtime";
import { motion } from 'framer-motion';
// Custom easing function: cubic-bezier(0.23, 1, 0.32, 1) - ease-out quint
export const easeOutQuint = [0.23, 1, 0.32, 1];
// Animation Variants
export const fadeInVariants = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 }
};
export const slideUpVariants = {
    initial: {
        opacity: 0,
        y: 20
    },
    animate: {
        opacity: 1,
        y: 0
    },
    exit: {
        opacity: 0,
        y: -20
    }
};
export const slideDownVariants = {
    initial: {
        opacity: 0,
        y: -20
    },
    animate: {
        opacity: 1,
        y: 0
    },
    exit: {
        opacity: 0,
        y: 20
    }
};
export const slideLeftVariants = {
    initial: {
        opacity: 0,
        x: 20
    },
    animate: {
        opacity: 1,
        x: 0
    },
    exit: {
        opacity: 0,
        x: -20
    }
};
export const slideRightVariants = {
    initial: {
        opacity: 0,
        x: -20
    },
    animate: {
        opacity: 1,
        x: 0
    },
    exit: {
        opacity: 0,
        x: 20
    }
};
export const scaleVariants = {
    initial: {
        opacity: 0,
        scale: 0.95
    },
    animate: {
        opacity: 1,
        scale: 1
    },
    exit: {
        opacity: 0,
        scale: 0.95
    }
};
export const staggerChildrenVariants = {
    initial: { opacity: 0 },
    animate: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.1
        }
    },
    exit: { opacity: 0 }
};
export const staggerItemVariants = {
    initial: {
        opacity: 0,
        y: 20
    },
    animate: {
        opacity: 1,
        y: 0
    },
    exit: {
        opacity: 0,
        y: -10
    }
};
// Default transition configuration
const createTransition = (duration = 0.5, delay = 0) => ({
    duration,
    delay,
    ease: easeOutQuint,
    fill: 'both'
});
// 1. FadeIn Component
export function FadeIn({ children, duration = 0.5, delay = 0, className = "", style, ...motionProps }) {
    return (_jsx(motion.div, { initial: "initial", animate: "animate", exit: "exit", variants: fadeInVariants, transition: createTransition(duration, delay), className: className, style: style, ...motionProps, children: children }));
}
// 2. SlideUp Component
export function SlideUp({ children, duration = 0.5, delay = 0, className = "", style, ...motionProps }) {
    return (_jsx(motion.div, { initial: "initial", animate: "animate", exit: "exit", variants: slideUpVariants, transition: createTransition(duration, delay), className: className, style: style, ...motionProps, children: children }));
}
// 3. SlideDown Component
export function SlideDown({ children, duration = 0.5, delay = 0, className = "", style, ...motionProps }) {
    return (_jsx(motion.div, { initial: "initial", animate: "animate", exit: "exit", variants: slideDownVariants, transition: createTransition(duration, delay), className: className, style: style, ...motionProps, children: children }));
}
// 4. SlideLeft Component
export function SlideLeft({ children, duration = 0.5, delay = 0, className = "", style, ...motionProps }) {
    return (_jsx(motion.div, { initial: "initial", animate: "animate", exit: "exit", variants: slideLeftVariants, transition: createTransition(duration, delay), className: className, style: style, ...motionProps, children: children }));
}
// 5. SlideRight Component
export function SlideRight({ children, duration = 0.5, delay = 0, className = "", style, ...motionProps }) {
    return (_jsx(motion.div, { initial: "initial", animate: "animate", exit: "exit", variants: slideRightVariants, transition: createTransition(duration, delay), className: className, style: style, ...motionProps, children: children }));
}
// 6. Scale Component
export function Scale({ children, duration = 0.5, delay = 0, className = "", style, ...motionProps }) {
    return (_jsx(motion.div, { initial: "initial", animate: "animate", exit: "exit", variants: scaleVariants, transition: createTransition(duration, delay), className: className, style: style, ...motionProps, children: children }));
}
// 7. Stagger Container Component
export function StaggerContainer({ children, duration = 0.5, delay = 0, className = "", style, staggerDelay = 0.1, ...motionProps }) {
    return (_jsx(motion.div, { initial: "initial", animate: "animate", exit: "exit", variants: {
            ...staggerChildrenVariants,
            animate: {
                opacity: 1,
                transition: {
                    staggerChildren: staggerDelay,
                    delayChildren: delay,
                    duration
                }
            }
        }, className: className, style: style, ...motionProps, children: children }));
}
// 8. Stagger Item Component (to be used inside StaggerContainer)
export function StaggerItem({ children, duration = 0.5, className = "", style, ...motionProps }) {
    return (_jsx(motion.div, { variants: staggerItemVariants, transition: createTransition(duration), className: className, style: style, ...motionProps, children: children }));
}
// 9. Custom Transition Hook for manual control
export function useCustomTransition() {
    const triggerFade = (element) => {
        element.style.animation = 'none';
        void element.offsetWidth; // Force reflow
        element.style.animation = `fadeIn 500ms ${easeOutQuint.join(', ')} both`;
    };
    return { triggerFade, easeOutQuint };
}
// 10. Higher Order Component for any element
export function withTransition(Component, transitionType = 'fadeIn', duration = 0.5) {
    return function TransitionWrapper(props) {
        const { delay = 0, className = "", ...componentProps } = props;
        const TransitionComponent = {
            fadeIn: FadeIn,
            slideUp: SlideUp,
            slideDown: SlideDown,
            slideLeft: SlideLeft,
            slideRight: SlideRight,
            scale: Scale
        }[transitionType];
        return (_jsx(TransitionComponent, { duration: duration, delay: delay, className: className, children: _jsx(Component, { ...componentProps }) }));
    };
}
// CSS-in-JS style for global CSS if needed
export const globalTransitionStyles = `
  .fadeIn {
    -webkit-animation-name: fadeIn;
    animation-name: fadeIn;
    -webkit-animation-duration: 500ms;
    animation-duration: 500ms;
    -webkit-animation-fill-mode: both;
    animation-fill-mode: both;
    animation-timing-function: cubic-bezier(0.23, 1, 0.32, 1);
    -webkit-animation-timing-function: cubic-bezier(0.23, 1, 0.32, 1);
  }

  @-webkit-keyframes fadeIn {
    0% { opacity: 0; }
    100% { opacity: 1; }
  }

  @keyframes fadeIn {
    0% { opacity: 0; }
    100% { opacity: 1; }
  }
`;
//# sourceMappingURL=Transitions.js.map
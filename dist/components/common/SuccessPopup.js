import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LottieAnimation } from '../shared/LottieAnimation';
function SuccessPopup({ message, isOpen, onClose, buttonText = 'Okay', showConfetti = true }) {
    const [showLottieConfetti, setShowLottieConfetti] = useState(false);
    // Show Lottie confetti when modal opens
    useEffect(() => {
        if (isOpen && showConfetti) {
            setShowLottieConfetti(true);
            // Hide confetti after animation completes (adjust timing as needed)
            const timer = setTimeout(() => {
                setShowLottieConfetti(false);
            }, 4000); // 4 seconds duration
            return () => clearTimeout(timer);
        }
        else {
            setShowLottieConfetti(false);
        }
    }, [isOpen, showConfetti]);
    return (_jsx(AnimatePresence, { children: isOpen && (_jsxs("div", { className: "fixed inset-0 flex items-center justify-center z-50 overflow-hidden", children: [showLottieConfetti && (_jsx("div", { className: "fixed inset-0 z-[60] pointer-events-none", children: _jsx(LottieAnimation, { src: "/lottie/Confetti.lottie", width: "100vw", height: "100vh", autoplay: true, loop: false, speed: 1, className: "w-full h-full", style: {
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            zIndex: 60
                        } }) })), _jsx(motion.div, { className: "fixed inset-0 bg-black/30", initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } }), _jsx(motion.div, { className: "bg-white rounded-[16px] shadow-[0px_4px_30px_rgba(26,28,33,0.05)] relative flex flex-col items-center justify-center\r\n                     p-6\r\n                       max-w-[320px] sm:max-w-[400px] md:max-w-[480px] lg:max-w-[560px]\r\n                       z-[70]", style: { zIndex: 70 }, initial: { opacity: 0, y: 20, scale: 0.95 }, animate: { opacity: 1, y: 0, scale: 1 }, exit: { opacity: 0, y: -20, scale: 0.95 }, transition: {
                        type: "spring",
                        duration: 0.5,
                        bounce: 0.2
                    }, children: _jsxs("div", { className: "flex flex-col items-center justify-start gap-6 sm:gap-8 md:gap-10 lg:gap-12", children: [_jsx("div", { className: "flex items-center justify-center \r\n                             w-16 h-16 \r\n                             sm:w-20 sm:h-20 \r\n                             md:w-24 md:h-24 \r\n                             lg:w-[92px] lg:h-[87px]", children: _jsx("img", { src: "https://cdn.rayo.work/Rayo_assests/Asset_2_2x_2_q3ef1h.png", alt: "Success celebration icon", className: "w-full h-full object-contain", loading: "lazy" }) }), _jsx("div", { className: "flex flex-col items-center justify-start gap-4 sm:gap-5 md:gap-6 lg:gap-5", children: message ? (_jsx("div", { className: "text-center text-[#182234] font-normal leading-normal break-words\r\n                                 text-sm sm:text-base md:text-base lg:text-[16px]\r\n                                 leading-5 sm:leading-6 md:leading-6 lg:leading-6\r\n                                 w-full max-w-[280px] sm:max-w-[320px] md:max-w-[360px] lg:max-w-[400px]\r\n                                 whitespace-pre-line", children: message })) : (_jsxs(_Fragment, { children: [_jsxs("div", { className: "text-center text-[#182234]  font-semibold leading-tight break-words\r\n                                   text-lg sm:text-xl md:text-2xl lg:text-[28px]\r\n                                   sm:leading-6 md:leading-7 lg:leading-[34px]", children: ["Write up to 10 free blogs,", _jsx("br", {}), "everyday!"] }), _jsx("div", { className: "text-center text-[rgba(24,34,52,0.65)]  font-normal leading-normal break-words\r\n                                   text-sm sm:text-base md:text-base lg:text-[16px]\r\n                                   leading-5 sm:leading-6 md:leading-6 lg:leading-6\r\n                                   w-full max-w-[280px] sm:max-w-[320px] md:max-w-[360px] lg:max-w-[400px]", children: "Your wallet will get magically refilled every 12 hrs with $10 in credits." })] })) }), _jsx("button", { onClick: onClose, className: "bg-[#5E33FF] hover:bg-[#4924e3] text-white  font-medium leading-6 rounded-[10px] \r\n                          transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#5E33FF] focus:ring-opacity-50\r\n                          flex items-center justify-center gap-2\r\n                          py-2 px-3 text-xs\r\n                          sm:py-2.5 sm:px-4 sm:text-sm\r\n                          md:py-2.5 md:px-6 md:text-sm  \r\n                          lg:py-2.5 lg:px-8 lg:text-[14px]\r\n                          w-full max-w-[280px] sm:max-w-[320px] md:max-w-[360px] lg:max-w-[432px]", children: buttonText })] }) })] })) }));
}
export default SuccessPopup;
//# sourceMappingURL=SuccessPopup.js.map
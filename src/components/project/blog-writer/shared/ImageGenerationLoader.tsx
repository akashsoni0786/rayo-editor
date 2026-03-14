import React from 'react';
import { FaCertificate } from 'react-icons/fa';

interface ImageGenerationLoaderProps {
  progress?: number;
  phase?: string;
}

const ImageGenerationLoader: React.FC<ImageGenerationLoaderProps> = ({
  progress = 0,
  phase = ''
}) => {
  return (
    <div
      className="w-full h-full"
      style={{ minHeight: '241.21px' }}
    >
      {/* Image Placeholder / Loader Area */}
      <div
        className="relative w-full h-full rounded-xl overflow-hidden shadow-sm"
      >
        {/* 1. Base Background (Checkerboard) */}
        <div className="absolute inset-0 checkerboard-bg opacity-50"></div>

        {/* 2. The Ripple Effect Container */}
        <div className="absolute inset-0 flex items-center justify-center overflow-hidden bg-purple-50/30 backdrop-blur-[2px]">
          {/* Multiple ripples for continuous effect */}
          <div className="ripple"></div>
          <div className="ripple"></div>
          <div className="ripple"></div>
        </div>

      </div>

      {/* Footer / Status Text */}
      {/* <div className="mt-4 flex items-center gap-2 text-sm font-medium"> */}
        {/* Rotating Sparkle Icon */}
        {/* <div className="relative w-5 h-5 flex items-center justify-center">
          <FaCertificate className="text-orange-500 animate-spin-slow text-xs absolute" />
          <FaStar className="text-white text-[8px] absolute" />
        </div>

        <span className="text-purple-600">
          Generating image with <span className="text-gradient font-bold">RayoAi</span>
        </span> */}
      {/* </div> */}

      {/* Inline Styles */}
      <style>{`
        /* Checkerboard Pattern */
        .checkerboard-bg {
          background-color: #f7f7f7;
          background-image:
            linear-gradient(45deg, #ebebeb 25%, transparent 25%),
            linear-gradient(-45deg, #ebebeb 25%, transparent 25%),
            linear-gradient(45deg, transparent 75%, #ebebeb 75%),
            linear-gradient(-45deg, transparent 75%, #ebebeb 75%);
          background-size: 20px 20px;
          background-position: 0 0, 0 10px, 10px -10px, -10px 0px;
        }

        /* The Ripple Animation */
        @keyframes rippleExpand {
          0% {
            transform: translate(-50%, -50%) scale(0.2);
            opacity: 0;
          }
          20% {
            opacity: 0.9;
          }
          80% {
            opacity: 0.5;
          }
          100% {
            transform: translate(-50%, -50%) scale(2.5);
            opacity: 0;
          }
        }

        .ripple {
          position: absolute;
          top: 50%;
          left: 50%;
          width: 100%;
          padding-bottom: 100%;
          border-radius: 50%;
          background: radial-gradient(
            circle,
            rgba(255, 255, 255, 0.98) 0%,
            rgba(255, 255, 255, 0.9) 15%,
            rgba(255, 230, 210, 0.8) 30%,
            rgba(230, 200, 255, 0.6) 50%,
            rgba(200, 200, 255, 0.1) 70%,
            transparent 80%
          );
          transform: translate(-50%, -50%) scale(0.2);
          opacity: 0;
          animation: rippleExpand 4s linear infinite;
          pointer-events: none;
        }

        .ripple:nth-child(1) { animation-delay: 0s; }
        .ripple:nth-child(2) { animation-delay: 1.3s; }
        .ripple:nth-child(3) { animation-delay: 2.6s; }

        /* Spinner animation for the footer icon */
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 3s linear infinite;
        }

        /* Gradient Text for "RayoAi" */
        .text-gradient {
          background: linear-gradient(to right, #8b5cf6, #f472b6);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
      `}</style>
    </div>
  );
};

export default ImageGenerationLoader;

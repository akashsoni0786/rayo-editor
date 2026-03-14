import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface StreamingProgressOverlayProps {
  progress: number;
  phase: string;
  contentWords: number;
}

const statusMessages = [
  'Preparing your content...',
  'Researching your topic...',
  'Crafting engaging content...',
  'Optimizing for readability...',
  'Adding finishing touches...',
];

const StreamingProgressOverlay: React.FC<StreamingProgressOverlayProps> = ({
  progress,
  phase,
  contentWords,
}) => {
  const [messageIndex, setMessageIndex] = useState(0);

  // Cycle through messages every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % statusMessages.length);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-center justify-center"
    >
      <div className="text-center p-8 max-w-md flex flex-col items-center">
        {/* Progress container with image */}
        <div className="relative w-32 h-32 mx-auto mb-4">
          {/* Background image */}
          <img
            src="https://cdn.rayo.work/Rayo_assests/Checkmark%20Container.png"
            alt="Progress"
            className="w-full h-full object-contain"
          />
          {/* Progress percentage overlay */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-3xl font-bold text-white">
              {progress}%
            </span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-56 h-[6px] mx-auto mb-6 bg-[#E7E7E7] rounded-[40px] overflow-hidden">
          <motion.div
            className="h-full rounded-[40px]"
            style={{
              background: 'linear-gradient(90deg, #FFF4A3 0%, #FF5900 39%, #5E33FF 78%, #AE98FF 100%)'
            }}
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </div>

        {/* Status text - cycling messages */}
        <div className="h-6 mb-4 overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={messageIndex}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="text-gray-600 font-medium"
            >
              {statusMessages[messageIndex]}
            </motion.div>
          </AnimatePresence>
        </div>

        
        

      </div>
    </motion.div>
  );
};

export default StreamingProgressOverlay;

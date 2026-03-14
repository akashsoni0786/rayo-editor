import React from 'react';
import { Computer } from 'lucide-react';

const MobileBlocker = () => {
  return (
    <div className="fixed inset-0 bg-black flex flex-col items-center justify-center p-6 text-center z-50">
      <img 
        src="https://cdn.rayo.work/Rayo_assests/logo-dark_ekilwn.svg" 
        alt="Rayo Logo" 
        className="w-40 h-40 mb-6"
      />
      <h1 className="text-2xl font-bold mb-4 text-white">Desktop Only Application</h1>
      <p className="text-white mb-6 max-w-md">
        This application is optimized for desktop use only. Please access it from a computer for the best experience.
      </p>
    </div>
  );
};

export default MobileBlocker;

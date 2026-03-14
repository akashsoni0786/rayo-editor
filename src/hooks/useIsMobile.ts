import { useState, useEffect } from 'react';

const MOBILE_BREAKPOINT = 768; // Breakpoint for mobile devices in pixels
const ENABLE_MOBILE_OVERRIDE = true; // Set to false to disable override feature

export const useIsMobile = () => {
  // Check for temporary override in localStorage
  const getOverride = () => {
    if (!ENABLE_MOBILE_OVERRIDE || typeof window === 'undefined') return null;
    const override = localStorage.getItem('mobileOverride');
    return override === 'true' ? true : override === 'false' ? false : null;
  };

  const [isMobile, setIsMobile] = useState(() => {
    const override = getOverride();
    if (override !== null) return override;
    return typeof window !== 'undefined' ? window.innerWidth < MOBILE_BREAKPOINT : false;
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const checkMobile = () => {
      const override = getOverride();
      if (override !== null) {
        setIsMobile(override);
        return;
      }
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };

    // Check on mount and add resize listener
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    // Listen for storage changes to update override
    window.addEventListener('storage', checkMobile);

    // Cleanup
    return () => {
      window.removeEventListener('resize', checkMobile);
      window.removeEventListener('storage', checkMobile);
    };
  }, []);

  return isMobile;
};

// Helper functions to set temporary override
export const setMobileOverride = (value: boolean | null) => {
  if (!ENABLE_MOBILE_OVERRIDE || typeof window === 'undefined') return;
  
  if (value === null) {
    localStorage.removeItem('mobileOverride');
  } else {
    localStorage.setItem('mobileOverride', value.toString());
  }
  
  // Trigger storage event to update all components
  window.dispatchEvent(new Event('storage'));
};

export const clearMobileOverride = () => setMobileOverride(null);

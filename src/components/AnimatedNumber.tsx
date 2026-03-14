import { useState, useEffect } from 'react';

interface AnimatedNumberProps {
  value: number;
  currency: string;
  duration?: number;
  className?: string;
}

export function AnimatedNumber({ value, currency, duration = 800, className = '' }: AnimatedNumberProps) {
  const [displayValue, setDisplayValue] = useState(value);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (displayValue === value) return;

    setIsAnimating(true);
    const startValue = displayValue;
    const difference = value - startValue;
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function for smooth animation
      const easeOutCubic = 1 - Math.pow(1 - progress, 3);
      
      const currentValue = startValue + (difference * easeOutCubic);
      setDisplayValue(currentValue);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setDisplayValue(value);
        setIsAnimating(false);
      }
    };

    requestAnimationFrame(animate);
  }, [value, duration]);

  const formatCurrency = (amount: number, currencyCode: string): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencyCode || 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <span 
      className={`${className} ${isAnimating ? 'transition-all duration-200' : ''}`}
      style={{
        transform: isAnimating ? 'scale(1.05)' : 'scale(1)',
        transformOrigin: 'left center'
      }}
    >
      {formatCurrency(displayValue, currency)}
    </span>
  );
}
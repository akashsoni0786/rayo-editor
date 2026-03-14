import { useState, useEffect, useRef } from 'react';

export function useTypingEffect(
  targetText: string,
  isActive: boolean,
  typingSpeed: number = 30
) {
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const indexRef = useRef(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastTargetRef = useRef('');

  useEffect(() => {
    if (!isActive || !targetText) {
      setDisplayedText(targetText);
      setIsTyping(false);
      return;
    }

    // If new content is longer than current, continue typing
    if (targetText !== lastTargetRef.current && targetText.startsWith(displayedText)) {
      lastTargetRef.current = targetText;
      setIsTyping(true);
      
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }

      // Start from current position
      indexRef.current = displayedText.length;
      
      intervalRef.current = setInterval(() => {
        if (indexRef.current < targetText.length) {
          setDisplayedText(targetText.slice(0, indexRef.current + 1));
          indexRef.current++;
        } else {
          setIsTyping(false);
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
        }
      }, typingSpeed);
    } else if (targetText !== lastTargetRef.current) {
      // Completely new content, start over
      lastTargetRef.current = targetText;
      setDisplayedText('');
      indexRef.current = 0;
      setIsTyping(true);

      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }

      intervalRef.current = setInterval(() => {
        if (indexRef.current < targetText.length) {
          setDisplayedText(targetText.slice(0, indexRef.current + 1));
          indexRef.current++;
        } else {
          setIsTyping(false);
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
        }
      }, typingSpeed);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [targetText, isActive, typingSpeed]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return {
    displayedText,
    isTyping
  };
}
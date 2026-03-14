import { cn } from "@/lib/utils";
import { ComponentPropsWithoutRef } from "react";

export interface AnimatedGradientTextProps
  extends ComponentPropsWithoutRef<"span"> {
  speed?: "slow" | "normal" | "fast";
  pauseOnHover?: boolean;
  pause?: boolean;
}

export function AnimatedGradientText({
  children,
  className,
  speed = "normal",
  pauseOnHover = false,
  pause = false,
  ...props
}: AnimatedGradientTextProps) {
  const speedMap = {
    slow: "8s",
    normal: "4s", 
    fast: "2s"
  };

  const animationId = `gradient-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <>
      <style>{`
        @keyframes ${animationId} {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .gradient-text-${animationId} {
          background: linear-gradient(90deg, #FF5900 0%, #5E33FF 75%, #AE98FF 100%);
          background-size: 200% 100%;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          color: transparent;
          animation: ${animationId} ${speedMap[speed]} ease infinite;
          animation-play-state: ${pause ? 'paused' : 'running'};
          display: inline-block;
        }
        .gradient-text-${animationId}:hover {
          animation-play-state: ${pauseOnHover ? 'paused' : (pause ? 'paused' : 'running')};
        }
      `}</style>
      <span
        className={cn(
          `gradient-text-${animationId}`,
          className
        )}
        {...props}
      >
        {children}
      </span>
    </>
  );
}

export { AnimatedGradientText as BrandGradientText };
export default AnimatedGradientText;
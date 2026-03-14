"use client"

import * as React from "react"
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion"

interface AnimatedToolbarButtonProps {
  children: React.ReactNode
  mouseX: any
  spring: any
  distance: number
  magnification: number
  baseSize?: number
  className?: string
}

export function AnimatedToolbarButton({
  children,
  mouseX,
  spring,
  distance,
  magnification,
  baseSize = 32,
  className,
  ref,
  ...props
}: AnimatedToolbarButtonProps & { ref?: React.Ref<HTMLDivElement> }) {
  const itemRef = React.useRef<HTMLDivElement>(null)

  const mouseDistance = useTransform(mouseX, (val) => {
    const rect = itemRef.current?.getBoundingClientRect()
    if (!rect) return distance + 1 // Default to no effect if no rect

    const itemCenterX = rect.x + rect.width / 2
    return Math.abs(val - itemCenterX)
  })

  const targetScale = useTransform(
    mouseDistance,
    [0, distance],
    [magnification, 1]
  )

  const scale = useSpring(targetScale, spring)

  return (
    <motion.div
      ref={itemRef}
      style={{
        scale,
        transformOrigin: "bottom center",
        display: "inline-block",
        position: "relative",
        zIndex: 1,
      }}
      className={className}
      whileHover={{ zIndex: 10 }}
      {...props}
    >
      {children}
    </motion.div>
  )
}
import * as React from "react"

type SpacerOrientation = "horizontal" | "vertical"

interface SpacerProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: SpacerOrientation
  size?: string | number
}

export function Spacer({
  orientation = "horizontal",
  size,
  className = "",
  style = {},
  ref,
  ...props
}: SpacerProps & { ref?: React.Ref<HTMLDivElement> }) {
  const computedStyle = {
    ...style,
    ...(orientation === "horizontal" && !size && { flex: 1 }),
    ...(size && {
      width: orientation === "vertical" ? "1px" : size,
      height: orientation === "horizontal" ? "1px" : size,
    }),
  }

  return (
    <div ref={ref} {...props} className={className} style={computedStyle} />
  )
}

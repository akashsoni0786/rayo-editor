import * as React from "react"

export const TableIcon = React.memo(
  ({ className, ...props }: React.SVGProps<SVGSVGElement>) => {
    return (
      <svg
        width="24"
        height="24"
        className={className}
        viewBox="0 0 24 24"
        fill="currentColor"
        xmlns="http://www.w3.org/2000/svg"
        {...props}
      >
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M3 3C2.44772 3 2 3.44772 2 4V20C2 20.5523 2.44772 21 3 21H21C21.5523 21 22 20.5523 22 20V4C22 3.44772 21.5523 3 21 3H3ZM4 5H20V8H4V5ZM4 10H10V14H4V10ZM12 10H20V14H12V10ZM4 16H10V19H4V16ZM12 16H20V19H12V16Z"
          fill="currentColor"
        />
      </svg>
    )
  }
)

TableIcon.displayName = "TableIcon"
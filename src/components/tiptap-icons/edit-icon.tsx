import * as React from "react"

export const EditIcon = React.memo(
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
          d="M16.2426 6.34315C16.6331 5.95262 17.2663 5.95262 17.6568 6.34315L19.0711 7.75736C19.4616 8.14788 19.4616 8.78105 19.0711 9.17157L17.6568 10.5858L15.5355 8.46447L16.2426 6.34315ZM14.1213 9.87868L5 19V21H7L16.1213 11.8787L14.1213 9.87868Z"
          fill="currentColor"
        />
      </svg>
    )
  }
)

EditIcon.displayName = "EditIcon"
interface ExcalidrawLogoProps {
  className?: string
}

export function ExcalidrawLogo({ className = "" }: ExcalidrawLogoProps) {
  return (
    <div className={`flex items-center ${className}`}>
      <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center mr-3">
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="text-white"
        >
          <path
            d="M3 3L21 21M3 21L21 3"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <span className="text-xl font-bold text-primary">EXCALIDRAW</span>
    </div>
  )
}

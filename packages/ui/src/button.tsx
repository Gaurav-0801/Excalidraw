import type * as React from "react"

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "secondary" | "outline" | "ghost"
  size?: "sm" | "md" | "lg"
  children: React.ReactNode
}

export function Button({ variant = "default", size = "md", className = "", children, ...props }: ButtonProps) {
  const baseStyles =
    "inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"

  const variants = {
    default: "bg-primary text-primary-foreground hover:bg-primary/90 focus:ring-primary/20",
    secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80 focus:ring-secondary/20",
    outline: "border border-border bg-background hover:bg-accent hover:text-accent-foreground focus:ring-primary/20",
    ghost: "hover:bg-accent hover:text-accent-foreground focus:ring-primary/20",
  }

  const sizes = {
    sm: "h-8 px-3 text-sm",
    md: "h-10 px-4 text-sm",
    lg: "h-12 px-6 text-base",
  }

  return (
    <button className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`} {...props}>
      {children}
    </button>
  )
}

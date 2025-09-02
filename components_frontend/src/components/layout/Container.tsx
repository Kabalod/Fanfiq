import type React from "react"
import { cn } from "@/lib/utils"

interface ContainerProps {
  /** Child elements to render inside container */
  children: React.ReactNode
  /** Additional CSS classes */
  className?: string
}

/**
 * Container wrapper with max width and padding
 */
export function Container({ children, className }: ContainerProps) {
  return <div className={cn("container mx-auto px-4 sm:px-6 lg:px-8", className)}>{children}</div>
}

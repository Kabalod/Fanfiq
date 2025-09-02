"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react"
import { cn } from "@/lib/utils"

export type NotificationType = "success" | "error" | "warning" | "info"

export interface NotificationToastProps {
  id: string
  type: NotificationType
  title: string
  message?: string
  duration?: number
  onClose?: (id: string) => void
  className?: string
}

const typeConfig = {
  success: {
    icon: CheckCircle,
    className: "border-green-200 bg-green-50 text-green-800",
    iconClassName: "text-green-600",
  },
  error: {
    icon: AlertCircle,
    className: "border-red-200 bg-red-50 text-red-800",
    iconClassName: "text-red-600",
  },
  warning: {
    icon: AlertTriangle,
    className: "border-yellow-200 bg-yellow-50 text-yellow-800",
    iconClassName: "text-yellow-600",
  },
  info: {
    icon: Info,
    className: "border-blue-200 bg-blue-50 text-blue-800",
    iconClassName: "text-blue-600",
  },
}

export function NotificationToast({
  id,
  type,
  title,
  message,
  duration = 5000,
  onClose,
  className,
}: NotificationToastProps) {
  const [isVisible, setIsVisible] = useState(true)
  const config = typeConfig[type]
  const Icon = config.icon

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        handleClose()
      }, duration)

      return () => clearTimeout(timer)
    }
  }, [duration])

  const handleClose = () => {
    setIsVisible(false)
    setTimeout(() => {
      onClose?.(id)
    }, 300) // Wait for animation
  }

  if (!isVisible) return null

  return (
    <Card
      className={cn(
        "fixed top-4 right-4 z-50 w-96 shadow-lg transition-all duration-300",
        config.className,
        isVisible ? "translate-x-0 opacity-100" : "translate-x-full opacity-0",
        className,
      )}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Icon className={cn("h-5 w-5 mt-0.5 flex-shrink-0", config.iconClassName)} />

          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-sm">{title}</h4>
            {message && <p className="text-sm opacity-90 mt-1">{message}</p>}
          </div>

          <Button variant="ghost" size="sm" onClick={handleClose} className="h-6 w-6 p-0 hover:bg-black/10">
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

// Toast Manager Hook
export function useNotifications() {
  const [notifications, setNotifications] = useState<NotificationToastProps[]>([])

  const addNotification = (notification: Omit<NotificationToastProps, "id" | "onClose">) => {
    const id = Math.random().toString(36).substr(2, 9)
    setNotifications((prev) => [...prev, { ...notification, id, onClose: removeNotification }])
  }

  const removeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }

  const showSuccess = (title: string, message?: string) => {
    addNotification({ type: "success", title, message })
  }

  const showError = (title: string, message?: string) => {
    addNotification({ type: "error", title, message })
  }

  const showWarning = (title: string, message?: string) => {
    addNotification({ type: "warning", title, message })
  }

  const showInfo = (title: string, message?: string) => {
    addNotification({ type: "info", title, message })
  }

  return {
    notifications,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    removeNotification,
  }
}

"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu, Search, Home, BookOpen, Heart, User, Settings } from "lucide-react"
import { cn } from "@/lib/utils"

export interface MobileNavProps {
  currentPath?: string
  onNavigate?: (path: string) => void
  user?: {
    id: string
    username: string
    avatar?: string
  }
  className?: string
}

const navItems = [
  { path: "/", label: "Главная", icon: Home },
  { path: "/search", label: "Поиск", icon: Search },
  { path: "/works", label: "Работы", icon: BookOpen },
  { path: "/favorites", label: "Избранное", icon: Heart },
  { path: "/profile", label: "Профиль", icon: User },
  { path: "/settings", label: "Настройки", icon: Settings },
]

export function MobileNav({ currentPath = "/", onNavigate, user, className }: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false)

  const handleNavigate = (path: string) => {
    onNavigate?.(path)
    setIsOpen(false)
  }

  return (
    <div className={cn("md:hidden", className)}>
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="sm" className="h-9 w-9 p-0">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Открыть меню</span>
          </Button>
        </SheetTrigger>

        <SheetContent side="left" className="w-80 p-0">
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="p-6 border-b">
              <h2 className="text-lg font-semibold">Fanfiq</h2>
              {user && (
                <div className="mt-4 flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                    {user.avatar ? (
                      <img
                        src={user.avatar || "/placeholder.svg"}
                        alt={user.username}
                        className="h-10 w-10 rounded-full object-cover"
                      />
                    ) : (
                      <User className="h-5 w-5" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-sm">{user.username}</p>
                    <p className="text-xs text-muted-foreground">Пользователь</p>
                  </div>
                </div>
              )}
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4">
              <ul className="space-y-2">
                {navItems.map((item) => {
                  const Icon = item.icon
                  const isActive = currentPath === item.path

                  return (
                    <li key={item.path}>
                      <Button
                        variant={isActive ? "secondary" : "ghost"}
                        className={cn("w-full justify-start gap-3 h-12", isActive && "bg-primary/10 text-primary")}
                        onClick={() => handleNavigate(item.path)}
                      >
                        <Icon className="h-5 w-5" />
                        {item.label}
                      </Button>
                    </li>
                  )
                })}
              </ul>
            </nav>

            {/* Footer */}
            <div className="p-4 border-t">
              <p className="text-xs text-muted-foreground text-center">© 2024 Fanfiq. Все права защищены.</p>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}

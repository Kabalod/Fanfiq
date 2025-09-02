"use client"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { User, Settings, BookOpen, Heart, LogOut } from "lucide-react"

export interface UserMenuProps {
  user: {
    id: string
    username: string
    avatar?: string
  }
  onProfileClick?: () => void
  onMyWorksClick?: () => void
  onFavoritesClick?: () => void
  onSettingsClick?: () => void
  onLogoutClick?: () => void
  className?: string
}

export function UserMenu({
  user,
  onProfileClick,
  onMyWorksClick,
  onFavoritesClick,
  onSettingsClick,
  onLogoutClick,
  className,
}: UserMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className={`relative h-8 w-8 rounded-full ${className}`}>
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.username} />
            <AvatarFallback>{user.username.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user.username}</p>
            <p className="text-xs leading-none text-muted-foreground">ID: {user.id}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={onProfileClick} className="cursor-pointer">
          <User className="mr-2 h-4 w-4" />
          <span>Профиль</span>
        </DropdownMenuItem>

        <DropdownMenuItem onClick={onMyWorksClick} className="cursor-pointer">
          <BookOpen className="mr-2 h-4 w-4" />
          <span>Мои работы</span>
        </DropdownMenuItem>

        <DropdownMenuItem onClick={onFavoritesClick} className="cursor-pointer">
          <Heart className="mr-2 h-4 w-4" />
          <span>Избранное</span>
        </DropdownMenuItem>

        <DropdownMenuItem onClick={onSettingsClick} className="cursor-pointer">
          <Settings className="mr-2 h-4 w-4" />
          <span>Настройки</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={onLogoutClick} className="cursor-pointer text-red-600">
          <LogOut className="mr-2 h-4 w-4" />
          <span>Выйти</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

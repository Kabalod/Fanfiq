"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { User, Settings, Bell } from "lucide-react"

export interface UserProfileProps {
  user: {
    id: string
    username: string
    email: string
    avatar?: string
    joinedAt: string
    worksCount: number
    favoritesCount: number
  }
  preferences: {
    theme: "light" | "dark" | "sepia"
    fontSize: number
    lineHeight: number
    autoBookmark: boolean
    emailNotifications: boolean
    publicProfile: boolean
  }
  onUpdateProfile?: (data: any) => void
  onUpdatePreferences?: (preferences: any) => void
  className?: string
}

export function UserProfile({ user, preferences, onUpdateProfile, onUpdatePreferences, className }: UserProfileProps) {
  return (
    <div className={`space-y-6 ${className}`}>
      {/* Profile Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Профиль пользователя
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
              {user.avatar ? (
                <img
                  src={user.avatar || "/placeholder.svg"}
                  alt={user.username}
                  className="h-16 w-16 rounded-full object-cover"
                />
              ) : (
                <User className="h-8 w-8" />
              )}
            </div>
            <div>
              <h3 className="text-lg font-semibold">{user.username}</h3>
              <p className="text-sm text-muted-foreground">Участник с {new Date(user.joinedAt).toLocaleDateString()}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Работ:</span>
              <span className="ml-2 font-medium">{user.worksCount}</span>
            </div>
            <div>
              <span className="text-muted-foreground">В избранном:</span>
              <span className="ml-2 font-medium">{user.favoritesCount}</span>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <Label htmlFor="username">Имя пользователя</Label>
              <Input id="username" defaultValue={user.username} />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" defaultValue={user.email} />
            </div>
          </div>

          <Button onClick={() => onUpdateProfile?.({})}>Сохранить изменения</Button>
        </CardContent>
      </Card>

      {/* Reading Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Настройки чтения
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div>
              <Label htmlFor="fontSize">Размер шрифта: {preferences.fontSize}px</Label>
              <input
                id="fontSize"
                type="range"
                min="12"
                max="24"
                defaultValue={preferences.fontSize}
                className="w-full"
              />
            </div>

            <div>
              <Label htmlFor="lineHeight">Межстрочный интервал: {preferences.lineHeight}</Label>
              <input
                id="lineHeight"
                type="range"
                min="1.2"
                max="2.0"
                step="0.1"
                defaultValue={preferences.lineHeight}
                className="w-full"
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="autoBookmark">Автоматические закладки</Label>
              <Switch id="autoBookmark" defaultChecked={preferences.autoBookmark} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Privacy & Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Уведомления и приватность
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="emailNotifications">Email уведомления</Label>
            <Switch id="emailNotifications" defaultChecked={preferences.emailNotifications} />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="publicProfile">Публичный профиль</Label>
            <Switch id="publicProfile" defaultChecked={preferences.publicProfile} />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

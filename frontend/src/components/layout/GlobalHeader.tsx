'use client'

import { UserMenu } from '@/components/auth/UserMenu'
import { useAuthStore } from '@/store/auth'
import { SiteHeader } from '@/components/layout/SiteHeader'

export function GlobalHeader() {
    const { user, clearAuth } = useAuthStore()

    const handleLogout = () => {
        clearAuth()
        // TODO: Redirect to home or login page
    }

    return (
        <SiteHeader>
            <UserMenu user={user} onLogout={handleLogout} />
        </SiteHeader>
    )
}

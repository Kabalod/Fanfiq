// Analytics utilities
type AnalyticsProps = Record<string, unknown>

export const trackEvent = (event: string, properties?: AnalyticsProps) => {
  // Placeholder for analytics tracking
  if (typeof window !== 'undefined') {
    console.log('Analytics event:', event, properties)
    // Here you would integrate with your analytics service
    // Example: gtag, mixpanel, etc.
  }
}

export const trackPageView = (page: string) => {
  trackEvent('page_view', { page })
}

export const trackUserAction = (action: string, data?: AnalyticsProps) => {
  trackEvent('user_action', { action, ...data })
}

export const track = (name: string, props?: AnalyticsProps) => trackEvent(name, props)

// Analytics utilities
export const trackEvent = (event: string, properties?: Record<string, any>) => {
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

export const trackUserAction = (action: string, data?: Record<string, any>) => {
  trackEvent('user_action', { action, ...data })
}

// sentry.server.config.js
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "YOUR_SENTRY_DSN", // TODO: Move to env
  tracesSampleRate: 1.0,
  // ... other Sentry options
});

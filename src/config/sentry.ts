import * as Sentry from "@sentry/react";
import { browserTracingIntegration, replayIntegration } from "@sentry/browser";
import { env } from './env';

export const initSentry = () => {
  if (env.environment === 'production') {
    Sentry.init({
      dsn: env.sentryDsn,
      integrations: [
        browserTracingIntegration(),
        replayIntegration(),
      ],
      // Performance Monitoring
      tracesSampleRate: 1.0,
      // Session Replay
      replaysSessionSampleRate: 0.1,
      replaysOnErrorSampleRate: 1.0,
      environment: env.environment,
    });
  }
}; 
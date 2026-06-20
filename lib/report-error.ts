type ErrorContext = Record<string, unknown>;

/**
 * Central error reporting seam. Always logs; forwards to a monitoring
 * collector when NEXT_PUBLIC_MONITORING_URL is set.
 *
 * To use Sentry instead: `npm i @sentry/nextjs`, run its setup, and replace the
 * forward block below with `Sentry.captureException(error, { extra: context })`.
 */
export function reportError(error: unknown, context?: ErrorContext) {
  // eslint-disable-next-line no-console
  console.error("[simona]", error, context ?? {});

  const url = process.env.NEXT_PUBLIC_MONITORING_URL;
  if (!url) return;

  try {
    const payload = JSON.stringify({
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      context,
      at: new Date().toISOString(),
      href: typeof window !== "undefined" ? window.location.href : undefined,
    });

    if (typeof navigator !== "undefined" && navigator.sendBeacon) {
      navigator.sendBeacon(url, payload);
    } else {
      void fetch(url, {
        method: "POST",
        body: payload,
        headers: { "Content-Type": "application/json" },
        keepalive: true,
      });
    }
  } catch {
    // Reporting must never throw.
  }
}

// Next.js server instrumentation: route server-side errors to the reporter.
export async function onRequestError(
  error: unknown,
  request: { path?: string; method?: string }
) {
  const { reportError } = await import("@/lib/report-error");
  reportError(error, {
    source: "server",
    path: request?.path,
    method: request?.method,
  });
}

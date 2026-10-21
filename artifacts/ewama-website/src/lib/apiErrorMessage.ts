/**
 * Turn an API error into a short, human message for toasts — so admins see
 * the real reason ("Your current password is incorrect", "server not
 * updated") rather than a generic failure.
 */
export function apiErrorMessage(err: unknown, fallback: string): string {
  const e = err as { status?: number; data?: unknown } | null;
  const status = e?.status;
  const data = e?.data as { error?: unknown; detail?: unknown } | null | undefined;
  const serverMessage = typeof data?.error === 'string' ? data.error : null;

  if (status === undefined) return 'Cannot reach the server. Check your connection and try again.';
  if (status === 404) return 'This feature is not on the server yet — the latest API update needs to be deployed.';
  if (status >= 500) return serverMessage ?? 'The server had a problem. Please try again shortly.';
  if (typeof data?.detail === 'string' && serverMessage) return `${serverMessage}: ${data.detail}`;
  return serverMessage ?? fallback;
}

/**
 * Pings the Cloudflare Worker (Middleware) so its KV cache picks up
 * whatever an admin just created/updated/deleted, instead of waiting for
 * the Worker's own 5-minute cron tick.
 *
 * This is intentionally fire-and-forget: it must never throw or delay an
 * admin request. If MIDDLEWARE_URL/REFRESH_SECRET aren't configured, or
 * the Worker is briefly unreachable, we just log it — the Worker's cron
 * will still catch up on its own within 5 minutes.
 */
export function refreshMiddlewareCache() {
  const baseUrl = process.env.MIDDLEWARE_URL;
  const secret = process.env.REFRESH_SECRET;

  if (!baseUrl || !secret) {
    console.warn('MIDDLEWARE_URL/REFRESH_SECRET not set — skipping middleware cache refresh.');
    return;
  }

  fetch(`${baseUrl.replace(/\/$/, '')}/api/refresh`, {
    method: 'POST',
    headers: { 'x-refresh-secret': secret },
  })
    .then((res) => {
      if (!res.ok) {
        console.error(`Middleware refresh responded with ${res.status}`);
      }
    })
    .catch((err) => {
      console.error('Failed to ping middleware refresh:', err.message);
    });
}

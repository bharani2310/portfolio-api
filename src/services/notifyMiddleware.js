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
  ping('/api/refresh');
}

/**
 * Pings the Worker's SEPARATE resume cache refresh route. Unlike
 * refreshMiddlewareCache() above, there is no Cron Trigger backing this
 * one up — the resume cache only ever updates because of this explicit
 * call (right after an admin uploads a new resume) or a visitor's own
 * request on a cold cache. Call this ONLY when a resume file was part of
 * the request that just saved — not on every profile save.
 */
export function refreshMiddlewareResumeCache() {
  ping('/api/resume/refresh');
}

function ping(path) {
  const baseUrl = process.env.MIDDLEWARE_URL;
  const secret = process.env.REFRESH_SECRET;

  if (!baseUrl || !secret) {
    console.warn(`MIDDLEWARE_URL/REFRESH_SECRET not set — skipping middleware ${path} ping.`);
    return;
  }

  fetch(`${baseUrl.replace(/\/$/, '')}${path}`, {
    method: 'POST',
    headers: { 'x-refresh-secret': secret },
  })
    .then((res) => {
      if (!res.ok) {
        console.error(`Middleware ${path} responded with ${res.status}`);
      }
    })
    .catch((err) => {
      console.error(`Failed to ping middleware ${path}:`, err.message);
    });
}

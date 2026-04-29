/**
 * Bible Study Suite deep links on app.wisdomebooksclub.com.
 * Reader paths and query rules match the Next suite (q = passage for three readers; Cross-Reference q is treasury-only).
 */

const SUITE_ORIGIN =
  typeof process.env.NEXT_PUBLIC_SUITE_ORIGIN === 'string' && process.env.NEXT_PUBLIC_SUITE_ORIGIN.trim()
    ? process.env.NEXT_PUBLIC_SUITE_ORIGIN.trim().replace(/\/$/, '')
    : 'https://staging-web-app-wec.vercel.app/';

const SUITE_BASE = `${SUITE_ORIGIN}/bible-study-suite`;

/** Canonical reader paths (iframe + launcher). */
export const ESTUDY_APP_URLS = {
  parallelBible: `${SUITE_BASE}/parallel-bible/reader`,
  interlinear: `${SUITE_BASE}/interlinear-bible/reader`,
  crossReference: `${SUITE_BASE}/cross-reference-bible/reader`,
  biblePlus: `${SUITE_BASE}/bible-plus/reader`,
} as const;

export type EstudySuiteRouteKey = keyof typeof ESTUDY_APP_URLS;

const Q_PASSAGE_SUITES: ReadonlySet<EstudySuiteRouteKey> = new Set([
  'parallelBible',
  'interlinear',
  'biblePlus',
]);

/**
 * Embeds query params for the hosted Bible Study Suite (e.g. chrome-less layout).
 * Set `NEXT_PUBLIC_SUITE_EMBED_PARAMS` to override (e.g. `embed=1&hideNav=1`). Empty string disables extras.
 * When unset, defaults to `embed=1`.
 */
function applySuiteEmbedParams(u: URL, token?: string | null): void {
  const envVal = process.env.NEXT_PUBLIC_SUITE_EMBED_PARAMS;
  const raw = typeof envVal === 'string' ? envVal.trim() : 'embed=1';
  if (raw) {
    const params = new URLSearchParams(raw.startsWith('?') ? raw.slice(1) : raw);
    params.forEach((value, key) => {
      u.searchParams.set(key, value);
    });
  }
  
  if (token) {
    u.searchParams.set('token', token);
  }
}

/**
 * Builds the iframe / in-app URL for a suite reader.
 *
 * - Parallel, Interlinear, Bible Plus: sets `q` to a single passage string when provided (URL-encoded by the URL API).
 *   These readers use `q` for auto-navigation, not `ref`.
 * - Cross-Reference reader: `q` is reserved for Treasury word search, not passage; we do not set `q` from a verse ref.
 */
export function buildSuiteReaderSrc(suite: EstudySuiteRouteKey, passage: string, token?: string | null): string {
  const u = new URL(ESTUDY_APP_URLS[suite]);
  applySuiteEmbedParams(u, token);

  const trimmed = passage.trim();
  if (trimmed && Q_PASSAGE_SUITES.has(suite)) {
    u.searchParams.set('q', trimmed);
  }

  return u.toString();
}

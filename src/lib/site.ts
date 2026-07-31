/**
 * Where the site actually lives once deployed.
 *
 * Link unfurlers (Discord, Slack, iMessage, X) fetch og:image over the network,
 * so it has to be an absolute URL. A root-relative "/og.png" resolves against
 * the unfurler's own host and 404s, and on GitHub Pages it would also miss the
 * /kindling basePath. So the production origin is pinned here rather than
 * derived from the build: a preview card should point at production no matter
 * which build emitted it.
 */
export const SITE_URL = "https://caprarim.github.io/kindling";

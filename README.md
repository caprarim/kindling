# Kindling

**Find a project worth building.**

Kindling asks a handful of questions — each one shaped by the answers before it —
and hands back project ideas built around what you're into, what you can already
do, and how much time you actually have. It never shows you the same idea twice,
and you don't need an account to use any of it.

---

## What makes it different

**The questions are generated, not scripted.** There is no fixed list of screens.
`nextQuestion()` reads everything you've said so far and builds the next question
from it. Pick *Food & cooking* and the follow-up asks about weeknight cooking and
food waste. Pick *Tools for developers* and it asks about debugging and code
review. Say you have no skills and the whole path changes shape.

**"I have no idea" is a real path, not a dead end.** It walks down a ladder of
fallbacks, and every rung has an escape hatch:

```
What are you into?          → none of these
  What can you do?          → I don't have any skills yet
    What annoys you?        → none of these either
      Two gut-feel cards    ← the floor; this always produces a signal
```

**Ideas never repeat.** Every idea is a combination of five slots — domain,
focus, audience, mechanic, twist — hashed into a fingerprint. Fingerprints you've
been shown are recorded and excluded from every future draw. The reachable space
runs to hundreds of thousands of combinations, and the app tells you how many are
left for your current answers.

**Try everything before signing up.** Questions, generation and saving all work
with no account. Make one later and everything you did as a guest is pushed to
the server and folded in — saved ideas *and* the record of what you've already
seen — so nothing is lost and nothing is re-shown.

---

## The backend

`api/` is a **Cloudflare Worker over a D1 database**. Saved ideas and seen
fingerprints live in SQL on the server, not in the browser.

Accounts have no email and no password. The server mints a 160-bit recovery
code, stores only its SHA-256 hash, and that code is the bearer token. A dump of
the database cannot be used to sign in as anyone. The code is the recovery story
*and* the way onto a second device: paste it anywhere and your library follows.

The client keeps the token in `localStorage` — the key, not the data.

| Route | |
|---|---|
| `POST /v1/accounts` | Mint an account. Returns the only copy of the code. |
| `GET /v1/state` | Everything this account owns. |
| `POST /v1/sync` | Merge the client's state in, return the union. Also the guest→account migration. |
| `DELETE /v1/saved/:id` | Remove one saved idea. |

The API never reads an account id from a request. Identity is derived from the
bearer token server-side and every query is scoped to it.

---

## Running it

```bash
npm install
npm run dev
```

Open <http://localhost:3000>. That's it — no environment variables, no backend
needed for the site to work.

### Turning on accounts

```bash
cd api
npm install
npx wrangler login                  # one-time
npm run db:create                   # copy the id into wrangler.toml
npm run db:migrate
npm run deploy
```

Then put the Worker URL in `.env.local`:

```
NEXT_PUBLIC_KINDLING_API=https://kindling-api.<your-subdomain>.workers.dev
```

Add the same value as a repository *variable* named `NEXT_PUBLIC_KINDLING_API`
to switch accounts on for the deployed site, and add that origin to
`ALLOWED_ORIGINS` in `api/wrangler.toml`.

### Tests

```bash
npm run smoke        # question ladders + the never-repeat guarantee
npm run smoke:api    # API contract, against `cd api && npm run dev`
```

---

## Deploying

Pushing to `main` builds a static export and publishes it to GitHub Pages via
`.github/workflows/deploy.yml`. Enable **Settings → Pages → Source: GitHub
Actions** once. The Worker deploys separately with `wrangler deploy`.

---

## Layout

```
src/
  app/                  Landing (which is the first question), flow, results, library
  components/
    choice-grid.tsx     The option-card picker the whole flow is built on
    flow.tsx            Renders whatever question the engine hands it
    idea-card.tsx       One idea, with its first three steps
  lib/
    engine/
      taxonomy.ts       Domains, focuses, audiences, mechanics, twists — the raw material
      questions.ts      Builds the next question from the profile so far
      generate.ts       Samples the slot space, excluding everything already seen
    store.tsx           Local cache, and the guest → account merge
    api.ts              Client for the Worker; inert when unconfigured
api/
  src/index.ts          The Worker: CORS, token auth, sync, delete
  schema.sql            accounts, saved_ideas, seen_ideas
  wrangler.toml         D1 binding and the CORS allowlist
brand/
  icon.svg              Source for every raster icon
  build-icons.mjs       node brand/build-icons.mjs
scripts/
  smoke.mts             Engine guarantees
  api-smoke.mts         API contract
```

Built with Next.js, TypeScript and shadcn/ui.

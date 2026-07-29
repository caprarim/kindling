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
with no account. If you make one later, everything you did as a guest is folded
into it — saved ideas *and* the record of what you've already seen — so nothing is
lost and nothing is re-shown.

---

## Running it

```bash
npm install
npm run dev
```

Open <http://localhost:3000>. That's it — no environment variables, no backend.

### Turning on accounts (optional)

1. Create a Supabase project.
2. Run `supabase/schema.sql` against it (SQL editor or `supabase db push`).
3. Copy `.env.local.example` to `.env.local` and fill in the two values.

Both values are public by design. Every row is protected by row-level security,
so a person can only ever read and write their own.

---

## Deploying

Pushing to `main` builds a static export and publishes it to GitHub Pages via
`.github/workflows/deploy.yml`. Enable **Settings → Pages → Source: GitHub
Actions** once, and set `NEXT_PUBLIC_SUPABASE_URL` and
`NEXT_PUBLIC_SUPABASE_ANON_KEY` as repository *variables* if you want accounts on
the deployed site.

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
    store.tsx           Local persistence, and the guest → account merge
    supabase.ts         Optional; returns null when unconfigured
brand/
  icon.svg              Source for every raster icon
  build-icons.mjs       node brand/build-icons.mjs
supabase/
  schema.sql            Two tables, both under row-level security
```

Built with Next.js, TypeScript and shadcn/ui.

# Kindling

**Read `context.md` first.** It explains in full what this project is, how the
question engine works, and how ideas are assembled. Do not start work without it.

## Deploying

**After every major change, redeploy the website to GitHub Pages.**

Deployment is automatic on push: `.github/workflows/deploy.yml` builds the static
export and publishes it whenever `main` is updated.

```
git add -A
git commit -m "<what changed>"
git push origin main
```

Then confirm the run went green: `gh run list --limit 1`.

## Running the dev server (read this, it has crashed the machine)

`next dev` spawns one Turbopack worker process per compile and never reaps them.
On Windows those workers are not bound to the parent, so any teardown that is
not a clean Ctrl-C leaves the whole pool running at ~16 MB each, forever. This
once accumulated 976 orphans holding 15.6 GB and took the machine to 92% RAM.

- **Never start `next dev` from a background shell or an agent session.** Start
  it in a terminal a human controls, and stop it with Ctrl-C.
- **One dev server at a time.** Several agents can be working in this repo at
  once. Check first: `Get-NetTCPConnection -LocalPort 3000 -State Listen`.
- `npm run dev` now reaps orphans first via the `predev` hook. To sweep by hand
  at any time: `npm run reap`.
- To stop a dev server, kill the **tree**, never just the parent:
  `taskkill /PID <pid> /T /F`. `Stop-Process` on the parent alone orphans every
  worker it spawned.

## Known non-issues

- `npm run build` fails locally on `/_global-error` with an
  `Expected workStore to be initialized` invariant. This is pre-existing Next 16
  noise, not a regression. Trust the TypeScript phase and CI.
- `npx eslint src` reports 3 pre-existing `react-hooks` errors. Do not count
  those as yours; compare against the baseline before claiming a new one.

## Checks before pushing

```
npx tsc --noEmit
npx tsx scripts/flow-audit.mts    # walks all 3 onboarding paths + every escape
```

The flow audit must show no repeated questions, no repeated option labels, no
backwards progress, and every path must terminate with three ideas.

## House rules

- No dashes (— or –) in visible UI copy. Use commas, colons, or periods.
- Every question must earn its place by changing what gets generated. If a new
  question only rephrases an earlier one, derive it from the answers instead.

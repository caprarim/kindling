import { DOMAINS, DOMAIN_BY_ID, FRUSTRATIONS, MOTIVATIONS, SURFACES, VIBES } from "./taxonomy";
import type { Choice, Profile, Question } from "./types";

/**
 * The question engine.
 *
 * There is no fixed list of screens. `nextQuestion` looks at everything the
 * person has said so far and builds the next question from it — its wording,
 * its options and even whether it gets asked at all are derived. Picking
 * "Food & cooking" produces different follow-ups than picking "Tools for
 * developers", and answering "I have no idea" walks down a completely
 * different ladder than answering "I know exactly what I want".
 */

const has = (p: Profile, id: string) => p.skipped.includes(id);

/** Words → domains, used to read a free-text description. */
export function detectDomains(text: string): string[] {
  const t = text.toLowerCase();
  const scored = DOMAINS.map((d) => ({
    id: d.id,
    score: d.keywords.reduce((n, k) => (t.includes(k) ? n + 1 : n), 0),
  }))
    .filter((d) => d.score > 0)
    .sort((a, b) => b.score - a.score);
  return scored.slice(0, 3).map((d) => d.id);
}

/** The domains we should generate from, whatever route got us here. */
export function effectiveDomains(p: Profile): string[] {
  if (p.domains.length) return p.domains;

  const fromFrustration = p.frustrations.flatMap(
    (f) => FRUSTRATIONS.find((x) => x.id === f)?.domains ?? [],
  );
  if (fromFrustration.length) return [...new Set(fromFrustration)];

  const fromVibe = p.vibes.flatMap((v) => VIBES.find((x) => x.id === v)?.domains ?? []);
  if (fromVibe.length) return [...new Set(fromVibe)];

  return DOMAINS.map((d) => d.id);
}

const domainChoices = (): Choice[] =>
  DOMAINS.map((d) => ({ id: d.id, label: d.label, hint: d.blurb }));

/** Focus options pulled from whichever domains the person actually chose. */
function focusChoices(p: Profile): Choice[] {
  const picked = p.domains.length ? p.domains : effectiveDomains(p).slice(0, 2);
  const out: Choice[] = [];
  for (const id of picked.slice(0, 3)) {
    const d = DOMAIN_BY_ID.get(id);
    if (!d) continue;
    for (const f of d.focuses) {
      out.push({
        id: `${d.id}:${f.id}`,
        label: f.label,
        hint: picked.length > 1 ? `${d.label} · ${f.hint}` : f.hint,
      });
    }
  }
  return out;
}

/** Audience options, likewise derived. Plus the honest "me" option. */
function audienceChoices(p: Profile): Choice[] {
  const picked = (p.domains.length ? p.domains : effectiveDomains(p)).slice(0, 3);
  const out: Choice[] = [{ id: "self", label: "Me", hint: "Built for one user, and that's fine" }];
  for (const id of picked) {
    const d = DOMAIN_BY_ID.get(id);
    if (!d) continue;
    for (const a of d.audiences) out.push({ id: `${d.id}:${a.id}`, label: a.label });
  }
  return out;
}

/** Surfaces, reordered around how comfortable the person said they are. */
function surfaceChoices(p: Profile): Choice[] {
  const easyFirst = p.skillLevel === "none" || p.skillLevel === "learning";

  const scored = SURFACES.map((s) => ({
    s,
    rank: easyFirst && (s.id === "web" || s.id === "nocode") ? -2 : 0,
  })).sort((a, b) => a.rank - b.rank);

  return scored.map(({ s }) => ({ id: s.id, label: s.label, hint: s.hint }));
}

const TOTAL_STEPS = 8;

export function nextQuestion(p: Profile): Question | null {
  // ── 1. Where are you starting from? ──────────────────────────────────────
  if (!p.path) {
    return {
      id: "path",
      field: "path",
      kind: "single",
      progress: 0,
      title: "Where are you starting from?",
      subtitle: "There's no wrong answer here. It just decides what comes next.",
      choices: [
        {
          id: "has-idea",
          label: "I know what I want to build",
          hint: "You've got the thing in your head already",
        },
        {
          id: "rough-direction",
          label: "I know roughly where to go",
          hint: "A subject, a feeling, a general area",
        },
        {
          id: "no-idea",
          label: "I have absolutely no idea",
          hint: "Completely blank, which is a perfectly good start",
        },
      ],
    };
  }

  // ── 2a. They have an idea: hear it, then narrow it ───────────────────────
  if (p.path === "has-idea") {
    if (p.ideaText === undefined) {
      return {
        id: "ideaText",
        field: "ideaText",
        kind: "text",
        progress: 1 / TOTAL_STEPS,
        title: "So, what do you want to build?",
        subtitle: "A sentence is plenty. Rough and half-formed is exactly right.",
        placeholder: "e.g. something that helps me stop wasting food in the fridge",
      };
    }
    if (!p.domains.length && !has(p, "domains")) {
      const detected = detectDomains(p.ideaText);
      if (detected.length) {
        const names = detected.map((id) => DOMAIN_BY_ID.get(id)?.label).filter(Boolean);
        return {
          id: "domains",
          field: "domains",
          kind: "multi",
          min: 1,
          max: 3,
          progress: 2 / TOTAL_STEPS,
          title: `That reads like ${names[0]}.`,
          subtitle: "Already ticked from the description. Change anything that looks off.",
          choices: domainChoices().map((c) =>
            detected.includes(c.id) ? { ...c, hint: `${c.hint} (matched your description)` } : c,
          ),
          escape: { label: "None of these fit" },
        };
      }
      return {
        id: "domains",
        field: "domains",
        kind: "multi",
        min: 1,
        max: 3,
        progress: 2 / TOTAL_STEPS,
        title: "Which world does that live in?",
        subtitle: "Pick up to three. This shapes everything after it.",
        choices: domainChoices(),
        escape: { label: "None of these fit" },
      };
    }
  }

  // ── 2b. Rough direction: pick the territory ──────────────────────────────
  if (p.path === "rough-direction" && !p.domains.length && !has(p, "domains")) {
    return {
      id: "domains",
      field: "domains",
      kind: "multi",
      min: 1,
      max: 3,
      progress: 1 / TOTAL_STEPS,
      title: "What kind of territory are you drawn to?",
      subtitle: "Pick up to three. Everything after this is built from that choice.",
      choices: domainChoices(),
      escape: { label: "None of these, really" },
    };
  }

  // ── 2c. No idea at all: a ladder of fallbacks that always lands ──────────
  if (p.path === "no-idea") {
    if (!p.domains.length && !has(p, "interests")) {
      return {
        id: "interests",
        field: "domains",
        kind: "multi",
        min: 1,
        max: 3,
        progress: 1 / TOTAL_STEPS,
        title: "Forget building for a second. What are you into?",
        subtitle: "Not what you're good at. What you'd read about on a slow evening.",
        choices: domainChoices(),
        escape: { label: "Honestly, none of these" },
      };
    }

    if (
      !p.domains.length &&
      has(p, "interests") &&
      !p.frustrations.length &&
      !has(p, "frustrations")
    ) {
      return {
        id: "frustrations",
        field: "frustrations",
        kind: "multi",
        min: 1,
        max: 3,
        progress: 3 / TOTAL_STEPS,
        title: "Different question. What actually annoys you?",
        subtitle:
          "You don't need interests or skills to be irritated by something. Irritation is a fine place to start a project.",
        choices: FRUSTRATIONS.map((f) => ({ id: f.id, label: f.label })),
        escape: { label: "None of these either" },
      };
    }

    // The floor. Everyone lands here, and it always produces a signal.
    if (
      !p.domains.length &&
      !p.frustrations.length &&
      has(p, "frustrations") &&
      !p.vibes.length
    ) {
      return {
        id: "vibes",
        field: "vibes",
        kind: "multi",
        min: 2,
        max: 2,
        progress: 4 / TOTAL_STEPS,
        title: "Last one, and it's pure gut feeling.",
        subtitle: "Pick the two that appeal most. Don't overthink it, there's nothing to get right.",
        choices: VIBES.map((v) => ({ id: v.id, label: v.label, hint: v.hint })),
      };
    }
  }

  // ── 3. Narrow the territory, using their own words back at them ──────────
  if (p.domains.length && !p.focuses.length && !has(p, "focuses")) {
    const labels = p.domains.map((id) => DOMAIN_BY_ID.get(id)?.label).filter(Boolean);
    return {
      id: "focuses",
      field: "focuses",
      kind: "multi",
      min: 1,
      max: 3,
      progress: 3 / TOTAL_STEPS,
      title:
        labels.length === 1
          ? `Which corner of ${labels[0]}?`
          : `Which corners of ${labels.slice(0, -1).join(", ")} and ${labels.at(-1)}?`,
      subtitle: "These options exist because of what you just picked.",
      choices: focusChoices(p),
      escape: { label: "Show me all of it" },
    };
  }

  // ── 4. Who it's for ──────────────────────────────────────────────────────
  if (!p.audiences.length && !has(p, "audiences")) {
    return {
      id: "audiences",
      field: "audiences",
      kind: "multi",
      min: 1,
      max: 3,
      progress: 4 / TOTAL_STEPS,
      title: "Who would this be for?",
      subtitle: "Building for one specific person beats building for everyone.",
      choices: audienceChoices(p),
      escape: { label: "No idea yet" },
    };
  }

  // ── 5. How comfortable are you actually ──────────────────────────────────
  if (!p.skillLevel) {
    return {
      id: "skillLevel",
      field: "skillLevel",
      kind: "single",
      progress: 5 / TOTAL_STEPS,
      title: "How comfortable are you with vibe coding?",
      subtitle: "Telling an AI what to build and steering it. Answer for how it feels, not for what you know.",
      choices: [
        {
          id: "none",
          label: "Never tried it",
          hint: "Every idea here will open with a gentle first step",
        },
        {
          id: "learning",
          label: "I've had a go",
          hint: "It works when you keep asking, it just takes a while",
        },
        {
          id: "comfortable",
          label: "Fairly comfortable",
          hint: "You can usually prompt your way to a working thing",
        },
        {
          id: "strong",
          label: "Very comfortable",
          hint: "You know how to steer it. Go on then, make it interesting",
        },
      ],
    };
  }

  // ── 6. Shape and budget ──────────────────────────────────────────────────
  if (!p.surfaces.length && !has(p, "surfaces")) {
    return {
      id: "surfaces",
      field: "surfaces",
      kind: "multi",
      min: 1,
      max: 3,
      progress: 6 / TOTAL_STEPS,
      title: "What should the thing actually be?",
      subtitle:
        p.skillLevel === "none" || p.skillLevel === "learning"
          ? "Kindest options first."
          : "Ordered around the comfort level just picked.",
      choices: surfaceChoices(p),
      escape: { label: "Surprise me" },
    };
  }

  if (!p.timeBudget) {
    return {
      id: "timeBudget",
      field: "timeBudget",
      kind: "single",
      progress: 7 / TOTAL_STEPS,
      title: "How much time have you actually got?",
      subtitle: "Be honest rather than optimistic. It changes what comes back.",
      choices: [
        { id: "weekend", label: "A weekend", hint: "One sitting, one idea, done" },
        { id: "few-weeks", label: "A few weeks of evenings", hint: "Room for something real" },
        { id: "few-months", label: "A few months", hint: "You can build something with depth" },
        { id: "open", label: "No deadline", hint: "It can grow as long as it wants" },
      ],
    };
  }

  if (!p.motivations.length && !has(p, "motivations")) {
    return {
      id: "motivations",
      field: "motivations",
      kind: "multi",
      min: 1,
      max: 3,
      progress: 7.5 / TOTAL_STEPS,
      title: "And why are you building it?",
      subtitle: "This changes the advice more than you'd think.",
      choices: MOTIVATIONS.map((m) => ({ id: m.id, label: m.label, hint: m.hint })),
      escape: { label: "Not sure" },
    };
  }

  if (!p.appetite) {
    return {
      id: "appetite",
      field: "appetite",
      kind: "single",
      progress: 8 / TOTAL_STEPS,
      title: "Last one. Which way should it lean?",
      choices: [
        { id: "practical", label: "Something obviously useful", hint: "Solves a real problem, no gimmicks" },
        { id: "playful", label: "Something a bit strange", hint: "Odd, charming, memorable" },
        { id: "ambitious", label: "Something ambitious", hint: "Bite off more than is sensible" },
      ],
    };
  }

  return null;
}

/** How complete the profile is, for the progress bar. */
export function flowProgress(p: Profile): number {
  const q = nextQuestion(p);
  return q ? Math.min(0.95, q.progress) : 1;
}

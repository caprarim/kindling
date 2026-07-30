import { read, type Reading } from "./match";
import {
  DOMAINS,
  DOMAIN_BY_ID,
  FRUSTRATIONS,
  MOTIVATIONS,
  SURFACES,
  VIBES,
} from "./taxonomy";
import type { Choice, Profile, Question } from "./types";

/**
 * The question engine.
 *
 * There is no fixed list of screens. `nextQuestion` looks at everything the
 * person has said so far and builds the next question from it — its wording,
 * its options and even whether it gets asked at all are derived. Picking
 * "Food & cooking" produces different follow-ups than picking "Developer
 * tools", and answering "I have no idea" walks down a completely different
 * ladder than answering "I know exactly what I want".
 *
 * Every question earns its place by changing what gets generated. Anything
 * that only rephrased an earlier question has been removed: how adventurous
 * the ideas should be is read from the answers instead of asked for twice.
 */

const has = (p: Profile, id: string) => p.skipped.includes(id);

/** Where each question sits on the bar. Kept in one place so it stays honest. */
const STEP = {
  path: 0,
  idea: 0.1,
  domains: 0.2,
  frustrations: 0.28,
  vibes: 0.36,
  focuses: 0.4,
  audiences: 0.54,
  skill: 0.66,
  surfaces: 0.78,
  time: 0.88,
  motivations: 0.95,
};

const readings = new Map<string, Reading>();

/**
 * The description, read once and remembered. `nextQuestion` runs on every
 * render, and the same sentence always reads the same way.
 */
export function reading(text: string | undefined): Reading {
  const t = (text ?? "").trim();
  if (!t) return read("");
  const cached = readings.get(t);
  if (cached) return cached;
  const fresh = read(t);
  readings.set(t, fresh);
  return fresh;
}

/** Domains a free-text description points at. */
export function detectDomains(text: string): string[] {
  return reading(text).domains;
}

/**
 * `domain:focus` ids a free-text description points at.
 *
 * Domain detection alone lands someone in "Food & cooking" and then asks the
 * same broad question again. Matching at focus level means a description of
 * wasted vegetables pre-selects "Using things up", not four food options.
 */
export function detectFocuses(text: string, domains: string[]): string[] {
  const allowed = new Set(domains);
  return reading(text).focuses.filter((id) => !allowed.size || allowed.has(id.split(":")[0]));
}

/** The domains ideas should be generated from, whatever route got here. */
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

const MATCH_MARKER = " (matched the description)";

/** Corners the description already pointed at, inside the domains in play. */
function detectedFocuses(p: Profile): string[] {
  const picked = p.domains.length ? p.domains : effectiveDomains(p).slice(0, 2);
  if (!p.ideaText || reading(p.ideaText).confidence === "none") return [];
  return detectFocuses(p.ideaText, picked.slice(0, 3));
}

/** Focus options pulled from whichever domains the person actually chose. */
function focusChoices(p: Profile): Choice[] {
  const picked = p.domains.length ? p.domains : effectiveDomains(p).slice(0, 2);
  const detected = new Set(detectedFocuses(p));
  const out: Choice[] = [];

  for (const id of picked.slice(0, 3)) {
    const d = DOMAIN_BY_ID.get(id);
    if (!d) continue;
    for (const f of d.focuses) {
      const pairId = `${d.id}:${f.id}`;
      // The hint says what a project here would actually work with, which is
      // more use than restating the label in different words.
      const base = picked.length > 1 ? `${d.label} · ${f.hint}` : f.hint;
      out.push({
        id: pairId,
        label: f.label,
        hint: detected.has(pairId) ? `${base}${MATCH_MARKER}` : base,
      });
    }
  }
  return out;
}

/** Audience options, likewise derived. Plus the honest "just me" option. */
function audienceChoices(p: Profile): Choice[] {
  const picked = (p.domains.length ? p.domains : effectiveDomains(p)).slice(0, 3);
  const out: Choice[] = [
    { id: "self", label: "Me, and nobody else", hint: "One user is a perfectly good target" },
  ];
  for (const id of picked) {
    const d = DOMAIN_BY_ID.get(id);
    if (!d) continue;
    for (const a of d.audiences) {
      out.push({
        id: `${d.id}:${a.id}`,
        label: a.label.charAt(0).toUpperCase() + a.label.slice(1),
      });
    }
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

export function nextQuestion(p: Profile): Question | null {
  // ── 1. Where are you starting from? ──────────────────────────────────────
  if (!p.path) {
    return {
      id: "path",
      field: "path",
      kind: "single",
      progress: STEP.path,
      title: "Where are you starting from?",
      subtitle: "There's no wrong answer here. It only decides what comes next.",
      choices: [
        {
          id: "has-idea",
          label: "I know what I want to build",
          hint: "The thing is already in your head, roughly",
        },
        {
          id: "rough-direction",
          label: "I know roughly where to look",
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
        progress: STEP.idea,
        title: "So, what is the thing?",
        subtitle: "One sentence is plenty. Rough and half-formed is exactly right.",
        placeholder: "e.g. something that stops good food rotting in the fridge",
      };
    }
    if (!p.domains.length && !has(p, "domains")) {
      const r = reading(p.ideaText);
      const names = r.domains.map((id) => DOMAIN_BY_ID.get(id)?.label).filter(Boolean);
      const heard = r.matched.slice(0, 3).join(", ");

      if (r.confidence === "strong") {
        return {
          id: "domains",
          field: "domains",
          kind: "multi",
          min: 1,
          max: 3,
          progress: STEP.domains,
          title: `That reads like ${names[0]}.`,
          subtitle: `Ticked from "${heard}" in the description. Untick anything that looks wrong.`,
          choices: domainChoices().map((c) =>
            r.domains.includes(c.id) ? { ...c, hint: `${c.hint}${MATCH_MARKER}` } : c,
          ),
          preselect: r.domains,
          escape: { label: "None of these fit" },
        };
      }

      if (r.confidence === "weak") {
        return {
          id: "domains",
          field: "domains",
          kind: "multi",
          min: 1,
          max: 3,
          progress: STEP.domains,
          title: `Best guess: ${names[0]}.`,
          subtitle: `Only "${heard}" was clear enough to go on, so this one is worth checking.`,
          choices: domainChoices().map((c) =>
            r.domains.includes(c.id) ? { ...c, hint: `${c.hint}${MATCH_MARKER}` } : c,
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
        progress: STEP.domains,
        title: "That could be almost anything.",
        subtitle:
          "Nothing in there was specific enough to place. Pick the world it belongs in and the rest follows.",
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
      progress: STEP.domains,
      title: "Which territory pulls hardest?",
      subtitle: "One tap and it carries on. Every option after this is built out of what gets picked here.",
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
        progress: STEP.domains,
        title: "Forget building for a second. What holds your attention?",
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
        progress: STEP.frustrations,
        title: "Different question. What actually annoys you?",
        subtitle:
          "Irritation needs no skills and no interests, and it is a perfectly good place to start a project.",
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
        progress: STEP.vibes,
        title: "Last one, and it's pure gut feeling.",
        subtitle: "Pick the two with the strongest pull. There is nothing to get right here.",
        choices: VIBES.map((v) => ({ id: v.id, label: v.label, hint: v.hint })),
      };
    }
  }

  // ── 3. Narrow to a corner, using their own picks ─────────────────────────
  if (p.domains.length && !p.focuses.length && !has(p, "focuses")) {
    const labels = p.domains.map((id) => DOMAIN_BY_ID.get(id)?.label).filter(Boolean);
    const detected = detectedFocuses(p);
    return {
      id: "focuses",
      field: "focuses",
      kind: "multi",
      min: 1,
      max: 3,
      progress: STEP.focuses,
      title:
        labels.length === 1
          ? `Which corner of ${labels[0]}?`
          : `Which corners of ${labels.slice(0, -1).join(", ")} and ${labels.at(-1)}?`,
      subtitle: detected.length
        ? "The description already points at one of these. Change it if it missed."
        : "This is the one that decides what the ideas are actually about.",
      choices: focusChoices(p),
      preselect: detected,
      escape: { label: "Keep the whole area in play" },
    };
  }

  // ── 4. Who it's for ──────────────────────────────────────────────────────
  if (!p.audiences.length && !has(p, "audiences")) {
    const r = reading(p.ideaText);
    return {
      id: "audiences",
      field: "audiences",
      kind: "multi",
      min: 1,
      max: 3,
      progress: STEP.audiences,
      title: "Who is on the other end of it?",
      subtitle: "One specific person beats everyone. It changes what the thing has to do.",
      choices: audienceChoices(p),
      preselect: r.audienceSelf ? ["self"] : [],
      escape: { label: "No idea yet" },
    };
  }

  // ── 5. How comfortable are you actually ──────────────────────────────────
  if (!p.skillLevel) {
    return {
      id: "skillLevel",
      field: "skillLevel",
      kind: "single",
      progress: STEP.skill,
      title: "How comfortable is vibe coding right now?",
      subtitle: "Telling an AI what to build and steering it. Answer for how it feels, not for what you know.",
      choices: [
        {
          id: "none",
          label: "Never tried it",
          hint: "Every idea will open with a gentle first step",
        },
        {
          id: "learning",
          label: "I've had a go",
          hint: "It works when you keep asking, it just takes a while",
        },
        {
          id: "comfortable",
          label: "Fairly comfortable",
          hint: "Prompting your way to a working thing usually goes fine",
        },
        {
          id: "strong",
          label: "Very comfortable",
          hint: "Steering it is second nature. Go on then, make it interesting",
        },
      ],
    };
  }

  // ── 6. Shape, time, and reason ───────────────────────────────────────────
  if (!p.surfaces.length && !has(p, "surfaces")) {
    return {
      id: "surfaces",
      field: "surfaces",
      kind: "multi",
      min: 1,
      max: 2,
      progress: STEP.surfaces,
      title: "What should the thing actually be?",
      subtitle:
        p.skillLevel === "none" || p.skillLevel === "learning"
          ? "Kindest options first. This sets the stack every idea is written against."
          : "Ordered around the comfort level just picked. This sets the stack each idea assumes.",
      choices: surfaceChoices(p),
      preselect: reading(p.ideaText).surfaces,
      escape: { label: "Surprise me" },
    };
  }

  if (!p.timeBudget) {
    return {
      id: "timeBudget",
      field: "timeBudget",
      kind: "single",
      progress: STEP.time,
      title: "How much time is genuinely available?",
      subtitle: "Honest beats optimistic. It decides how big the first version is allowed to be.",
      choices: [
        { id: "weekend", label: "A weekend", hint: "One sitting, one idea, finished" },
        { id: "few-weeks", label: "A few weeks of evenings", hint: "Room for something real" },
        { id: "few-months", label: "A few months", hint: "Enough for something with depth" },
        { id: "open", label: "No deadline at all", hint: "It can grow for as long as it stays interesting" },
      ],
      preselect: reading(p.ideaText).timeBudget ? [reading(p.ideaText).timeBudget!] : [],
    };
  }

  if (!p.motivations.length && !has(p, "motivations")) {
    return {
      id: "motivations",
      field: "motivations",
      kind: "multi",
      min: 1,
      max: 2,
      progress: STEP.motivations,
      title: "Last one. What is this project for?",
      subtitle: "This changes which ideas are worth putting in front of you more than anything else here.",
      choices: MOTIVATIONS.map((m) => ({ id: m.id, label: m.label, hint: m.hint })),
      preselect: reading(p.ideaText).motivations,
      escape: { label: "Not sure yet" },
    };
  }

  return null;
}

/** How complete the profile is, for the progress bar. */
export function flowProgress(p: Profile): number {
  const q = nextQuestion(p);
  return q ? Math.min(0.95, q.progress) : 1;
}

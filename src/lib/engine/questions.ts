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
 * Everything the description already settled, written into the profile.
 *
 * Anything answered here is never asked. Someone who typed "a clipping tool
 * for gamers" has already said the area, the corner and who it is for, and
 * being asked again reads as not having been listened to. All of it stays
 * changeable from the review screen.
 */
export function applyReading(p: Profile, text: string): Profile {
  const r = reading(text);
  const next: Profile = { ...p, ideaText: text };

  if (r.confidence === "strong") {
    if (!next.domains.length) next.domains = r.domains;
    if (!next.focuses.length) next.focuses = r.focuses;
  }
  if (!next.audiences.length) {
    if (r.audience) next.audiences = [`text:${r.audience}`];
    else if (r.audienceSelf) next.audiences = ["self"];
  }
  if (!next.surfaces.length && r.surfaces.length) next.surfaces = r.surfaces;
  if (!next.motivations.length && r.motivations.length) next.motivations = r.motivations;
  if (!next.timeBudget && r.timeBudget) next.timeBudget = r.timeBudget as Profile["timeBudget"];

  return next;
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

/** Corners the description already pointed at, inside the domains in play. */
function detectedFocuses(p: Profile): string[] {
  const picked = p.domains.length ? p.domains : effectiveDomains(p).slice(0, 2);
  if (!p.ideaText || reading(p.ideaText).confidence === "none") return [];
  return detectFocuses(p.ideaText, picked.slice(0, 3));
}

/** Focus options pulled from whichever domains the person actually chose. */
function focusChoices(p: Profile): Choice[] {
  const picked = p.domains.length ? p.domains : effectiveDomains(p).slice(0, 2);
  const out: Choice[] = [];

  for (const id of picked.slice(0, 3)) {
    const d = DOMAIN_BY_ID.get(id);
    if (!d) continue;
    for (const f of d.focuses) {
      // The hint says what a project here would actually work with, which is
      // more use than restating the label in different words.
      out.push({
        id: `${d.id}:${f.id}`,
        label: f.label,
        hint: picked.length > 1 ? `${d.label} · ${f.hint}` : f.hint,
      });
    }
  }
  return out;
}

/** Audience options, likewise derived. Plus the honest "just me" option. */
function audienceChoices(p: Profile): Choice[] {
  const picked = (p.domains.length ? p.domains : effectiveDomains(p)).slice(0, 3);
  const named = reading(p.ideaText).audience;
  const out: Choice[] = [
    { id: "self", label: "Me, and nobody else", hint: "One user is a perfectly good target" },
  ];
  if (named) {
    out.unshift({ id: `text:${named}`, label: named, hint: "The people you already named" });
  }
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
      choices: [
        {
          id: "has-idea",
          label: "I know what I want to build",
          hint: "It is already in your head, roughly",
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
        title: "What do you want to build?",
        placeholder: "e.g. a clipping tool for gamers",
      };
    }
    if (!p.domains.length && !has(p, "domains")) {
      const r = reading(p.ideaText);
      const names = r.domains.map((id) => DOMAIN_BY_ID.get(id)?.label).filter(Boolean);

      // A half-sure reading asks rather than assumes, but it asks as a question
      // with a real answer in it, not as a statement about what was typed.
      if (r.confidence === "weak" && names.length) {
        return {
          id: "domains",
          field: "domains",
          kind: "multi",
          min: 1,
          max: 3,
          progress: STEP.domains,
          title: `Is this ${names[0]}, or something else?`,
          choices: domainChoices(),
          preselect: r.domains,
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
        title: "Which area does it belong in?",
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
      title: "Which area pulls hardest?",
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
        title: "What holds your attention on a slow evening?",
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
        title: "What actually annoys you?",
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
        title: "Which two have the strongest pull?",
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
      title: "Who is it for?",
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
      title: "What should it be built as?",
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
      title: "Why are you building it?",
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

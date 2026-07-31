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

/**
 * Where each question sits on the bar. Kept in one place so it stays honest,
 * and ordered so that no route can ever make the bar travel backwards.
 */
const STEP = {
  path: 0.05,
  idea: 0.12,
  frustrations: 0.2,
  vibes: 0.28,
  areas: 0.34,
  domains: 0.34,
  focuses: 0.45,
  audiences: 0.56,
  skill: 0.67,
  surfaces: 0.78,
  time: 0.88,
  motivations: 0.95,
};

/**
 * The sideways route is reachable two ways, and the bar has to climb on both.
 *
 * Someone who took it from the start is a fifth of the way in. Someone who
 * bounced off the area grid has already spent that fifth, so their copy of the
 * same three questions sits in the gap above it rather than rewinding to it.
 */
const AFTER_GRID = { frustrations: 0.36, vibes: 0.39, areas: 0.42 };

const ladderStep = (p: Profile, id: keyof typeof AFTER_GRID) =>
  has(p, "domains") ? AFTER_GRID[id] : STEP[id];

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

/**
 * Areas that the sideways answers point at, strongest first.
 *
 * Annoyances are the firmer signal, so they outweigh gut feel. Both are counted
 * rather than taken in turn: someone annoyed by wasted food who also wants
 * something cosy should land on cooking, not on whichever question came first.
 */
function impliedDomains(p: Profile): string[] {
  const score = new Map<string, number>();
  const bump = (ids: string[], by: number) => {
    for (const id of ids) score.set(id, (score.get(id) ?? 0) + by);
  };

  for (const f of p.frustrations) bump(FRUSTRATIONS.find((x) => x.id === f)?.domains ?? [], 1);
  for (const v of p.vibes) bump(VIBES.find((x) => x.id === v)?.domains ?? [], 0.7);

  return [...score.entries()].sort((a, b) => b[1] - a[1]).map(([id]) => id);
}

/** The domains ideas should be generated from, whatever route got here. */
export function effectiveDomains(p: Profile): string[] {
  if (p.domains.length) return p.domains;
  const implied = impliedDomains(p);
  return implied.length ? implied : DOMAINS.map((d) => d.id);
}

/**
 * The areas everything downstream narrows inside.
 *
 * Answering the area question directly and arriving at the same place through
 * annoyances have to behave identically from here on, or half the flow quietly
 * switches itself off for anyone who took the sideways route.
 */
function narrowingDomains(p: Profile): string[] {
  return (p.domains.length ? p.domains : impliedDomains(p)).slice(0, 3);
}

const domainChoices = (ids?: string[]): Choice[] =>
  (ids?.length ? ids.flatMap((id) => DOMAIN_BY_ID.get(id) ?? []) : DOMAINS).map((d) => ({
    id: d.id,
    label: d.label,
    hint: d.blurb,
  }));

/** Corners the description already pointed at, inside the domains in play. */
function detectedFocuses(p: Profile): string[] {
  if (!p.ideaText || reading(p.ideaText).confidence === "none") return [];
  return detectFocuses(p.ideaText, narrowingDomains(p));
}

/** Focus options pulled from whichever domains the person actually chose. */
function focusChoices(p: Profile): Choice[] {
  const picked = narrowingDomains(p);
  const out: Choice[] = [];

  for (const id of picked) {
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

/**
 * Who it could be for when no area is settled.
 *
 * These are stored as free text rather than as `domain:audience` ids, because a
 * made-up domain id would come back out of the generator as the word "people".
 */
const OPEN_AUDIENCES: Choice[] = [
  { id: "text:friends and family", label: "Friends and family", hint: "People already within reach" },
  { id: "text:people at work", label: "People at work", hint: "Colleagues, clients, a small team" },
  { id: "text:complete beginners", label: "Complete beginners", hint: "Anyone starting from nothing" },
  {
    id: "text:anyone with the same problem",
    label: "Anyone with the same problem",
    hint: "Strangers who would recognise it instantly",
  },
];

/**
 * Audience options, likewise derived. Plus the honest "just me" option.
 *
 * Three areas produce twelve candidates, several of which read as the same
 * people said twice, so each carries the area it came from and exact repeats
 * are dropped.
 */
function audienceChoices(p: Profile): Choice[] {
  const picked = narrowingDomains(p);
  const named = reading(p.ideaText).audience;
  const out: Choice[] = [
    { id: "self", label: "Me, and nobody else", hint: "One user is a perfectly good target" },
  ];
  if (named) {
    out.unshift({ id: `text:${named}`, label: named, hint: "The people you already named" });
  }

  if (!picked.length) return [...out, ...OPEN_AUDIENCES];

  const seen = new Set<string>();
  for (const id of picked) {
    const d = DOMAIN_BY_ID.get(id);
    if (!d) continue;
    for (const a of d.audiences) {
      const key = a.label.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      out.push({
        id: `${d.id}:${a.id}`,
        label: a.label.charAt(0).toUpperCase() + a.label.slice(1),
        hint: picked.length > 1 ? d.label : undefined,
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

/**
 * True when the areas have to be arrived at sideways.
 *
 * Either the person said they had no idea, or the grid of areas was put in
 * front of them and none of it fit. Both mean the same thing: asking directly
 * has already failed, so the next questions must not ask directly again.
 */
const needsLadder = (p: Profile) =>
  !p.domains.length && (p.path === "no-idea" || has(p, "domains"));

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

  // ── 2. They have an idea: hear it before asking anything else ────────────
  if (p.path === "has-idea" && p.ideaText === undefined) {
    return {
      id: "ideaText",
      field: "ideaText",
      kind: "text",
      progress: STEP.idea,
      title: "What do you want to build?",
      placeholder: "e.g. a clipping tool for gamers",
    };
  }

  // ── 3. The sideways route, for anyone the area grid cannot serve ─────────
  //
  // Someone with no idea is the worst possible audience for a list of twelve
  // areas: it is the same question they already failed to answer, in a grid.
  // Annoyance and gut feel are things anybody can answer on a blank day, and
  // between them they point at an area far more reliably than guessing does.
  if (needsLadder(p)) {
    if (!p.frustrations.length && !has(p, "frustrations")) {
      return {
        id: "frustrations",
        field: "frustrations",
        kind: "multi",
        min: 1,
        max: 3,
        progress: ladderStep(p, "frustrations"),
        title:
          p.path === "no-idea"
            ? "Never mind ideas. What actually annoys you?"
            : "Fair enough. What actually annoys you?",
        choices: FRUSTRATIONS.map((f) => ({ id: f.id, label: f.label, hint: f.hint })),
        escape: { label: "None of these, honestly" },
      };
    }

    // The floor. With no annoyances to work from this cannot be escaped,
    // because something has to come out of this route.
    if (!p.vibes.length && !has(p, "vibes")) {
      return {
        id: "vibes",
        field: "vibes",
        kind: "multi",
        min: 2,
        max: 2,
        progress: ladderStep(p, "vibes"),
        title: p.frustrations.length
          ? "And which two of these have the strongest pull?"
          : "Which two of these have the strongest pull?",
        choices: VIBES.map((v) => ({ id: v.id, label: v.label, hint: v.hint })),
        escape: p.frustrations.length ? { label: "Neither, really" } : undefined,
      };
    }

    // What those answers already point at, offered back as a short list rather
    // than as the full twelve. Confirming a narrowed list is a real question;
    // re-showing everything would admit the last two screens changed nothing.
    const implied = impliedDomains(p);
    if (implied.length > 1 && !has(p, "areas")) {
      return {
        id: "areas",
        field: "domains",
        kind: "multi",
        min: 1,
        max: 3,
        progress: ladderStep(p, "areas"),
        title:
          implied.length > 4
            ? "That points at a fair few areas. Which are worth a weekend?"
            : "That points here. Which of these is worth a weekend?",
        choices: domainChoices(implied),
        escape: { label: "Show me every area instead" },
      };
    }
  }

  // ── 4. The full grid, for anyone the direct question suits ───────────────
  if (!p.domains.length && !has(p, "domains") && (!needsLadder(p) || has(p, "areas"))) {
    const r = reading(p.ideaText);
    const names = r.domains.map((id) => DOMAIN_BY_ID.get(id)?.label).filter(Boolean);

    // A half-sure reading asks rather than assumes, but it asks as a question
    // with a real answer in it, not as a statement about what was typed.
    const title =
      p.path === "has-idea"
        ? r.confidence === "weak" && names.length
          ? `Is this ${names[0]}, or something else?`
          : "Which area does it belong in?"
        : "Which area pulls hardest?";

    return {
      id: "domains",
      field: "domains",
      kind: "multi",
      min: 1,
      max: 3,
      progress: has(p, "areas") ? AFTER_GRID.areas + 0.02 : STEP.domains,
      title,
      choices: domainChoices(),
      preselect: [],
      escape: { label: p.path === "has-idea" ? "None of these fit" : "None of these, really" },
    };
  }

  // ── 5. Narrow to a corner, using their own picks ─────────────────────────
  const narrowing = narrowingDomains(p);
  if (narrowing.length && !p.focuses.length && !has(p, "focuses")) {
    const labels = narrowing.map((id) => DOMAIN_BY_ID.get(id)?.label).filter(Boolean);
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
      preselect: [],
      escape: { label: "Keep the whole area in play" },
    };
  }

  // ── 6. Who it's for ──────────────────────────────────────────────────────
  if (!p.audiences.length && !has(p, "audiences")) {
    const r = reading(p.ideaText);
    // Someone who started from nothing is almost always their own first user,
    // so that is ticked rather than asked as though it were an open question.
    const assumeSelf = r.audienceSelf || (p.path === "no-idea" && !p.ideaText);
    return {
      id: "audiences",
      field: "audiences",
      kind: "multi",
      min: 1,
      max: 3,
      progress: STEP.audiences,
      title: p.path === "no-idea" ? "Who would you build it for?" : "Who is it for?",
      choices: audienceChoices(p),
      preselect: assumeSelf ? ["self"] : [],
      note:
        r.audienceSelf || !assumeSelf
          ? undefined
          : "Building it for yourself is the usual answer. Change it, or carry on.",
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
    const fromText = reading(p.ideaText).timeBudget;
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
      preselect: fromText ? [fromText] : [],
    };
  }

  if (!p.motivations.length && !has(p, "motivations")) {
    // "Me, and nobody else" and "Fix my own annoyance" are the same sentence
    // twice. Having heard one, the other arrives ticked rather than asked.
    const fromText = reading(p.ideaText).motivations;
    const fromSelf = !fromText.length && p.audiences.includes("self");
    return {
      id: "motivations",
      field: "motivations",
      kind: "multi",
      min: 1,
      max: 2,
      progress: STEP.motivations,
      title: "Why are you building it?",
      choices: MOTIVATIONS.map((m) => ({ id: m.id, label: m.label, hint: m.hint })),
      preselect: fromText.length ? fromText : fromSelf ? ["scratch"] : [],
      note: fromSelf ? "Ticked from who you said it was for. Change it, or carry on." : undefined,
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

import { effectiveDomains } from "./questions";
import {
  DOMAIN_BY_ID,
  MECHANICS,
  MECHANIC_BY_ID,
  MOTIVATIONS,
  NAME_ADJECTIVES,
  NAME_SUFFIXES,
  SURFACES,
  TWISTS,
  TWIST_BY_ID,
  VIBES,
} from "./taxonomy";
import type { Difficulty, Idea, Profile } from "./types";

/* ── deterministic randomness ────────────────────────────────────────────── */

function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const pick = <T,>(arr: T[], r: () => number): T => arr[Math.floor(r() * arr.length) % arr.length];

/** Weighted pick. Weights must be positive. */
function weighted<T>(items: T[], weight: (t: T) => number, r: () => number): T {
  const w = items.map((i) => Math.max(0.01, weight(i)));
  const total = w.reduce((a, b) => a + b, 0);
  let x = r() * total;
  for (let i = 0; i < items.length; i++) {
    x -= w[i];
    if (x <= 0) return items[i];
  }
  return items[items.length - 1];
}

/* ── slot pools, all derived from the profile ────────────────────────────── */

const SKILL_CEILING: Record<string, number> = {
  none: 0.6,
  learning: 1.4,
  comfortable: 2.3,
  strong: 3.2,
};

function mechanicPool(p: Profile) {
  const ceiling = SKILL_CEILING[p.skillLevel ?? "learning"];
  const surfaces = new Set(p.surfaces);
  const ambitionBoost = p.appetite === "ambitious" ? 0.9 : p.appetite === "playful" ? 0.2 : 0;
  const timePenalty = p.timeBudget === "weekend" ? 1.1 : p.timeBudget === "few-weeks" ? 0.4 : 0;

  return MECHANICS.map((m) => {
    let w = 1;
    // Punish anything meaningfully above what they can comfortably carry.
    const over = m.weight - (ceiling + ambitionBoost - timePenalty);
    if (over > 0) w *= Math.max(0.05, 1 - over * 0.55);
    if (surfaces.size && m.surfaces.some((s) => surfaces.has(s))) w *= 2.1;
    return { m, w };
  });
}

function twistPool(p: Profile) {
  const fromVibes = new Set(p.vibes.flatMap((v) => VIBES.find((x) => x.id === v)?.twists ?? []));
  const gentle = p.skillLevel === "none" || p.timeBudget === "weekend";
  return TWISTS.map((t) => {
    let w = 1;
    if (fromVibes.has(t.id)) w *= 2.6;
    if (p.appetite === "playful" && t.weight >= 1) w *= 1.6;
    if (p.appetite === "practical" && t.weight >= 2) w *= 0.45;
    if (gentle && t.weight >= 2) w *= 0.4;
    return { t, w };
  });
}

/** `domain:focus` pairs the person is in the market for. */
function focusPool(p: Profile): { domain: string; focus: string }[] {
  if (p.focuses.length) {
    return p.focuses.map((f) => {
      const [domain, focus] = f.split(":");
      return { domain, focus };
    });
  }
  return effectiveDomains(p).flatMap((d) =>
    (DOMAIN_BY_ID.get(d)?.focuses ?? []).map((f) => ({ domain: d, focus: f.id })),
  );
}

function audiencePool(p: Profile, domain: string): string[] {
  const chosen = p.audiences.filter((a) => a === "self" || a.startsWith(`${domain}:`));
  if (chosen.length) return chosen;
  if (p.audiences.includes("self")) return ["self"];
  const d = DOMAIN_BY_ID.get(domain);
  return (d?.audiences ?? []).map((a) => `${domain}:${a.id}`);
}

function audienceLabel(id: string): string {
  if (id === "self") return "you";
  const [d, a] = id.split(":");
  return DOMAIN_BY_ID.get(d)?.audiences.find((x) => x.id === a)?.label ?? "people";
}

/* ── copy ────────────────────────────────────────────────────────────────── */

function productName(domain: string, focus: string, r: () => number): string {
  const d = DOMAIN_BY_ID.get(domain);
  const noun = pick(d?.nouns ?? ["thing"], r);
  const cap = (s: string) => s[0].toUpperCase() + s.slice(1);

  const roll = r();
  if (roll < 0.24) return `${pick(NAME_ADJECTIVES, r)} ${cap(noun)}`;
  if (roll < 0.34) {
    const focusWord = DOMAIN_BY_ID.get(domain)?.focuses.find((f) => f.id === focus)?.label ?? "";
    const first = focusWord.split(/[\s&]+/)[0];
    if (first && first.length > 3 && first.length < 9) return `${cap(first)}${pick(NAME_SUFFIXES, r)}`;
  }
  return `${cap(noun)}${pick(NAME_SUFFIXES, r)}`;
}

function difficultyOf(mechanicWeight: number, twistWeight: number, p: Profile): Difficulty {
  const ceiling = SKILL_CEILING[p.skillLevel ?? "learning"];
  const load = mechanicWeight + twistWeight * 0.6;
  if (load <= ceiling - 0.7) return "Gentle";
  if (load <= ceiling + 0.9) return "Moderate";
  return "Ambitious";
}

function timeToFirst(d: Difficulty, p: Profile): string {
  const table: Record<Difficulty, string[]> = {
    Gentle: ["An afternoon", "One evening", "A single sitting"],
    Moderate: ["A weekend", "Two or three evenings", "About a week of evenings"],
    Ambitious: ["A couple of weekends", "Two to three weeks", "A month, honestly"],
  };
  const options = table[d];
  if (p.timeBudget === "weekend") return options[0];
  if (p.timeBudget === "open") return options[options.length - 1];
  return options[1] ?? options[0];
}

function stackFor(p: Profile, mechanicSurfaces: string[]): string[] {
  const chosen = p.surfaces.length
    ? p.surfaces
    : mechanicSurfaces.length
      ? [mechanicSurfaces[0]]
      : ["web"];
  const stack = new Set<string>();
  for (const s of chosen) {
    const surface = SURFACES.find((x) => x.id === s);
    surface?.stack.forEach((item) => stack.add(item));
  }
  if (p.skillLevel === "none") stack.add("An AI that writes it with you");
  return [...stack].slice(0, 4);
}

/**
 * The personalised paragraph.
 *
 * The opening sentence always anchors to something the person actually said.
 * The rest is drawn from a pool using the *idea's* seed, so two ideas from the
 * same answers explain themselves differently instead of reading like a form
 * letter.
 */
function whyFor(
  p: Profile,
  domainLabel: string,
  audience: string,
  difficulty: Difficulty,
  mechanicLabel: string,
  twistClause: string,
  r: () => number,
): string {
  let anchor: string;
  if (p.ideaText?.trim()) {
    const said = p.ideaText.trim().slice(0, 90);
    anchor = pick(
      [
        `You described wanting "${said}", and this is a sharper version of that thought.`,
        `This came from what you wrote: "${said}".`,
        `Take "${said}" and give it edges. That's this.`,
      ],
      r,
    );
  } else if (p.domains.length) {
    anchor = pick(
      [
        `You leaned toward ${domainLabel.toLowerCase()}, so this sits squarely in it.`,
        `This is ${domainLabel.toLowerCase()} territory, which is where you pointed us.`,
        `You picked ${domainLabel.toLowerCase()}; this is one of its more overlooked corners.`,
      ],
      r,
    );
  } else if (p.frustrations.length) {
    anchor = pick(
      [
        "You named something that irritates you daily. This goes straight at it.",
        "This is built out of the annoyance you picked, not out of a category.",
      ],
      r,
    );
  } else if (p.vibes.length) {
    const v = VIBES.find((x) => x.id === p.vibes[0])?.label.toLowerCase() ?? "gut feel";
    anchor = pick(
      [`You went for "${v}", and this has exactly that shape.`, `This is about as "${v}" as it gets.`],
      r,
    );
  } else {
    anchor = "It's small enough to start today and open-ended enough to keep going.";
  }

  // Everything that could honestly be said about this idea for this person.
  const pool: string[] = [];

  if (p.skillLevel === "none") {
    pool.push("It assumes you've never vibe coded anything: the first version is genuinely small.");
    pool.push("You can describe this one in a sentence, which is exactly what makes it easy to prompt.");
  } else if (p.skillLevel === "strong") {
    pool.push("The obvious version is easy, so the interesting work is in the part you'd enjoy.");
    pool.push(`A ${mechanicLabel.toLowerCase()} is a solved shape, which frees you to make the twist the point.`);
  } else if (p.skillLevel === "learning") {
    pool.push("Each piece is small enough to ask for on its own, with one part that stretches you.");
  } else {
    pool.push("It's the sort of thing you can steer an AI through in a sitting, so the fun is in the details.");
  }

  if (p.timeBudget === "weekend") {
    pool.push("There's a version of it that's finished by Sunday night.");
  } else if (p.timeBudget === "open" && difficulty === "Ambitious") {
    pool.push("With no deadline you can let this one grow properly.");
  } else if (p.timeBudget === "few-months") {
    pool.push("It has enough depth to still be interesting in month three.");
  }

  if (p.motivations.includes("portfolio")) {
    pool.push("It demos in thirty seconds, which is what a portfolio piece needs.");
  }
  if (p.motivations.includes("scratch")) {
    pool.push("You'd be its first and most demanding user, which is the best possible start.");
  }
  if (p.motivations.includes("income")) {
    pool.push(`There's a plausible first paying user here: ${audience}.`);
  }
  if (p.motivations.includes("learn")) {
    pool.push("It forces you into one unfamiliar idea rather than five.");
  }
  if (p.motivations.includes("fun")) {
    pool.push("It doesn't need to justify itself to anyone, which is the whole appeal.");
  }

  // Something specific to *this* idea, so no two cards argue the same way.
  pool.push(`The constraint, ${twistClause.replace(/^and /, "")}, is what stops it being generic.`);
  if (difficulty === "Gentle") pool.push("You could have something on screen tonight.");
  if (difficulty === "Ambitious") pool.push("It's the most demanding thing on this list, deliberately.");

  // Fisher–Yates on a copy, driven by the idea's own seed.
  const shuffled = [...pool];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return [anchor, ...shuffled.slice(0, 2)].join(" ");
}

function fillSteps(templates: string[], vars: Record<string, string>): string[] {
  return templates.map((t) => t.replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? ""));
}

/* ── generation ──────────────────────────────────────────────────────────── */

export type GenerateResult = {
  ideas: Idea[];
  /** True when the pool was so exhausted we had to allow repeats. */
  exhausted: boolean;
};

/**
 * Build `count` ideas for this profile, never returning anything whose
 * fingerprint is already in `seen`. Fingerprints are deterministic, so an idea
 * the person has been shown before can never reappear — across sessions, and
 * across devices once they have an account.
 */
export function generateIdeas(
  p: Profile,
  seen: Set<string>,
  count = 6,
  salt = "",
): GenerateResult {
  const focuses = focusPool(p);
  const mechanics = mechanicPool(p);
  const twists = twistPool(p);

  const r = rng(hash(JSON.stringify(p) + salt + seen.size));

  const out: Idea[] = [];
  const batchFingerprints = new Set<string>();
  const batchShapes = new Set<string>();
  let exhausted = false;

  // Three passes, each looser than the last, so we always return something.
  for (let pass = 0; pass < 3 && out.length < count; pass++) {
    const allowShapeRepeat = pass >= 1;
    const allowSeen = pass >= 2;
    const attempts = 900;

    for (let i = 0; i < attempts && out.length < count; i++) {
      const { domain, focus } = pick(focuses, r);
      const audience = pick(audiencePool(p, domain), r);
      const mechanic = weighted(mechanics, (x) => x.w, r).m;
      const twist = weighted(twists, (x) => x.w, r).t;

      const fingerprint = `${domain}.${focus}.${audience}.${mechanic.id}.${twist.id}`;
      const shape = `${domain}.${focus}.${mechanic.id}`;

      if (batchFingerprints.has(fingerprint)) continue;
      if (!allowSeen && seen.has(fingerprint)) continue;
      if (!allowShapeRepeat && batchShapes.has(shape)) continue;
      if (allowSeen && seen.has(fingerprint)) exhausted = true;

      batchFingerprints.add(fingerprint);
      batchShapes.add(shape);
      out.push(buildIdea({ p, domain, focus, audience, mechanic: mechanic.id, twist: twist.id, fingerprint }));
    }
  }

  return { ideas: out, exhausted };
}

function buildIdea(args: {
  p: Profile;
  domain: string;
  focus: string;
  audience: string;
  mechanic: string;
  twist: string;
  fingerprint: string;
}): Idea {
  const { p, domain, focus, audience, fingerprint } = args;
  const d = DOMAIN_BY_ID.get(domain)!;
  const mechanic = MECHANIC_BY_ID.get(args.mechanic)!;
  const twist = TWIST_BY_ID.get(args.twist)!;
  const focusDef = d.focuses.find((f) => f.id === focus);

  const r = rng(hash(fingerprint));

  const pain = pick(d.pains, r);
  const who = audienceLabel(audience);
  const title = productName(domain, focus, r);
  const difficulty = difficultyOf(mechanic.weight, twist.weight, p);

  const pitch = `A ${mechanic.phrase} that helps ${who} ${pain}, ${twist.clause}.`;

  const steps = fillSteps(mechanic.steps, {
    focus: focusDef?.label.toLowerCase() ?? d.label.toLowerCase(),
    audience: who,
    domain: d.label.toLowerCase(),
    noun: pick(d.nouns, r),
  });

  return {
    id: fingerprint,
    title,
    pitch,
    why: whyFor(p, d.label, who, difficulty, mechanic.label, twist.clause, r),
    steps,
    stretch: mechanic.stretch,
    difficulty,
    timeToFirst: timeToFirst(difficulty, p),
    stack: stackFor(p, mechanic.surfaces),
    tags: [d.label, focusDef?.label ?? "", mechanic.label, twist.label].filter(Boolean),
    slots: { domain, focus, audience, mechanic: args.mechanic, twist: args.twist },
    createdAt: Date.now(),
  };
}

/** Rough size of the space a profile can draw from — shown in the UI. */
export function poolSize(p: Profile): number {
  const focuses = focusPool(p).length;
  const audiences = new Set(focusPool(p).flatMap((f) => audiencePool(p, f.domain))).size || 1;
  return focuses * audiences * MECHANICS.length * TWISTS.length;
}

/**
 * How many already-seen ideas fall inside *this* profile's pool.
 *
 * The seen list spans every set of answers a person has ever given, so
 * subtracting it wholesale from the current pool understates what's left —
 * badly, after someone changes their answers. Only fingerprints this profile
 * could actually draw are counted.
 */
export function countSeenInPool(p: Profile, seen: Iterable<string>): number {
  const focuses = new Set(focusPool(p).map((f) => `${f.domain}.${f.focus}`));
  const audiences = new Set(focusPool(p).flatMap((f) => audiencePool(p, f.domain)));

  let n = 0;
  for (const id of seen) {
    const [domain, focus, audience] = id.split(".");
    if (focuses.has(`${domain}.${focus}`) && audiences.has(audience)) n++;
  }
  return n;
}

export function motivationLabel(id: string): string {
  return MOTIVATIONS.find((m) => m.id === id)?.label ?? id;
}

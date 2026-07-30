import { effectiveDomains } from "./questions";
import {
  DOMAIN_BY_ID,
  FOCUS_SHAPES,
  MECHANICS,
  MECHANIC_BY_ID,
  MOTIVATIONS,
  SURFACES,
  TWISTS,
  TWIST_BY_ID,
  VIBES,
} from "./taxonomy";
import type { Appetite, Idea, Profile } from "./types";

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

/* ── reading the profile ─────────────────────────────────────────────────── */

const SKILL_CEILING: Record<string, number> = {
  none: 0.6,
  learning: 1.4,
  comfortable: 2.3,
  strong: 3.2,
};

/**
 * How adventurous the ideas should be.
 *
 * This used to be its own question, which sat far too close to "why are you
 * building it". It is read from the answers instead: what someone is building
 * for says more about how strange they want it than a separate question does.
 */
export function appetiteOf(p: Profile): Appetite {
  if (p.appetite) return p.appetite;
  if (p.motivations.includes("fun") || p.vibes.includes("playful")) return "playful";
  if (p.motivations.includes("income") || p.motivations.includes("scratch")) return "practical";
  if (p.motivations.includes("learn") && (p.timeBudget === "few-months" || p.timeBudget === "open")) {
    return "ambitious";
  }
  if (p.timeBudget === "open") return "ambitious";
  return "practical";
}

function mechanicPool(p: Profile) {
  const ceiling = SKILL_CEILING[p.skillLevel ?? "learning"];
  const surfaces = new Set(p.surfaces);
  const appetite = appetiteOf(p);
  const ambitionBoost = appetite === "ambitious" ? 0.9 : appetite === "playful" ? 0.2 : 0;
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
  const appetite = appetiteOf(p);
  const gentle = p.skillLevel === "none" || p.timeBudget === "weekend";
  return TWISTS.map((t) => {
    let w = 1;
    if (fromVibes.has(t.id)) w *= 2.6;
    if (appetite === "playful" && t.weight >= 1) w *= 1.6;
    if (appetite === "practical" && t.weight >= 2) w *= 0.45;
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

/**
 * What to call the thing in the first sentence.
 *
 * It comes straight from the surface the person picked, so an idea is described
 * as the sort of thing they said they wanted to build rather than as "an app".
 */
function thingNoun(p: Profile, mechanicSurfaces: string[]): string {
  const id = p.surfaces[0] ?? mechanicSurfaces[0];
  return SURFACES.find((s) => s.id === id)?.label ?? "An app";
}

/* ── generation ──────────────────────────────────────────────────────────── */

export type GenerateResult = {
  ideas: Idea[];
  /** True when the pool was so exhausted that repeats had to be allowed. */
  exhausted: boolean;
};

type Draft = {
  domain: string;
  focus: string;
  problem: number;
  audience: string;
  mechanic: string;
  twist: string;
  title: string;
  fingerprint: string;
};

/**
 * Build `count` ideas for this profile, never returning anything whose
 * fingerprint is already in `seen`.
 *
 * Within a single batch the name, the shape, the constraint and the problem all
 * have to differ. That is what stops three cards from being one idea wearing
 * three names: each pass below relaxes one of those rules, and only the last
 * one gives up. The name is the rule that never relaxes until then, because two
 * cards under the same heading is the repetition people actually notice.
 */
export function generateIdeas(
  p: Profile,
  seen: Set<string>,
  count = 3,
  salt = "",
): GenerateResult {
  const focuses = focusPool(p);
  const mechanics = mechanicPool(p);
  const twists = twistPool(p);

  const r = rng(hash(JSON.stringify(p) + salt + seen.size));

  const drafts: Draft[] = [];
  const used = {
    fingerprints: new Set<string>(),
    mechanics: new Set<string>(),
    twists: new Set<string>(),
    problems: new Set<string>(),
    focuses: new Set<string>(),
    titles: new Set<string>(),
  };
  let exhausted = false;

  const enoughFocuses = focuses.length >= count;

  // Each pass drops one variety rule, so a narrow profile still fills the page.
  const passes = [
    { focus: enoughFocuses, mechanic: true, twist: true, problem: true, seenOk: false },
    { focus: false, mechanic: true, twist: true, problem: true, seenOk: false },
    { focus: false, mechanic: false, twist: true, problem: true, seenOk: false },
    { focus: false, mechanic: false, twist: false, problem: true, seenOk: false },
    { focus: false, mechanic: false, twist: false, problem: false, seenOk: false },
    { focus: false, mechanic: false, twist: false, problem: false, seenOk: true },
  ];

  for (const rules of passes) {
    if (drafts.length >= count) break;

    for (let i = 0; i < 1200 && drafts.length < count; i++) {
      const { domain, focus } = pick(focuses, r);
      const focusDef = DOMAIN_BY_ID.get(domain)?.focuses.find((f) => f.id === focus);
      if (!focusDef) continue;

      const problem = Math.floor(r() * focusDef.problems.length) % focusDef.problems.length;
      const audience = pick(audiencePool(p, domain), r);
      // Shapes that suit this corner are far likelier, so an idea reads as
      // something designed for the problem rather than bolted onto it.
      const suited = FOCUS_SHAPES[`${domain}:${focus}`] ?? [];
      const mechanic = weighted(mechanics, (x) => x.w * (suited.includes(x.m.id) ? 3.5 : 1), r).m;
      const twist = weighted(twists, (x) => x.w, r).t;

      const fingerprint = `${domain}.${focus}.${audience}.${mechanic.id}.${twist.id}.p${problem}`;
      const problemKey = `${domain}.${focus}.p${problem}`;
      // The name belongs to the problem, not to a bag of nouns, so two ideas
      // about different problems can never end up as the same word.
      const title = focusDef.names[problem % focusDef.names.length];

      if (used.fingerprints.has(fingerprint)) continue;
      if (rules.focus && used.focuses.has(`${domain}.${focus}`)) continue;
      if (rules.mechanic && used.mechanics.has(mechanic.id)) continue;
      if (rules.twist && used.twists.has(twist.id)) continue;
      if (rules.problem && used.problems.has(problemKey)) continue;
      if (!rules.seenOk && used.titles.has(title)) continue;
      if (!rules.seenOk && seen.has(fingerprint)) continue;
      if (rules.seenOk && seen.has(fingerprint)) exhausted = true;

      used.fingerprints.add(fingerprint);
      used.focuses.add(`${domain}.${focus}`);
      used.mechanics.add(mechanic.id);
      used.twists.add(twist.id);
      used.problems.add(problemKey);
      used.titles.add(title);

      drafts.push({ domain, focus, problem, audience, mechanic: mechanic.id, twist: twist.id, title, fingerprint });
    }
  }

  const ideas = drafts.map((draft) => buildIdea(p, draft));
  return { ideas, exhausted };
}

/**
 * The idea, in words anyone can read.
 *
 * Three sentences and nothing else: what the thing is and who it is for, how it
 * works, and the one thing that makes it unusual. No stack, no steps, no
 * reasoning about the person, and no product-design vocabulary.
 */
function buildIdea(p: Profile, draft: Draft): Idea {
  const d = DOMAIN_BY_ID.get(draft.domain)!;
  const focus = d.focuses.find((f) => f.id === draft.focus)!;
  const mechanic = MECHANIC_BY_ID.get(draft.mechanic)!;
  const twist = TWIST_BY_ID.get(draft.twist)!;

  const problem = focus.problems[draft.problem];
  const who = audienceLabel(draft.audience);
  const thing = thingNoun(p, mechanic.surfaces);

  return {
    id: draft.fingerprint,
    title: draft.title,
    pitch: `${thing} that helps ${who} ${problem}. ${mechanic.plain} ${twist.sentence}`,
    slots: {
      domain: draft.domain,
      focus: draft.focus,
      audience: draft.audience,
      mechanic: draft.mechanic,
      twist: draft.twist,
    },
    createdAt: Date.now(),
  };
}

/** Rough size of the space a profile can draw from — shown in the UI. */
export function poolSize(p: Profile): number {
  const pairs = focusPool(p);
  const problems = pairs.reduce((n, { domain, focus }) => {
    const def = DOMAIN_BY_ID.get(domain)?.focuses.find((f) => f.id === focus);
    return n + (def?.problems.length ?? 0);
  }, 0);
  const audiences = new Set(pairs.flatMap((f) => audiencePool(p, f.domain))).size || 1;
  return problems * audiences * MECHANICS.length * TWISTS.length;
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
  const pairs = focusPool(p);
  const focuses = new Set(pairs.map((f) => `${f.domain}.${f.focus}`));
  const audiences = new Set(pairs.flatMap((f) => audiencePool(p, f.domain)));

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

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
import type { Focus } from "./taxonomy";
import type { Appetite, Difficulty, Idea, Profile } from "./types";

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
  if (id === "self") return "its owner";
  const [d, a] = id.split(":");
  return DOMAIN_BY_ID.get(d)?.audiences.find((x) => x.id === a)?.label ?? "people";
}

/* ── copy ────────────────────────────────────────────────────────────────── */

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

/**
 * What this specific idea would be built with.
 *
 * The surface sets the base, then the shape and the constraint each add what
 * they actually require — so a voice-driven capture tool and an offline tracker
 * on the same surface no longer list an identical stack.
 */
function stackFor(p: Profile, mechanicSurfaces: string[], extras: string[]): string[] {
  const chosen = p.surfaces.length
    ? p.surfaces
    : mechanicSurfaces.length
      ? [mechanicSurfaces[0]]
      : ["web"];
  const stack = new Set<string>();
  for (const s of chosen) {
    SURFACES.find((x) => x.id === s)?.stack.forEach((item) => stack.add(item));
  }
  for (const extra of extras) stack.add(extra);
  return [...stack].slice(0, 4);
}

/**
 * Lines that tie one idea to this particular person.
 *
 * Every card in a batch takes a different line by index, so six ideas from the
 * same answers never argue for themselves the same way twice.
 */
function fitLines(p: Profile, focus: Focus, who: string, difficulty: Difficulty): string[] {
  const out: string[] = [];

  if (p.ideaText?.trim()) {
    out.push(`It stays close to what was described: "${p.ideaText.trim().slice(0, 90)}".`);
  }
  out.push(`The material is ${focus.subject}, which already exists and needs no inventing.`);

  if (p.skillLevel === "none") {
    out.push("The first version is small enough to describe in one sentence, which is what makes it promptable.");
  } else if (p.skillLevel === "learning") {
    out.push("Each piece is small enough to ask for on its own, with one part that genuinely stretches.");
  } else if (p.skillLevel === "strong") {
    out.push("The obvious version is quick, so the interesting work sits entirely in the constraint.");
  } else {
    out.push("This is steerable in a sitting, so the effort goes into the details rather than the scaffolding.");
  }

  if (p.timeBudget === "weekend") out.push("There is a version of this finished by Sunday night.");
  if (p.timeBudget === "few-weeks") out.push("A few weeks of evenings is enough to reach something genuinely usable.");
  if (p.timeBudget === "few-months") out.push("It has enough depth to still be interesting in month three.");
  if (p.timeBudget === "open") out.push("With no deadline it can grow at whatever pace it deserves.");

  if (p.motivations.includes("portfolio")) out.push("It demonstrates in thirty seconds, which is what a portfolio piece has to do.");
  if (p.motivations.includes("scratch")) out.push("The first and most demanding user is already available, which is the best possible start.");
  if (p.motivations.includes("income")) out.push(`There is a plausible first paying user here: ${who}.`);
  if (p.motivations.includes("learn")) out.push("It forces one unfamiliar idea rather than five at once.");
  if (p.motivations.includes("people")) out.push(`Somebody real can use it the week it works: ${who}.`);
  if (p.motivations.includes("fun")) out.push("It never has to justify itself to anyone, which is the entire appeal.");

  if (difficulty === "Gentle") out.push("Something usable could be on screen tonight.");
  if (difficulty === "Ambitious") out.push("It is the most demanding thing on this list, deliberately.");

  out.push(`Nothing here needs an audience: it is worth building even if ${who} never hears about it.`);
  return out;
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
  fingerprint: string;
};

/**
 * Build `count` ideas for this profile, never returning anything whose
 * fingerprint is already in `seen`.
 *
 * Within a single batch the shape, the constraint and the problem all have to
 * differ. That is what stops six cards from being one idea wearing six names:
 * each pass below relaxes one of those rules, and only the last one gives up.
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

  const drafts: Draft[] = [];
  const used = {
    fingerprints: new Set<string>(),
    mechanics: new Set<string>(),
    twists: new Set<string>(),
    problems: new Set<string>(),
    focuses: new Set<string>(),
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

      if (used.fingerprints.has(fingerprint)) continue;
      if (rules.focus && used.focuses.has(`${domain}.${focus}`)) continue;
      if (rules.mechanic && used.mechanics.has(mechanic.id)) continue;
      if (rules.twist && used.twists.has(twist.id)) continue;
      if (rules.problem && used.problems.has(problemKey)) continue;
      if (!rules.seenOk && seen.has(fingerprint)) continue;
      if (rules.seenOk && seen.has(fingerprint)) exhausted = true;

      used.fingerprints.add(fingerprint);
      used.focuses.add(`${domain}.${focus}`);
      used.mechanics.add(mechanic.id);
      used.twists.add(twist.id);
      used.problems.add(problemKey);

      drafts.push({ domain, focus, problem, audience, mechanic: mechanic.id, twist: twist.id, fingerprint });
    }
  }

  const usedStretches = new Set<string>();
  const ideas = drafts.map((draft, index) => buildIdea(p, draft, index, usedStretches));
  return { ideas, exhausted };
}

function buildIdea(p: Profile, draft: Draft, variant: number, usedStretches: Set<string>): Idea {
  const d = DOMAIN_BY_ID.get(draft.domain)!;
  const focus = d.focuses.find((f) => f.id === draft.focus)!;
  const mechanic = MECHANIC_BY_ID.get(draft.mechanic)!;
  const twist = TWIST_BY_ID.get(draft.twist)!;

  const problem = focus.problems[draft.problem];
  const who = audienceLabel(draft.audience);
  const difficulty = difficultyOf(mechanic.weight, twist.weight, p);

  // The name belongs to the problem, not to a bag of nouns, so two ideas about
  // different problems can never end up as the same word with different guts.
  const title = focus.names[draft.problem % focus.names.length];

  const lines = fitLines(p, focus, who, difficulty);
  const why = [
    mechanic.rationale,
    twist.rationale,
    lines[variant % lines.length],
  ].join(" ");

  // The focus stretch is the best one, but two cards on the same focus would
  // otherwise repeat it, so the second falls back to the shape's own next step.
  const stretch = usedStretches.has(focus.stretch) ? mechanic.stretch : focus.stretch;
  usedStretches.add(stretch);

  return {
    id: draft.fingerprint,
    title,
    pitch: `A ${mechanic.phrase} that helps ${who} ${problem}. ${twist.sentence}`,
    why,
    steps: [focus.build, mechanic.step, twist.step],
    stretch,
    difficulty,
    timeToFirst: timeToFirst(difficulty, p),
    stack: stackFor(p, mechanic.surfaces, [...mechanic.stack, ...twist.stack]),
    tags: [d.label, focus.label, mechanic.label, twist.label],
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

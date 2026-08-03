import { effectiveDomains, reading } from "./questions";
import {
  DOMAIN_BY_ID,
  FOCUS_AUDIENCES,
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

/**
 * The constraints that make sense in this area, weighted toward the ones that
 * belong in it.
 *
 * A constraint is meant to sharpen an idea. "It ends in print" bolted onto a
 * tool for cutting up livestreams does the opposite: it reads as a sentence
 * written about some other project, and one of those is enough to make the
 * whole card look assembled at random. Contradictions are dropped outright
 * here rather than made unlikely, because unlikely still happens.
 */
function twistsFor(domain: string, focus: string, base: { t: (typeof TWISTS)[number]; w: number }[]) {
  const keys = [domain, `${domain}:${focus}`];
  const hits = (list?: string[]) => !!list?.some((k) => keys.includes(k));
  const fits = base.filter(({ t }) => !hits(t.avoid));
  // Never narrow so far that a batch cannot find three different constraints.
  const pool = fits.length >= 5 ? fits : base;
  return pool.map(({ t, w }) => ({ t, w: w * (hits(t.suits) ? 2.2 : 1) }));
}

/**
 * The corner a description landed on, when nobody ever chose one.
 *
 * "A habit tracker" reads as Daily habits, and three ideas out of that one
 * corner are three ways of writing down the words that were typed. Reading it
 * is a starting point, not an instruction. The corner is kept as an anchor so
 * one idea answers the description head on, and the rest of the area opens up
 * around it so the other two are somewhere the person had not already been.
 *
 * A corner picked by hand is not an anchor. Tapping "Daily habits" off a grid
 * is a request for daily habits, and widening it would be ignoring the answer.
 */
export function describedCorner(p: Profile): { domain: string; focus: string } | undefined {
  if (!p.ideaText || !p.focuses.length) return undefined;
  const derived = reading(p.ideaText).focuses;
  if (!derived.length || !p.focuses.every((f) => derived.includes(f))) return undefined;
  const [domain, focus] = p.focuses[0].split(":");
  return DOMAIN_BY_ID.get(domain)?.focuses.some((f) => f.id === focus)
    ? { domain, focus }
    : undefined;
}

/**
 * How far one corner sits from another, measured in the people it is for.
 *
 * The taxonomy files livestream clipping and the family photo box under the
 * same heading, because both are video. Nobody who asked for one wants the
 * other, and offering it back is the single most obvious way to look like the
 * question was never read. Who a corner is *for* separates them where the
 * heading cannot.
 *
 * Sharing nobody makes a corner a stranger. Sharing everybody makes it the
 * same product under a second name: short-form video and livestreams are both
 * for streamers and creators, so a clipper turns up twice in one batch wearing
 * different words. Sharing some of them, and not all, is the only distance
 * worth showing: the same sort of person, a different project.
 */
type Distance = "same" | "near" | "twin" | "stranger";

function focusDef(id: string) {
  const [domain, focus] = id.split(":");
  return DOMAIN_BY_ID.get(domain)?.focuses.find((f) => f.id === focus);
}

/** Corners named as serving the same person, in either direction. */
function isNeighbour(a: string, b: string): boolean {
  return Boolean(focusDef(a)?.neighbours?.includes(b) || focusDef(b)?.neighbours?.includes(a));
}

function distanceFrom(anchor: string, other: string): Distance {
  if (anchor === other) return "same";
  // A named neighbour is the whole point of naming it, and it lives in another
  // area, so audience ids could never have found it.
  if (isNeighbour(anchor, other)) return "near";
  const mine = FOCUS_AUDIENCES[anchor] ?? [];
  const theirs = FOCUS_AUDIENCES[other] ?? [];
  // Nothing recorded either side. Silence is not evidence of a bad fit.
  if (!mine.length || !theirs.length) return "near";
  const shared = mine.filter((a) => theirs.includes(a));
  if (!shared.length) return "stranger";
  return shared.length === mine.length && shared.length === theirs.length ? "twin" : "near";
}

/** The closest any of these corners sits to `id`. */
function nearestDistance(from: { domain: string; focus: string }[], id: string): Distance {
  const order: Distance[] = ["same", "near", "twin", "stranger"];
  let best: Distance = "stranger";
  for (const c of from) {
    const d = distanceFrom(`${c.domain}:${c.focus}`, id);
    if (order.indexOf(d) < order.indexOf(best)) best = d;
  }
  return best;
}

/**
 * Every corner of the areas these corners belong to, minus the strangers.
 *
 * Opening the area up is meant to find the better project next door, not to
 * empty the drawer onto the table.
 */
function widen(chosen: { domain: string; focus: string }[]) {
  const all = [...new Set(chosen.map((c) => c.domain))].flatMap((d) =>
    (DOMAIN_BY_ID.get(d)?.focuses ?? []).map((f) => ({ domain: d, focus: f.id })),
  );
  // Areas that cannot supply a second project for the same person say where
  // else to look. Without this a streamer gets one useful neighbour and then
  // the same clipping tool again under a different heading.
  for (const c of chosen) {
    for (const id of focusDef(`${c.domain}:${c.focus}`)?.neighbours ?? []) {
      const [domain, focus] = id.split(":");
      if (!all.some((x) => x.domain === domain && x.focus === focus)) all.push({ domain, focus });
    }
  }
  const kept = all.filter((c) => nearestDistance(chosen, `${c.domain}:${c.focus}`) !== "stranger");
  return kept.length > chosen.length ? kept : all;
}

/** `domain:focus` pairs the person is in the market for. */
function focusPool(p: Profile, seen?: Set<string>): { domain: string; focus: string }[] {
  const chosen = p.focuses.length
    ? p.focuses.map((f) => {
        const [domain, focus] = f.split(":");
        return { domain, focus };
      })
    : effectiveDomains(p).flatMap((d) =>
        (DOMAIN_BY_ID.get(d)?.focuses ?? []).map((f) => ({ domain: d, focus: f.id })),
      );

  if (!p.focuses.length) return chosen;

  // A corner nobody chose was inferred from a sentence, so the whole area is
  // in play from the first batch rather than only once the corner runs dry.
  if (describedCorner(p)) return widen(chosen);

  // One corner holds only a handful of problems, and a batch uses all of them
  // at once. Asking for three more then returns the same three headings for
  // ever. Once the corner is spent the neighbouring corners of the same area
  // open up, which keeps the ideas on the subject without repeating them.
  if (!seen?.size) return chosen;

  const shown = new Set<string>();
  for (const id of seen) {
    const parts = id.split(".");
    if (parts.length >= 6) shown.add(`${parts[0]}.${parts[1]}.${parts[5]}`);
  }

  const spent = chosen.every(({ domain, focus }) => {
    const def = DOMAIN_BY_ID.get(domain)?.focuses.find((f) => f.id === focus);
    const problems = def?.problems.length ?? 0;
    if (!problems) return true;
    for (let i = 0; i < problems; i++) {
      if (!shown.has(`${domain}.${focus}.p${i}`)) return false;
    }
    return true;
  });
  if (!spent) return chosen;

  return widen(chosen);
}

function audiencePool(p: Profile, domain: string, focus?: string): string[] {
  const chosen = p.audiences.filter(
    (a) => a === "self" || a.startsWith("text:") || a.startsWith(`${domain}:`),
  );
  if (chosen.length) return chosen;
  if (p.audiences.includes("self")) return ["self"];

  // Nobody said, so the corner decides. An area's four audiences are not
  // interchangeable across its corners, and offering a livestream tool to the
  // family archivist is the misfire people actually notice.
  const fitting = focus ? (FOCUS_AUDIENCES[`${domain}:${focus}`] ?? []) : [];
  if (fitting.length) return fitting.map((a) => `${domain}:${a}`);

  const d = DOMAIN_BY_ID.get(domain);
  return (d?.audiences ?? []).map((a) => `${domain}:${a.id}`);
}

function audienceLabel(id: string): string {
  if (id === "self") return "you";
  // Someone who said who it was for gets their own words back, rather than the
  // nearest option off a list.
  if (id.startsWith("text:")) return id.slice(5);
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

/**
 * The subject in their own words, when saying it back adds something.
 *
 * Someone who typed "a tool to clip livestreams" should see livestreams in the
 * idea, not "video". Three things disqualify it. The problem sentence already
 * saying it, because naming the same thing twice in one line reads worse than
 * never naming it. Being the audience as well, because "for dungeon masters
 * working with dungeon masters" is nonsense. And needing an article to be
 * grammatical: "built around livestreams" and "built around wasting food" both
 * work, "built around codebase" does not, so only plurals and -ing phrases,
 * which never take one, are kept.
 */
function usableTopic(p: Profile, draft: Draft, problem: string, who: string): string | undefined {
  const topic = p.topic?.trim().toLowerCase();
  if (!topic || topic.length > 28) return undefined;

  // Later batches move into neighbouring corners once the described one is
  // spent. Those ideas are not about the thing that was typed, so they do not
  // get to claim they are.
  const corner = `${draft.domain}:${draft.focus}`;
  if (p.focuses.length && !p.focuses.includes(corner)) return undefined;

  const last = topic.split(" ").at(-1) ?? "";
  const articleFree =
    last.endsWith("ing") ||
    (last.endsWith("s") && !/(ss|us|is)$/.test(last) && last.length > 3);
  if (!articleFree) return undefined;

  if (who.toLowerCase().includes(topic) || topic.includes(who.toLowerCase())) return undefined;

  // Loose enough to catch "clips" against "clipping", tight enough not to fire
  // on every short word the two happen to share.
  const haystack = problem.toLowerCase();
  const parts = topic.split(" ").filter((w) => w.length > 3);
  if (parts.some((w) => haystack.includes(w.slice(0, Math.max(4, w.length - 2))))) return undefined;

  return topic;
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
  const focuses = focusPool(p, seen);
  // The corner a description landed on. The first idea of every batch is taken
  // from it, so opening the area up never costs someone the thing they asked
  // about: one card is on the nose and the other two are somewhere new.
  const anchor = describedCorner(p);
  const anchorId = anchor ? `${anchor.domain}:${anchor.focus}` : undefined;
  // Corners for the same sort of person are what the other two slots are for.
  // The described corner keeps a full share of its own, because its remaining
  // problems beat a second name for the project already on the page.
  const cornerWeight = (c: { domain: string; focus: string }) => {
    if (!anchorId) return 1;
    const d = distanceFrom(anchorId, `${c.domain}:${c.focus}`);
    return d === "near" ? 3 : d === "same" ? 2.4 : 0.3;
  };
  const mechanics = mechanicPool(p);
  const twists = twistPool(p);
  const byCorner = new Map<string, ReturnType<typeof twistsFor>>();
  // The shape someone described in their own words. It is a strong steer and
  // not a rule: three cards of the same shape would be one card three times.
  const described = new Set(p.shapes ?? []);

  const r = rng(hash(JSON.stringify(p) + salt + seen.size));

  const drafts: Draft[] = [];
  const used = {
    fingerprints: new Set<string>(),
    mechanics: new Set<string>(),
    twists: new Set<string>(),
    problems: new Set<string>(),
    focuses: new Set<string>(),
    titles: new Set<string>(),
    audiences: new Set<string>(),
    steps: new Set<string>(),
  };
  let exhausted = false;

  const enoughFocuses = focuses.length >= count;
  const enoughAudiences =
    new Set(focuses.flatMap(({ domain, focus }) => audiencePool(p, domain, focus))).size >= count;

  // A heading that has already been shown is worth avoiding for as long as an
  // unused one exists, because the same three names coming back is what makes
  // a second batch look like the first one.
  const shownProblems = new Set<string>();
  for (const id of seen) {
    const parts = id.split(".");
    if (parts.length >= 6) shownProblems.add(`${parts[0]}.${parts[1]}.${parts[5]}`);
  }

  // Each pass drops one variety rule, so a narrow profile still fills the page.
  // `twin` holds longest of the relaxable rules: a second name for the project
  // already on the page is the complaint this whole path exists to answer, and
  // one more problem out of the described corner beats it every time.
  const passes = [
    { focus: enoughFocuses, audience: enoughAudiences, mechanic: true, twist: true, problem: true, fresh: true, twin: true, step: true, seenOk: false },
    { focus: false, audience: enoughAudiences, mechanic: true, twist: true, problem: true, fresh: true, twin: true, step: true, seenOk: false },
    { focus: false, audience: false, mechanic: true, twist: true, problem: true, fresh: true, twin: true, step: true, seenOk: false },
    { focus: false, audience: false, mechanic: false, twist: true, problem: true, fresh: true, twin: true, step: true, seenOk: false },
    { focus: false, audience: false, mechanic: false, twist: true, problem: true, fresh: false, twin: true, step: true, seenOk: false },
    { focus: false, audience: false, mechanic: false, twist: false, problem: true, fresh: false, twin: true, step: true, seenOk: false },
    { focus: false, audience: false, mechanic: false, twist: false, problem: false, fresh: false, twin: false, step: false, seenOk: false },
    { focus: false, audience: false, mechanic: false, twist: false, problem: false, fresh: false, twin: false, step: false, seenOk: true },
  ];

  type Rules = (typeof passes)[number];

  function attempt(rules: Rules, forced?: { domain: string; focus: string }): void {
      const { domain, focus } = forced ?? weighted(focuses, cornerWeight, r);
      const focusDef = DOMAIN_BY_ID.get(domain)?.focuses.find((f) => f.id === focus);
      if (!focusDef) return;
      if (rules.twin && anchorId && distanceFrom(anchorId, `${domain}:${focus}`) === "twin") {
        return;
      }

      const problem = Math.floor(r() * focusDef.problems.length) % focusDef.problems.length;
      // Audiences belong to corners, not to areas: a livestream tool addressed
      // to the family archivist is the same misfire as the wrong shape.
      const audience = pick(audiencePool(p, domain, focus), r);
      // Shapes that suit this corner are far likelier, so an idea reads as
      // something designed for the problem rather than bolted onto it.
      const suited = FOCUS_SHAPES[`${domain}:${focus}`] ?? [];
      const mechanic = weighted(
        mechanics,
        (x) => x.w * (suited.includes(x.m.id) ? 6 : 1) * (described.has(x.m.id) ? 5 : 1),
        r,
      ).m;

      const corner = `${domain}:${focus}`;
      if (!byCorner.has(corner)) byCorner.set(corner, twistsFor(domain, focus, twists));
      const twist = weighted(byCorner.get(corner)!, (x) => x.w, r).t;

      const fingerprint = `${domain}.${focus}.${audience}.${mechanic.id}.${twist.id}.p${problem}`;
      const problemKey = `${domain}.${focus}.p${problem}`;
      // The name belongs to the problem, not to a bag of nouns, so two ideas
      // about different problems can never end up as the same word.
      const title = focusDef.names[problem % focusDef.names.length];

      if (used.fingerprints.has(fingerprint)) return;
      if (rules.focus && used.focuses.has(`${domain}.${focus}`)) return;
      if (rules.audience && used.audiences.has(audience)) return;
      if (rules.mechanic && used.mechanics.has(mechanic.id)) return;
      if (rules.twist && used.twists.has(twist.id)) return;
      if (rules.problem && used.problems.has(problemKey)) return;
      // The first step belongs to the corner, so two cards out of one corner
      // print the same instruction twice. On screen that is the clearest
      // possible signal that a batch is one idea wearing two names.
      if (rules.step && used.steps.has(focusDef.build)) return;
      if (rules.fresh && shownProblems.has(problemKey)) return;
      if (!rules.seenOk && used.titles.has(title)) return;
      if (!rules.seenOk && seen.has(fingerprint)) return;
      if (rules.seenOk && seen.has(fingerprint)) exhausted = true;

      used.fingerprints.add(fingerprint);
      used.focuses.add(`${domain}.${focus}`);
      used.audiences.add(audience);
      used.mechanics.add(mechanic.id);
      used.twists.add(twist.id);
      used.problems.add(problemKey);
      used.titles.add(title);
      used.steps.add(focusDef.build);

      drafts.push({ domain, focus, problem, audience, mechanic: mechanic.id, twist: twist.id, title, fingerprint });
  }

  // The described corner walks the whole ladder on its own before anything
  // else is drafted.
  //
  // Sharing the ladder with the general search let one strict pass give the
  // slot away for good. Once a corner's three problems had all been shown
  // once, every early pass rejected it, a neighbour took the first slot, and
  // the batch went out with nothing in it about the thing that was typed,
  // while the page above still said the first one answered it head on.
  if (anchor) {
    for (const rules of passes) {
      if (drafts.length) break;
      for (let i = 0; i < 400 && !drafts.length; i++) attempt(rules, anchor);
    }
  }

  for (const rules of passes) {
    if (drafts.length >= count) break;
    for (let i = 0; i < 1200 && drafts.length < count; i++) attempt(rules);
  }

  // What a corner holds, where it goes and how to start are written once per
  // corner, so a batch forced to draw twice from the same one would print all
  // three of those sentences twice. The second card says the parts that are
  // its own and stays quiet about the rest.
  const cornersSeen = new Set<string>();
  const spin = Math.floor(r() * 5);
  const ideas = drafts.map((draft, i) => {
    const corner = `${draft.domain}:${draft.focus}`;
    const repeat = cornersSeen.has(corner);
    cornersSeen.add(corner);
    return buildIdea(p, draft, spin + i, repeat);
  });
  return { ideas, exhausted };
}

/**
 * The subject, when it is not the problem sentence again.
 *
 * "It works with hours of live footage and the few moments inside it" says
 * nothing next to "pull the moments worth posting out of a four-hour stream",
 * and a card that repeats itself reads as padding. Where the two do not
 * overlap it is the line that says what the software actually holds, which is
 * the difference between "notice which members are drifting off" and knowing
 * that the members are a small community's.
 */
function usableSubject(subject: string, problem: string): string | undefined {
  const haystack = problem.toLowerCase();
  const shared = subject
    .toLowerCase()
    .split(/[^a-z]+/)
    .filter((w) => w.length > 4)
    .some((w) => haystack.includes(w.slice(0, Math.max(4, w.length - 2))));
  return shared ? undefined : subject;
}

/**
 * The idea, in words anyone can read.
 *
 * What it is, who it is for and what it does, then what it holds, then how it
 * works, then the one thing that makes it unusual, then where it goes once the
 * first version runs. The last of those is the only part that could not be
 * guessed from the heading, and the whole point of the paragraph is that every
 * sentence says something about *this* idea rather than about software in
 * general. No stack, no reasoning about the person, no product-design words.
 */
function buildIdea(p: Profile, draft: Draft, index = 0, repeatOfCorner = false): Idea {
  const d = DOMAIN_BY_ID.get(draft.domain)!;
  const focus = d.focuses.find((f) => f.id === draft.focus)!;
  const mechanic = MECHANIC_BY_ID.get(draft.mechanic)!;
  const twist = TWIST_BY_ID.get(draft.twist)!;

  const problem = focus.problems[draft.problem];
  const who = audienceLabel(draft.audience);
  const thing = thingNoun(p, mechanic.surfaces);

  // Three ideas that all open "A phone app that helps X" read as one idea
  // three times, however different the rest of the sentence is.
  const lower = `${thing.charAt(0).toLowerCase()}${thing.slice(1)}`;
  // Every opening names who it is for. The one that did not read as a product
  // with no customer, which is the sentence a card can least afford.
  const openings = [
    `${thing} that helps ${who} ${problem}.`,
    `${thing} to ${problem}, built for ${who}.`,
    `For ${who}: ${lower} to ${problem}.`,
    `${thing} that lets ${who} ${problem}.`,
  ];

  // Their own words go in every other card. On all three it turns into a
  // formula, and a batch that never says them has not listened.
  const topic = usableTopic(p, draft, problem, who);
  const topicOpenings = topic
    ? [
        `${thing} built around ${topic} that helps ${who} ${problem}.`,
        `${thing} for ${topic} that helps ${who} ${problem}.`,
        `Made for ${topic}: ${lower} that helps ${who} ${problem}.`,
      ]
    : [];

  const line = topicOpenings.length && index % 2 === 0
    ? topicOpenings[Math.floor(index / 2) % topicOpenings.length]
    : openings[index % openings.length];

  const subject = repeatOfCorner ? undefined : usableSubject(focus.subject, problem);
  const holds = subject ? `It works with ${subject}. ` : "";
  // Where it goes once the first version runs. Concrete, and tied to this
  // corner rather than to software in general, which is what stops the last
  // sentence of a card from being interchangeable with any other card's.
  const later = repeatOfCorner
    ? ""
    : ` Later: ${focus.stretch.charAt(0).toLowerCase()}${focus.stretch.slice(1)}`;

  return {
    id: draft.fingerprint,
    title: draft.title,
    pitch: `${line} ${holds}${mechanic.plain} ${twist.sentence}${later}`,
    // The one thing that makes a card worth more than the sentence someone
    // arrived with: something to open an editor and do tonight.
    firstStep: repeatOfCorner ? undefined : focus.build,
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
  const audiences = new Set(pairs.flatMap((f) => audiencePool(p, f.domain, f.focus))).size || 1;
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
  const audiences = new Set(pairs.flatMap((f) => audiencePool(p, f.domain, f.focus)));

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

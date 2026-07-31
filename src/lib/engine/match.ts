import { DOMAINS } from "./taxonomy";
import {
  AUDIENCE_LEADS,
  DOMAIN_TERMS,
  FILLER,
  FOCUS_TERMS,
  MOTIVATION_TERMS,
  PEOPLE_WORDS,
  SELF_TERMS,
  SURFACE_TERMS,
  TIME_TERMS,
} from "./vocabulary";

export type Confidence = "strong" | "weak" | "none";

export type Reading = {
  domains: string[];
  focuses: string[];
  surfaces: string[];
  motivations: string[];
  timeBudget?: string;
  /** Who it is for, in the words they used. Empty when they never said. */
  audience?: string;
  audienceSelf: boolean;
  matched: string[];
  leftovers: string[];
  confidence: Confidence;
  domainScores: Record<string, number>;
  focusScores: Record<string, number>;
};

const EMPTY: Reading = {
  domains: [],
  focuses: [],
  surfaces: [],
  motivations: [],
  audienceSelf: false,
  matched: [],
  leftovers: [],
  confidence: "none",
  domainScores: {},
  focusScores: {},
};

export function stem(word: string): string {
  let w = word.toLowerCase();
  if (w.length <= 3) return w;
  if (w.endsWith("'s") || w.endsWith("’s")) w = w.slice(0, -2);
  if (w.endsWith("ies") && w.length > 4) return w.slice(0, -3) + "y";
  if (w.endsWith("sses")) return w.slice(0, -2);
  if (w.endsWith("s") && !w.endsWith("ss") && !w.endsWith("us") && !w.endsWith("is")) {
    w = w.slice(0, -1);
  }
  if (w.endsWith("ing") && w.length > 5) w = undouble(w.slice(0, -3));
  else if (w.endsWith("ed") && w.length > 4) w = undouble(w.slice(0, -2));
  else if (w.endsWith("ly") && w.length > 4) w = w.slice(0, -2);
  return w;
}

function undouble(w: string): string {
  const last = w.at(-1);
  const prev = w.at(-2);
  if (last && last === prev && !"aeiou".includes(last) && last !== "l" && last !== "s") {
    return w.slice(0, -1);
  }
  if (w.length > 3 && w.endsWith("i")) return w.slice(0, -1) + "y";
  return w;
}

export function words(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .split(" ")
    .filter(Boolean);
}

const FILLER_STEMS = new Set(FILLER.map((w) => stem(w)));

type Term = { key: string; size: number; boost: number; surface: string };

function terms(source: string[], boost: number, allowFiller = false): Term[] {
  const out: Term[] = [];
  const minLength = boost <= 0.6 ? 5 : 3;
  for (const raw of source) {
    const parts = words(raw);
    if (!parts.length) continue;
    const k = parts.map(stem).join(" ");
    if (parts.length === 1) {
      if (!allowFiller && FILLER_STEMS.has(k)) continue;
      if (k.length < minLength) continue;
    }
    out.push({ key: k, size: parts.length, boost, surface: raw });
  }
  return out;
}

const FOCUS_IDS: string[] = [];
const FOCUS_TERM_INDEX = new Map<string, Term[]>();
const DOMAIN_TERM_INDEX = new Map<string, Term[]>();
const DOMAIN_OF_FOCUS = new Map<string, string>();

for (const d of DOMAINS) {
  DOMAIN_TERM_INDEX.set(d.id, [
    ...terms(DOMAIN_TERMS[d.id] ?? [], 1),
    ...terms(d.keywords, 0.8),
    ...terms(words(d.label), 0.5),
  ]);

  for (const f of d.focuses) {
    const id = `${d.id}:${f.id}`;
    FOCUS_IDS.push(id);
    DOMAIN_OF_FOCUS.set(id, d.id);
    FOCUS_TERM_INDEX.set(id, [
      ...terms(FOCUS_TERMS[id] ?? [], 1),
      ...terms(words(f.label), 0.6),
      ...terms(words(f.hint), 0.4),
      ...terms(words(f.subject), 0.4),
      ...terms(f.problems.flatMap((p) => words(p)), 0.3),
    ]);
  }
}

const DOC_FREQUENCY = new Map<string, number>();
for (const id of FOCUS_IDS) {
  const seen = new Set<string>();
  for (const t of FOCUS_TERM_INDEX.get(id) ?? []) seen.add(t.key);
  const domain = DOMAIN_OF_FOCUS.get(id);
  if (domain) for (const t of DOMAIN_TERM_INDEX.get(domain) ?? []) seen.add(t.key);
  for (const k of seen) DOC_FREQUENCY.set(k, (DOC_FREQUENCY.get(k) ?? 0) + 1);
}

const TOTAL_DOCS = FOCUS_IDS.length;

function rarity(k: string): number {
  const df = DOC_FREQUENCY.get(k) ?? 1;
  return Math.log(TOTAL_DOCS / df) + 0.25;
}

const SIZE_BONUS = [0, 1, 1.9, 2.6, 3.2];

function sizeBonus(size: number): number {
  return SIZE_BONUS[Math.min(size, 4)];
}

function gramsOf(stems: string[], into: Set<string>): void {
  for (let i = 0; i < stems.length; i++) {
    into.add(stems[i]);
    if (i + 1 < stems.length) into.add(`${stems[i]} ${stems[i + 1]}`);
    if (i + 2 < stems.length) into.add(`${stems[i]} ${stems[i + 1]} ${stems[i + 2]}`);
  }
}

/**
 * Every gram in the sentence, with some positions cut out.
 *
 * A cut breaks the run rather than closing over it, so removing "newcomers"
 * from "for newcomers to the gym" cannot invent the phrase "for to".
 */
function grams(stems: string[], skip?: Set<number>): Set<string> {
  const out = new Set<string>();
  if (!skip?.size) {
    gramsOf(stems, out);
    return out;
  }
  let run: string[] = [];
  for (let i = 0; i <= stems.length; i++) {
    if (i === stems.length || skip.has(i)) {
      if (run.length) gramsOf(run, out);
      run = [];
      continue;
    }
    run.push(stems[i]);
  }
  return out;
}

function scoreAgainst(list: Term[], present: Set<string>, hits: Map<string, string>): number {
  let total = 0;
  const counted = new Set<string>();
  for (const t of list) {
    if (counted.has(t.key) || !present.has(t.key)) continue;
    counted.add(t.key);
    total += rarity(t.key) * t.boost * sizeBonus(t.size);
    const existing = hits.get(t.key);
    if (!existing || t.surface.length > existing.length) hits.set(t.key, t.surface);
  }
  return total;
}

function flatMatch(map: Record<string, string[]>, present: Set<string>): string[] {
  const scored: { id: string; score: number }[] = [];
  for (const [id, list] of Object.entries(map)) {
    let score = 0;
    for (const t of terms(list, 1, true)) {
      if (present.has(t.key)) score += sizeBonus(t.size);
    }
    if (score > 0) scored.push({ id, score });
  }
  return scored.sort((a, b) => b.score - a.score).map((s) => s.id);
}

const PEOPLE = new Set(PEOPLE_WORDS.filter((w) => !w.includes(" ")).map(stem));
const PEOPLE_PAIRS = new Set(
  PEOPLE_WORDS.filter((w) => w.includes(" ")).map((w) => words(w).map(stem).join(" ")),
);
const LEAD_WORDS = new Set(AUDIENCE_LEADS.map((w) => words(w)[0]));
const PEOPLE_ENDINGS = /(ers|ists|ians|ors)$/;

function peopleWord(word: string, stemmed: string): boolean {
  if (PEOPLE.has(stemmed)) return true;
  return PEOPLE_ENDINGS.test(word) && word.length > 5 && !FILLER_STEMS.has(stemmed);
}

/**
 * Who the sentence says it is for, kept in their own words.
 *
 * A word straight after "for" wins, because that is where people put it. Any
 * people-shaped word elsewhere is the fallback, so "gamers keep losing clips"
 * still knows who this is about.
 */
/**
 * Where the sentence names an audience, rather than a subject.
 *
 * Who a thing is for is not what it is about. "An app for newcomers to the gym"
 * is a gym idea with an audience, but "newcomers" is also the word a community
 * tool would use, and left in the scoring it outvotes "gym" and lands the whole
 * flow in the wrong area. These positions are cut before anything is scored.
 *
 * Only people introduced by "for", "helps", "built for" and the like count.
 * People named anywhere else are usually the point rather than the audience:
 * "I forget to message my friends" is a friends idea, and cutting the friends
 * out of it leaves nothing worth reading.
 */
function peoplePositions(raw: string[], stems: string[]): Set<number> {
  const out = new Set<number>();
  for (let i = 0; i < raw.length - 1; i++) {
    if (!LEAD_WORDS.has(raw[i])) continue;
    for (let j = i + 1; j < Math.min(i + 4, raw.length); j++) {
      if (j + 1 < raw.length && PEOPLE_PAIRS.has(`${stems[j]} ${stems[j + 1]}`)) {
        out.add(j);
        out.add(j + 1);
        break;
      }
      if (peopleWord(raw[j], stems[j])) {
        out.add(j);
        break;
      }
    }
  }
  return out;
}

function detectAudience(raw: string[], stems: string[]): string | undefined {
  for (let i = 0; i < raw.length - 1; i++) {
    const pair = `${stems[i]} ${stems[i + 1]}`;
    if (PEOPLE_PAIRS.has(pair)) return `${raw[i]} ${raw[i + 1]}`;
  }
  for (let i = 0; i < raw.length - 1; i++) {
    if (!LEAD_WORDS.has(raw[i])) continue;
    for (let j = i + 1; j < Math.min(i + 4, raw.length); j++) {
      if (peopleWord(raw[j], stems[j])) return raw[j];
    }
  }
  for (let i = 0; i < raw.length; i++) {
    if (peopleWord(raw[i], stems[i])) return raw[i];
  }
  return undefined;
}

const FOCUS_FLOOR = 1.6;
const DOMAIN_FLOOR = 1.6;
const STRONG = 3.4;
const WEAK = 1.4;
/** How far ahead the winning area has to be before one term can settle it. */
const CLEAR_LEAD = 1.5;

type Scores = {
  focusScores: Record<string, number>;
  domainScores: Record<string, number>;
  hits: Map<string, string>;
};

function scoreEverything(present: Set<string>): Scores {
  const hits = new Map<string, string>();

  const focusScores: Record<string, number> = {};
  for (const id of FOCUS_IDS) {
    const score = scoreAgainst(FOCUS_TERM_INDEX.get(id) ?? [], present, hits);
    if (score > 0) focusScores[id] = round(score);
  }

  const domainScores: Record<string, number> = {};
  for (const d of DOMAINS) {
    let score = scoreAgainst(DOMAIN_TERM_INDEX.get(d.id) ?? [], present, hits);
    for (const f of d.focuses) score += (focusScores[`${d.id}:${f.id}`] ?? 0) * 0.85;
    if (score > 0) domainScores[d.id] = round(score);
  }

  return { focusScores, domainScores, hits };
}

export function read(text: string): Reading {
  const raw = words(text);
  if (!raw.length) return EMPTY;

  const stems = raw.map(stem);
  const people = peoplePositions(raw, stems);

  // The subject first, with the audience taken out of it. If naming the people
  // was the only thing said, that is still a signal, so it gets read again.
  let { focusScores, domainScores, hits } = scoreEverything(grams(stems, people));
  if (!Object.keys(domainScores).length && people.size) {
    ({ focusScores, domainScores, hits } = scoreEverything(grams(stems)));
  }

  const ranked = Object.values(domainScores).sort((a, b) => b - a);
  const topDomain = ranked[0] ?? 0;
  const runnerUp = ranked[1] ?? 0;
  const domains = Object.entries(domainScores)
    .filter(([, s]) => s >= Math.max(DOMAIN_FLOOR, topDomain * 0.45))
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([id]) => id);

  const allowed = new Set(domains);
  const eligible = Object.entries(focusScores).filter(
    ([id]) => !allowed.size || allowed.has(DOMAIN_OF_FOCUS.get(id) ?? ""),
  );
  const topFocus = Math.max(0, ...eligible.map(([, s]) => s));
  const focuses = eligible
    .filter(([, s]) => s >= Math.max(FOCUS_FLOOR, topFocus * 0.55))
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([id]) => id);

  // A corner is more specific than the area around it, so once one lands the
  // areas come from it rather than the other way round.
  const fromFocuses = [...new Set(focuses.map((id) => DOMAIN_OF_FOCUS.get(id) ?? ""))].filter(
    Boolean,
  );

  // One word can be enough. "A gym app" says as much as a whole paragraph, and
  // asking which area that belongs in reads as not having listened. What counts
  // is how much the winning area is worth and how far clear of the next it is,
  // not how many separate words happened to land.
  const decisive = runnerUp === 0 || topDomain >= runnerUp * CLEAR_LEAD;
  const evidence = hits.size > 1 || [...hits.keys()].some((k) => k.includes(" ")) || decisive;
  const confidence: Confidence =
    topDomain >= STRONG && evidence ? "strong" : topDomain >= WEAK ? "weak" : "none";

  const matched = [...hits.values()];
  const matchedStems = new Set(matched.flatMap((m) => words(m).map(stem)));
  const leftovers = [
    ...new Set(
      raw.filter(
        (w, i) => !FILLER_STEMS.has(stems[i]) && !matchedStems.has(stems[i]) && w.length > 3,
      ),
    ),
  ];

  // Shape, time and reason are read from the whole sentence: "an app for
  // runners on my phone" says mobile, and the people in it change nothing.
  const everything = grams(stems);
  const timeBudget = flatMatch(TIME_TERMS, everything)[0];

  return {
    domains: fromFocuses.length ? fromFocuses : domains,
    focuses,
    surfaces: flatMatch(SURFACE_TERMS, everything).slice(0, 2),
    motivations: flatMatch(MOTIVATION_TERMS, everything).slice(0, 2),
    timeBudget,
    audience: detectAudience(raw, stems),
    audienceSelf: terms(SELF_TERMS, 1).some((t) => everything.has(t.key)),
    matched,
    leftovers,
    confidence,
    domainScores,
    focusScores,
  };
}

function round(n: number): number {
  return Math.round(n * 100) / 100;
}

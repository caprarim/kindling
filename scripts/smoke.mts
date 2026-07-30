// Throwaway check of the question ladder and the never-repeat guarantee.
// npm run smoke
import { nextQuestion } from "../src/lib/engine/questions";
import { read } from "../src/lib/engine/match";
import { generateIdeas } from "../src/lib/engine/generate";
import { emptyProfile, type Profile, type Question } from "../src/lib/engine/types";

function walk(name: string, choose: (q: Question, step: number) => string[] | "skip") {
  const p: Profile = emptyProfile();
  const asked: string[] = [];
  for (let i = 0; i < 30; i++) {
    const q = nextQuestion(p);
    if (!q) break;
    asked.push(q.id);
    const pick = choose(q, i);
    if (pick === "skip") {
      if (!q.escape) throw new Error(`${name}: tried to skip ${q.id} which has no escape hatch`);
      p.skipped.push(q.id);
      continue;
    }
    if (q.kind === "text") (p as Record<string, unknown>)[q.field] = pick[0];
    else if (q.kind === "single") (p as Record<string, unknown>)[q.field] = pick[0];
    else (p as Record<string, unknown>)[q.field] = pick;
  }
  if (nextQuestion(p)) throw new Error(`${name}: flow never terminated. asked=${asked.join(" > ")}`);
  console.log(`âœ“ ${name}\n    ${asked.join(" â†’ ")}`);
  return p;
}

const first = (q: Question) => [q.choices![0].id];
const two = (q: Question) => q.choices!.slice(0, 2).map((c) => c.id);

// Every question now commits on the first tap, so one pick is what the UI
// actually sends. Only the two-vibe question asks for more than one.
const answerAs = (q: Question) => (q.id === "vibes" ? two(q) : first(q));

// 1. Someone who knows what they want. The description still flags the domains
// it matched, it just no longer pre-ticks them.
const known = walk("has-idea", (q) => {
  if (q.id === "path") return ["has-idea"];
  if (q.kind === "text") return ["something to stop me wasting food in the fridge"];
  if (q.id === "domains") {
    const matched = q.choices!.filter((c) => c.hint?.includes("matched the description"));
    if (!matched.length) throw new Error("the description was not flagged on any domain");
    return [matched[0].id];
  }
  return answerAs(q);
});

// 2. Rough direction.
walk("rough-direction", (q) => {
  if (q.id === "path") return ["rough-direction"];
  return answerAs(q);
});

// 3. No idea, but interests land.
walk("no-idea, interests land", (q) => {
  if (q.id === "path") return ["no-idea"];
  return answerAs(q);
});

// 4. No idea, no interests, no skills, no frustrations â€” the floor.
const floor = walk("no-idea, all escapes taken", (q, i) => {
  if (q.id === "path") return ["no-idea"];
  if (["interests", "skills", "frustrations"].includes(q.id) && i < 4) return "skip";
  return answerAs(q);
});

// The free-text branch should have read the description.
if (!known.domains.includes("food")) {
  throw new Error(`free text was not read: domains=${known.domains.join(",")}`);
}
console.log("âœ“ free text 'wasting food in the fridge' â†’ food domain detected");

// 5. Never repeat, across many draws.
for (const [name, profile] of [["has-idea", known], ["floor", floor]] as const) {
  const seen = new Set<string>();
  let total = 0;
  for (let round = 0; round < 60; round++) {
    const { ideas } = generateIdeas(profile, seen, 3, String(round));
    for (const idea of ideas) {
      if (seen.has(idea.id)) throw new Error(`${name}: repeated ${idea.id} on round ${round}`);
      if (!idea.title || !idea.pitch) {
        throw new Error(`${name}: malformed idea ${JSON.stringify(idea)}`);
      }
      seen.add(idea.id);
      total++;
    }
  }
  console.log(`âœ“ ${name}: ${total} ideas across 60 draws, zero repeats`);
}

// 6. Three ideas from one set of answers have to be three different ideas, and
// the name is the part people actually notice repeating.
for (const [name, profile] of [["has-idea", known], ["floor", floor]] as const) {
  for (let round = 0; round < 40; round++) {
    const { ideas: batch } = generateIdeas(profile, new Set(), 3, `variety-${round}`);
    if (batch.length !== 3) throw new Error(`${name}: got ${batch.length} ideas, wanted 3`);
    const distinct = (values: string[]) => new Set(values).size;
    const titles = distinct(batch.map((i) => i.title));
    const shapes = distinct(batch.map((i) => i.slots.mechanic));
    const twists = distinct(batch.map((i) => i.slots.twist));
    const pitches = distinct(batch.map((i) => i.pitch));
    if (titles < 3) {
      throw new Error(`${name}: batch repeated a name (${batch.map((i) => i.title).join(", ")})`);
    }
    if (shapes < 3 || twists < 3 || pitches < 3) {
      throw new Error(`${name}: batch repeated copy (${shapes} shapes, ${twists} twists, ${pitches} pitches)`);
    }
  }
  console.log(`âœ“ ${name}: 40 batches of 3, no repeated name, shape, constraint or pitch`);
}

// 7. Nothing a reader sees may carry product or stack vocabulary.
const JARGON = [
  "quiet tracker", "matchmaker", "visualiser", "well-kept library", "capture tool",
  "what-if tool", "structured challenge", "annotation layer", "small exchange",
  "transformer", "companion app", "well-timed prompt", "offline-first", "navigation",
  "interaction", "React", "Expo", "Tauri", "Next.js", "TypeScript", "DuckDB", "stylesheet",
];
for (const [name, profile] of [["has-idea", known], ["floor", floor]] as const) {
  const seen = new Set<string>();
  for (let round = 0; round < 40; round++) {
    for (const idea of generateIdeas(profile, seen, 3, `jargon-${round}`).ideas) {
      seen.add(idea.id);
      const hit = JARGON.find((word) => idea.pitch.toLowerCase().includes(word.toLowerCase()));
      if (hit) throw new Error(`${name}: jargon "${hit}" reached the reader: ${idea.pitch}`);
      if (Object.keys(idea).sort().join(",") !== "createdAt,id,pitch,slots,title") {
        throw new Error(`${name}: an idea carries more than the idea: ${Object.keys(idea).join(",")}`);
      }
    }
  }
  console.log(`âœ“ ${name}: 120 pitches, no jargon, nothing but the idea`);
}

// 8. Reading a sentence. Anyone can type anything here, so the check is that
// the right corner comes back, and that nothing fires on a word that merely
// contains a keyword.
const READINGS: [string, string, string?][] = [
  ["an app that stops food rotting in my fridge", "food", "food:waste"],
  ["a tool for tracking my gym workouts and progress", "health", "health:training"],
  ["help me split bills with my housemates", "money", "money:shared"],
  ["I want to learn spanish vocabulary properly", "learning", "learning:language"],
  ["I keep staring at a blank page instead of writing my novel", "creative", "creative:writing"],
  ["sort thousands of unsorted photos on my hard drive", "media", "media:archive"],
  ["something to plan my dnd campaign sessions", "games", "games:tabletop"],
  ["I forget to message my friends for months", "social", "social:keepintouch"],
  ["an app to keep my houseplants alive", "home", "home:plants"],
  ["planning a hiking trip with routes and weather", "outdoors"],
  ["a terminal tool that helps me debug flaky tests", "dev", "dev:debugging"],
  ["something that summarises long pdfs for me", "ai", "ai:reading"],
];

for (const [sentence, domain, focus] of READINGS) {
  const r = read(sentence);
  if (r.domains[0] !== domain) {
    throw new Error(`read: "${sentence}" → ${r.domains.join(",") || "nothing"}, wanted ${domain}`);
  }
  if (focus && !r.focuses.includes(focus)) {
    throw new Error(`read: "${sentence}" → focuses ${r.focuses.join(",") || "none"}, wanted ${focus}`);
  }
  if (r.confidence !== "strong") {
    throw new Error(`read: "${sentence}" landed but only came back ${r.confidence}`);
  }
}
console.log(`✓ ${READINGS.length} sentences read into the right corner`);

// Whole words only. Every one of these used to match on a substring.
const FALSE_FRIENDS: [string, string][] = [
  ["a great app for startups to train their team", "food"],
  ["a great app for startups to train their team", "creative"],
  ["a blog about explaining logic to beginners", "dev"],
  ["a blog about explaining logic to beginners", "ai"],
  ["an app for maintaining email templates", "outdoors"],
];
for (const [sentence, mustNot] of FALSE_FRIENDS) {
  if (read(sentence).domains.includes(mustNot)) {
    throw new Error(`read: "${sentence}" wrongly matched ${mustNot}`);
  }
}
console.log(`✓ ${FALSE_FRIENDS.length} substring traps rejected`);

// Vague in, honest out. Guessing here is worse than asking.
for (const vague of [
  "something that helps people improve their lives",
  "a thing for my mum",
  "an app that makes everything easier",
]) {
  const r = read(vague);
  if (r.confidence !== "none" || r.domains.length) {
    throw new Error(`read: "${vague}" guessed ${r.domains.join(",")} at ${r.confidence}`);
  }
  const q = nextQuestion({ ...emptyProfile(), path: "has-idea", ideaText: vague });
  if (q?.id !== "domains" || q.preselect?.length) {
    throw new Error(`vague text pre-ticked something: ${JSON.stringify(q?.preselect)}`);
  }
}
console.log("✓ vague descriptions ask instead of guessing");

// Endings must not matter: the stem is what gets compared.
for (const [a, b] of [
  ["I am cooking dinner", "I cook dinner"],
  ["tracking my workouts", "track my workout"],
  ["summarises long documents", "summarise a long document"],
]) {
  const [x, y] = [read(a).domains[0], read(b).domains[0]];
  if (!x || x !== y) throw new Error(`stemming: "${a}" → ${x}, "${b}" → ${y}`);
}
console.log("✓ word endings do not change the reading");

// A strong reading has to actually reach the question as ticked options.
const prefilled = nextQuestion({
  ...emptyProfile(),
  path: "has-idea",
  ideaText: "a phone app that stops food rotting in my fridge, just for me",
});
if (!prefilled?.preselect?.includes("food")) {
  throw new Error(`strong reading did not pre-tick: ${JSON.stringify(prefilled?.preselect)}`);
}
console.log("✓ a strong reading arrives pre-ticked");

const { ideas } = generateIdeas(known, new Set(), 3, "sample");
for (const i of ideas) console.log(`\n  ${i.title}\n  ${i.pitch}`);

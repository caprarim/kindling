// Throwaway check of the question ladder and the never-repeat guarantee.
// npm run smoke
import { applyReading, nextQuestion } from "../src/lib/engine/questions";
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
    // A description answers more than its own question, exactly as the app does.
    if (q.kind === "text") Object.assign(p, applyReading(p, pick[0]));
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

// 1. Someone who knows what they want. Everything the sentence settled is
// never asked about again.
const ASKED_ANYWAY = ["domains", "focuses"];
const known = walk("has-idea", (q) => {
  if (q.id === "path") return ["has-idea"];
  if (q.kind === "text") return ["something to stop me wasting food in the fridge"];
  if (ASKED_ANYWAY.includes(q.id)) {
    throw new Error(`"${q.id}" was asked even though the description answered it`);
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
if (!known.domains.includes("food") || !known.focuses.includes("food:waste")) {
  throw new Error(`free text was not read: ${known.domains.join(",")} / ${known.focuses.join(",")}`);
}
console.log("✓ 'wasting food in the fridge' filled the area and the corner, and neither was asked");

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

// Naming who it is for settles that question, and those words survive all the
// way into the pitch rather than being swapped for the nearest option.
const clipper = applyReading(
  { ...emptyProfile(), path: "has-idea" },
  "I want to make a clipping tool for gamers",
);
if (clipper.audiences[0] !== "text:gamers" || !clipper.focuses.includes("media:shortform")) {
  throw new Error(`clipping tool read as ${clipper.focuses.join(",")} for ${clipper.audiences.join(",")}`);
}
for (const id of ["domains", "focuses", "audiences"]) {
  let walked = { ...clipper };
  for (let i = 0; i < 20; i++) {
    const q = nextQuestion(walked);
    if (!q) break;
    if (q.id === id) throw new Error(`"${id}" was asked despite being in the description`);
    const answer = q.preselect?.length ? q.preselect : [q.choices![0].id];
    walked = { ...walked, [q.field]: q.kind === "single" ? answer[0] : answer };
  }
}
const clips = generateIdeas({ ...clipper, skillLevel: "comfortable", surfaces: ["desktop"], timeBudget: "few-weeks", motivations: ["fun"] }, new Set(), 3, "clips").ideas;
if (!clips.every((i) => i.pitch.includes("gamers"))) {
  throw new Error(`the audience was lost: ${clips.map((i) => i.pitch).join(" | ")}`);
}
if (new Set(clips.map((i) => i.pitch.split(" ").slice(0, 5).join(" "))).size < 3) {
  throw new Error(`all three ideas open the same way: ${clips.map((i) => i.pitch).join(" | ")}`);
}
console.log("✓ 'a clipping tool for gamers' keeps its corner, its audience and three distinct openings");

// A half-sure reading asks a plain question. Nothing arrives already ticked:
// a guess wearing a tick reads as a decision that was made without asking.
const unsure = applyReading({ ...emptyProfile(), path: "has-idea" }, "a budgeting app");
const guess = nextQuestion(unsure);
if (guess?.id !== "domains") {
  throw new Error(`a half-sure reading did not ask which area: ${guess?.id}`);
}
if (guess.preselect?.length) {
  throw new Error(`the question arrived pre-ticked: ${JSON.stringify(guess.preselect)}`);
}
if (!guess.title.endsWith("?")) {
  throw new Error(`the guess is not a question: "${guess.title}"`);
}
console.log("✓ a half-sure reading asks a plain question with nothing ticked");

// Nothing anywhere in the flow may arrive with ticks already in it.
let ticks: Profile = { ...emptyProfile() };
for (let i = 0; i < 20; i++) {
  const q = nextQuestion(ticks);
  if (!q) break;
  if (q.preselect?.length) throw new Error(`${q.id} arrives pre-ticked`);
  const answer = q.kind === "text" ? ["i wanna build a website that will help gym newcomers in gym"] : [q.choices![0].id];
  ticks = {
    ...ticks,
    [q.field]: q.kind === "single" || q.kind === "text" ? answer[0] : answer,
  } as Profile;
  if (q.field === "ideaText") ticks = applyReading(ticks, answer[0]);
}
console.log("✓ no question arrives pre-ticked");

// Three more must mean three more, not the same three headings again.
const narrow: Profile = {
  ...emptyProfile(),
  path: "rough-direction",
  domains: ["health"],
  focuses: ["health:training"],
  audiences: ["health:chronic"],
  skillLevel: "strong",
  surfaces: ["web"],
  timeBudget: "few-weeks",
  motivations: ["scratch"],
};
const across = new Set<string>();
const headings: string[] = [];
for (let b = 0; b < 3; b++) {
  const { ideas } = generateIdeas(narrow, across, 3, `batch${b}`);
  for (const idea of ideas) {
    across.add(idea.id);
    headings.push(idea.title);
    const opening = idea.pitch.split(". ")[0];
    if (headings.filter((h) => h === idea.title).length > 1) {
      throw new Error(`heading "${idea.title}" came back in batch ${b}`);
    }
    if (!opening.length) throw new Error("an idea arrived with no opening sentence");
  }
  const openings = ideas.map((i) => i.pitch.split(" ").slice(0, 4).join(" "));
  if (new Set(openings).size < ideas.length) {
    throw new Error(`batch ${b} opens the same way twice: ${openings.join(" | ")}`);
  }
}
console.log("✓ nine ideas across three batches, no repeated heading and no repeated opening");

// Who a thing is for must never decide what it is about.
const audienceCases: [string, string, string][] = [
  ["an app for newcomers to the gym", "health", "health:training"],
  ["a gym app for beginners", "health", "health:training"],
  ["a recipe app for students", "food", ""],
  ["a clipping tool for gamers", "media", "media:shortform"],
];
for (const [sentence, domain, focus] of audienceCases) {
  const r = read(sentence);
  if (r.domains[0] !== domain || (focus && r.focuses[0] !== focus)) {
    throw new Error(
      `"${sentence}" read as ${r.domains}/${r.focuses}, not ${domain}/${focus}`,
    );
  }
  if (r.confidence !== "strong") {
    throw new Error(`"${sentence}" came back ${r.confidence}, so it gets asked all over again`);
  }
}
console.log("✓ the audience never decides the area, and a clear sentence is not re-asked");

// Nothing in the flow may quote the description back at the person.
let echoes: Profile = { ...emptyProfile() };
for (let i = 0; i < 20; i++) {
  const q = nextQuestion(echoes);
  if (!q) break;
  const copy = [q.title, ...(q.choices ?? []).flatMap((c) => [c.label, c.hint ?? ""])];
  for (const line of copy) {
    if (/description|ticked from|reads like/i.test(line)) {
      throw new Error(`${q.id} quotes the description back: "${line}"`);
    }
  }
  const answer = q.kind === "text" ? ["an app for newcomers to the gym"] : [q.choices![0].id];
  echoes = {
    ...echoes,
    [q.field]: q.kind === "single" || q.kind === "text" ? answer[0] : answer,
  } as Profile;
  if (q.field === "ideaText") echoes = applyReading(echoes, answer[0]);
}
console.log("✓ no screen quotes the description back");

// No question may explain itself underneath. The question is the whole thing.
let walkAll: Profile = { ...emptyProfile() };
for (let i = 0; i < 20; i++) {
  const q = nextQuestion(walkAll);
  if (!q) break;
  if ("subtitle" in q) throw new Error(`${q.id} still carries a subtitle`);
  if (/\bthing\b/i.test(q.title) || /^so[ ,]/i.test(q.title)) {
    throw new Error(`${q.id} asks badly: "${q.title}"`);
  }
  const answer = q.kind === "text" ? ["a clipping tool for gamers"] : [q.choices![0].id];
  walkAll =
    q.kind === "text"
      ? applyReading(walkAll, answer[0])
      : ({ ...walkAll, [q.field]: q.kind === "single" ? answer[0] : answer } as Profile);
}
console.log("✓ every question stands on its own, with no sentence underneath");

const { ideas } = generateIdeas(known, new Set(), 3, "sample");
for (const i of ideas) console.log(`\n  ${i.title}\n  ${i.pitch}`);

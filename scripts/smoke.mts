// Throwaway check of the question ladder and the never-repeat guarantee.
// npm run smoke
import { nextQuestion } from "../src/lib/engine/questions";
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

// 1. Someone who knows what they want. Mirrors the UI, which pre-ticks the
// domains the description matched.
const known = walk("has-idea", (q) => {
  if (q.id === "path") return ["has-idea"];
  if (q.kind === "text") return ["something to stop me wasting food in the fridge"];
  if (q.id === "domains") {
    const matched = q.choices!.filter((c) => c.hint?.includes("matched the description"));
    if (!matched.length) throw new Error("nothing was pre-ticked from the description");
    return matched.map((c) => c.id);
  }
  return q.kind === "single" ? first(q) : two(q);
});

// 2. Rough direction.
walk("rough-direction", (q) => {
  if (q.id === "path") return ["rough-direction"];
  return q.kind === "single" ? first(q) : two(q);
});

// 3. No idea, but interests land.
walk("no-idea, interests land", (q) => {
  if (q.id === "path") return ["no-idea"];
  return q.kind === "single" ? first(q) : two(q);
});

// 4. No idea, no interests, no skills, no frustrations â€” the floor.
const floor = walk("no-idea, all escapes taken", (q, i) => {
  if (q.id === "path") return ["no-idea"];
  if (["interests", "skills", "frustrations"].includes(q.id) && i < 4) return "skip";
  return q.kind === "single" ? first(q) : two(q);
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
    const { ideas } = generateIdeas(profile, seen, 6, String(round));
    for (const idea of ideas) {
      if (seen.has(idea.id)) throw new Error(`${name}: repeated ${idea.id} on round ${round}`);
      if (!idea.title || !idea.pitch || idea.steps.length !== 3) {
        throw new Error(`${name}: malformed idea ${JSON.stringify(idea)}`);
      }
      seen.add(idea.id);
      total++;
    }
  }
  console.log(`âœ“ ${name}: ${total} ideas across 60 draws, zero repeats`);
}

// 6. Six ideas from one set of answers have to be six different ideas.
for (const [name, profile] of [["has-idea", known], ["floor", floor]] as const) {
  const { ideas: batch } = generateIdeas(profile, new Set(), 6, "variety");
  const distinct = (values: string[]) => new Set(values).size;
  const shapes = distinct(batch.map((i) => i.slots.mechanic));
  const twists = distinct(batch.map((i) => i.slots.twist));
  const pitches = distinct(batch.map((i) => i.pitch));
  const whys = distinct(batch.map((i) => i.why));
  if (shapes < batch.length || twists < batch.length) {
    throw new Error(`${name}: batch repeated a shape or a constraint (${shapes} shapes, ${twists} twists)`);
  }
  if (pitches < batch.length || whys < batch.length) {
    throw new Error(`${name}: batch repeated a pitch or a reason (${pitches} pitches, ${whys} reasons)`);
  }
  console.log(`checked ${name}: 6 ideas, ${shapes} shapes, ${twists} constraints, no repeated copy`);
}

const { ideas } = generateIdeas(known, new Set(), 3, "sample");
for (const i of ideas) {
  console.log(`\n  ${i.title} â€” ${i.difficulty}, ${i.timeToFirst}\n  ${i.pitch}\n  why: ${i.why}\n  1. ${i.steps[0]}`);
}

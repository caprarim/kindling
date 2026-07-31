import { applyReading, nextQuestion } from "../src/lib/engine/questions";
import { generateIdeas } from "../src/lib/engine/generate";
import { summarise } from "../src/lib/engine/summary";
import { emptyProfile, type PathKind, type Profile, type Question } from "../src/lib/engine/types";

type Step = { q: Question; action: string };

function walk(path: PathKind, escapes: Set<string>, ideaText?: string): Step[] {
  let p: Profile = { ...emptyProfile() };
  const steps: Step[] = [];

  for (let i = 0; i < 30; i++) {
    const q = nextQuestion(p);
    if (!q) break;

    if (q.id === "path") {
      steps.push({ q, action: path });
      p = { ...p, path };
      continue;
    }
    if (q.kind === "text") {
      steps.push({ q, action: `typed "${ideaText}"` });
      p = applyReading(p, ideaText ?? "a small tool");
      continue;
    }
    if (escapes.has(q.id) && q.escape) {
      steps.push({ q, action: `ESCAPE (${q.escape.label})` });
      p = { ...p, skipped: [...p.skipped, q.id] };
      continue;
    }

    const want = q.preselect?.length ? q.preselect : (q.choices ?? []).slice(0, q.min ?? 1).map((c) => c.id);
    steps.push({ q, action: want.join(", ") });
    p = { ...p, [q.field]: q.kind === "single" ? want[0] : want } as Profile;
  }

  const leftover = nextQuestion(p);
  if (leftover) throw new Error(`did not terminate, stuck on ${leftover.id}`);

  const { ideas } = generateIdeas(p, new Set(), 3, "audit");
  if (ideas.length < 3) throw new Error(`only ${ideas.length} ideas for ${path} / ${[...escapes]}`);
  summarise(p);
  return steps;
}

function report(name: string, path: PathKind, escapes: string[], ideaText?: string) {
  const steps = walk(path, new Set(escapes), ideaText);
  const ids = steps.map((s) => s.q.id);
  const dupes = ids.filter((id, i) => ids.indexOf(id) !== i);
  const titles = steps.map((s) => s.q.title);
  const dupeTitles = titles.filter((t, i) => titles.indexOf(t) !== i);

  console.log(`\n== ${name} ==${escapes.length ? `  (escaping: ${escapes.join(", ")})` : ""}`);
  let last = -1;
  for (const { q, action } of steps) {
    const pct = Math.round(q.progress * 100);
    const back = pct < last ? "  <== PROGRESS WENT BACKWARDS" : "";
    last = pct;
    const opts = q.choices?.length ? ` [${q.choices.length} options${q.min !== q.max ? `, pick ${q.min ?? 1}-${q.max ?? 1}` : `, pick ${q.min}`}]` : "";
    console.log(`  ${String(pct).padStart(3)}%  ${q.id.padEnd(13)} ${q.title}${opts}${back}`);
    if (q.choices) {
      const labels = q.choices.map((c) => c.label.toLowerCase());
      const repeated = labels.filter((l, i) => labels.indexOf(l) !== i);
      if (repeated.length) console.log(`        !! repeated options: ${[...new Set(repeated)].join(", ")}`);
      const bad = q.choices.filter((c) => c.label.includes("undefined") || q.title.includes("undefined"));
      if (bad.length || q.title.includes("undefined")) console.log(`        !! undefined in copy`);
    }
    void action;
  }
  if (dupes.length) console.log(`  !! question asked twice: ${[...new Set(dupes)].join(", ")}`);
  if (dupeTitles.length) console.log(`  !! title asked twice: ${[...new Set(dupeTitles)].join(" | ")}`);
  console.log(`  screens: ${steps.length}`);
}

report("A. I know what I want to build", "has-idea", [], "a clipping tool for gamers");
report("A. vague description", "has-idea", [], "something that helps people");
report("A. escapes the area grid", "has-idea", ["domains"], "something that helps people");
report("A. escapes everything skippable", "has-idea", ["domains", "frustrations", "focuses", "audiences", "surfaces", "motivations"], "something that helps people");

report("B. I know roughly where to look", "rough-direction", []);
report("B. escapes the area grid", "rough-direction", ["domains"]);
report("B. escapes area grid + annoyances", "rough-direction", ["domains", "frustrations"]);
report("B. escapes everything skippable", "rough-direction", ["domains", "frustrations", "areas", "focuses", "audiences", "surfaces", "motivations"]);

report("C. I have absolutely no idea", "no-idea", []);
report("C. no annoyances fit", "no-idea", ["frustrations"]);
report("C. wants the full grid", "no-idea", ["areas"]);
report("C. no annoyances, no vibes match", "no-idea", ["frustrations", "vibes"]);
report("C. escapes everything skippable", "no-idea", ["frustrations", "areas", "domains", "focuses", "audiences", "surfaces", "motivations"]);

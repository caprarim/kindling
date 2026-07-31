import { applyReading, nextQuestion } from "./src/lib/engine/questions";
import { generateIdeas } from "./src/lib/engine/generate";
import { emptyProfile, type Profile } from "./src/lib/engine/types";

function run(text: string) {
  let p: Profile = { ...emptyProfile(), path: "has-idea" };
  p = applyReading(p, text);
  console.log(`\n"${text}"`);
  console.log(`  filled: domains=${p.domains} focuses=${p.focuses} audience=${p.audiences} surfaces=${p.surfaces}`);

  const asked: string[] = [];
  for (let i = 0; i < 20; i++) {
    const q = nextQuestion(p);
    if (!q) break;
    asked.push(`${q.id}("${q.title}")`);
    const choice = q.preselect?.length ? q.preselect : [q.choices![0].id];
    (p as Record<string, unknown>)[q.field] = q.kind === "single" ? choice[0] : choice;
  }
  console.log(`  still asked: ${asked.join(" -> ")}`);
  for (const idea of generateIdeas(p, new Set(), 3, "demo").ideas) {
    console.log(`   * ${idea.title}: ${idea.pitch}`);
  }
}

run("I want to make a clipping tool for gamers");
run("a desktop app that blocks distracting websites while I work");
run("something that helps people improve their lives");

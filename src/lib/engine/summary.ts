import { DOMAIN_BY_ID, FRUSTRATIONS, MOTIVATIONS, SURFACES, VIBES } from "./taxonomy";
import type { Profile } from "./types";

/**
 * Turns a profile back into readable answers, so every answer can be seen and
 * any single piece of it changed without redoing the whole flow.
 */
export type AnswerSummary = {
  field: keyof Profile;
  /** Question ids that write this field — cleared from `skipped` when reopened. */
  questionIds: string[];
  label: string;
  values: string[];
};

const PATH_LABELS: Record<string, string> = {
  "has-idea": "I know what I want to build",
  "rough-direction": "I know roughly where to go",
  "no-idea": "I have absolutely no idea",
};

const SKILL_LEVEL_LABELS: Record<string, string> = {
  none: "Never tried it",
  learning: "I've had a go",
  comfortable: "Fairly comfortable",
  strong: "Very comfortable",
};

const TIME_LABELS: Record<string, string> = {
  weekend: "A weekend",
  "few-weeks": "A few weeks of evenings",
  "few-months": "A few months",
  open: "No deadline",
};

/** `domain:focus` and `domain:audience` ids back into words. */
function pairLabel(id: string, kind: "focus" | "audience"): string {
  if (id === "self") return "Me";
  if (id.startsWith("text:")) return id.slice(5);
  const [domainId, itemId] = id.split(":");
  const domain = DOMAIN_BY_ID.get(domainId);
  if (!domain) return id;
  const item =
    kind === "focus"
      ? domain.focuses.find((f) => f.id === itemId)?.label
      : domain.audiences.find((a) => a.id === itemId)?.label;
  return item ?? id;
}

export function summarise(p: Profile): AnswerSummary[] {
  const out: AnswerSummary[] = [];
  const add = (
    field: keyof Profile,
    questionIds: string[],
    label: string,
    values: (string | undefined)[],
  ) => {
    const clean = values.filter(Boolean) as string[];
    if (clean.length) out.push({ field, questionIds, label, values: clean });
  };

  add("path", ["path"], "Starting point", [p.path ? PATH_LABELS[p.path] : undefined]);
  add("ideaText", ["ideaText"], "The idea", [p.ideaText]);
  add(
    "domains",
    ["domains", "interests"],
    "Areas",
    p.domains.map((d) => DOMAIN_BY_ID.get(d)?.label),
  );
  add("focuses", ["focuses"], "Focus", p.focuses.map((f) => pairLabel(f, "focus")));
  add("audiences", ["audiences"], "Who it's for", p.audiences.map((a) => pairLabel(a, "audience")));
  add(
    "frustrations",
    ["frustrations"],
    "Annoyances",
    p.frustrations.map((f) => FRUSTRATIONS.find((x) => x.id === f)?.label),
  );
  add("vibes", ["vibes"], "Gut feel", p.vibes.map((v) => VIBES.find((x) => x.id === v)?.label));
  add("skillLevel", ["skillLevel"], "Vibe coding", [
    p.skillLevel ? SKILL_LEVEL_LABELS[p.skillLevel] : undefined,
  ]);
  add("surfaces", ["surfaces"], "Shape", p.surfaces.map((s) => SURFACES.find((x) => x.id === s)?.label));
  add("timeBudget", ["timeBudget"], "Time", [p.timeBudget ? TIME_LABELS[p.timeBudget] : undefined]);
  add(
    "motivations",
    ["motivations"],
    "Why",
    p.motivations.map((m) => MOTIVATIONS.find((x) => x.id === m)?.label),
  );
  return out;
}

/** The empty value for a field, used when reopening a question. */
export function blankValue(field: keyof Profile): Profile[keyof Profile] {
  const arrays: (keyof Profile)[] = [
    "domains",
    "focuses",
    "audiences",
    "frustrations",
    "vibes",
    "skills",
    "motivations",
    "surfaces",
  ];
  return arrays.includes(field) ? [] : undefined;
}

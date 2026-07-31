export type PathKind = "has-idea" | "rough-direction" | "no-idea";

export type SkillLevel = "none" | "learning" | "comfortable" | "strong";
export type TimeBudget = "weekend" | "few-weeks" | "few-months" | "open";
export type Appetite = "practical" | "playful" | "ambitious";

/**
 * Everything the flow has learned about the person. Every field is optional:
 * the question engine reads whatever is present and decides what to ask next,
 * so a half-finished profile is always a valid input to generation.
 */
export type Profile = {
  path?: PathKind;
  /** Free text from the "I know what I want to build" branch. */
  ideaText?: string;
  /** Domain ids the person leans toward. */
  domains: string[];
  /** Sub-domain ids, narrowed from the chosen domains. */
  focuses: string[];
  /** Who it is for. */
  audiences: string[];
  /** Everyday frustrations, used when interests come up empty. */
  frustrations: string[];
  /** Vibe cards, the last-resort signal when nothing else lands. */
  vibes: string[];
  skills: string[];
  skillLevel?: SkillLevel;
  timeBudget?: TimeBudget;
  motivations: string[];
  surfaces: string[];
  appetite?: Appetite;
  /** Ids of questions the person explicitly skipped, so we never re-ask. */
  skipped: string[];
};

export const emptyProfile = (): Profile => ({
  domains: [],
  focuses: [],
  audiences: [],
  frustrations: [],
  vibes: [],
  skills: [],
  motivations: [],
  surfaces: [],
  skipped: [],
});

export type Choice = {
  id: string;
  label: string;
  hint?: string;
};

export type Question = {
  id: string;
  /** Which profile key the answer is written to. */
  field: keyof Profile;
  kind: "single" | "multi" | "text";
  title: string;
  choices?: Choice[];
  /** For multi: how many must be picked before the flow moves on. */
  min?: number;
  max?: number;
  placeholder?: string;
  /** Choice ids ticked before anyone touches it, read out of the description. */
  preselect?: string[];
  /** Shown as a quiet "none of these" escape hatch. */
  escape?: { label: string };
  /** Roughly how far through the flow this question sits, 0–1. */
  progress: number;
};

export type Idea = {
  /** Deterministic fingerprint of the slot combination. Also the dedupe key. */
  id: string;
  title: string;
  /** The whole idea in plain words. This is all anyone is shown. */
  pitch: string;
  /** Slot ids kept for near-duplicate detection and "more like this". */
  slots: {
    domain: string;
    focus: string;
    audience: string;
    mechanic: string;
    twist: string;
  };
  createdAt: number;
};

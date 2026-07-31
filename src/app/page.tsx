"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRightIcon, SparklesIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ChoiceGrid } from "@/components/choice-grid";
import { Mark } from "@/components/logo";
import { useKindling } from "@/lib/store";
import { nextQuestion } from "@/lib/engine/questions";
import { emptyProfile } from "@/lib/engine/types";

/**
 * The landing page *is* the first question. Nobody has to read a pitch, click
 * "get started", or make an account before the product does something for them.
 */
export default function Home() {
  const router = useRouter();
  const { ready, profile, saved, seenCount, answer, restart } = useKindling();

  const first = nextQuestion(emptyProfile())!;
  const inProgress = ready && Boolean(profile.path);

  // Answering here always begins a new run, even when the answer is the same one
  // as last time. "Carry on" is the only way back into an unfinished run, so a
  // fresh start is never haunted by ticks nobody asked for.
  function choose(ids: string[]) {
    if (!ids.length) return;
    if (profile.path) restart();
    answer(first, ids[0]);
    router.push("/start");
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center gap-10 px-4 py-8 sm:gap-14 sm:px-6 sm:py-16 lg:py-20">
      <header className="ember-wash flex flex-col items-start gap-5 rounded-3xl border border-border bg-card px-5 py-8 shadow-sm sm:gap-6 sm:px-10 sm:py-14">
        <h1 className="font-heading text-[2rem] leading-[1.08] font-semibold tracking-tight text-balance text-card-foreground sm:text-5xl lg:text-6xl">
          Find a project <span className="text-primary">worth building</span>.
        </h1>

        <p className="max-w-xl text-[0.95rem]/relaxed text-muted-foreground text-pretty sm:text-lg/relaxed">
          Made for vibe coders. A few plain questions, each one shaped by the last, then ideas that
          fit your interests and the time you actually have. No jargon, no test to pass.
        </p>
      </header>

      <section className="flex flex-col gap-5">
        <div className="flex items-center gap-3">
          <Mark className="size-6 shrink-0 text-primary sm:size-7" />
          <h2 className="font-heading text-lg font-semibold tracking-tight text-balance sm:text-xl">
            {first.title}
          </h2>
        </div>
        <ChoiceGrid choices={first.choices ?? []} value={[]} onChange={choose} columns={1} />

        {inProgress ? (
          <div className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm sm:flex-row sm:items-center sm:gap-5 sm:p-6">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <SparklesIcon className="size-5" />
            </span>
            <div className="flex-1 space-y-1">
              <p className="text-[0.95rem] font-medium tracking-tight text-card-foreground">
                Already in progress
              </p>
              <p className="text-sm/relaxed text-muted-foreground text-pretty">
                Pick up where it left off, or choose again above to begin fresh.
              </p>
            </div>
            <Button
              size="lg"
              className="w-full sm:w-auto"
              render={<Link href="/start" />}
            >
              Carry on
              <ArrowRightIcon className="size-4" />
            </Button>
          </div>
        ) : null}
      </section>

      {saved.length || seenCount ? (
        <p className="text-sm text-muted-foreground">
          {seenCount} {seenCount === 1 ? "idea" : "ideas"} shown so far, {saved.length} kept.{" "}
          <Link href="/library" className="underline underline-offset-4 hover:text-primary">
            Open the library
          </Link>
          .
        </p>
      ) : null}
    </div>
  );
}


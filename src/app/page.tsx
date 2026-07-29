"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRightIcon, BookmarkIcon, ShuffleIcon, SparklesIcon } from "lucide-react";
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

  function choose(ids: string[]) {
    if (!ids.length) return;
    if (profile.path && profile.path !== ids[0]) restart();
    answer(first, ids[0]);
    router.push("/start");
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-10 px-4 py-8 sm:gap-14 sm:px-6 sm:py-16 lg:py-20">
      <header className="ember-wash flex flex-col items-start gap-5 rounded-3xl border border-border bg-card px-5 py-8 shadow-sm sm:gap-6 sm:px-10 sm:py-14">
        <h1 className="font-heading text-[2rem] leading-[1.08] font-semibold tracking-tight text-balance text-card-foreground sm:text-5xl lg:text-6xl">
          Find a project <span className="text-primary">worth building</span>.
        </h1>

        <p className="max-w-xl text-[0.95rem]/relaxed text-muted-foreground text-pretty sm:text-lg/relaxed">
          Made for vibe coders, the kind who build by telling an AI what they want. A handful of
          plain questions, each one shaped by the last, then ideas built around real interests and
          the time actually available. No jargon, no languages to name, no test to pass.
        </p>
      </header>

      <section className="flex flex-col gap-5">
        <div className="flex items-center gap-3">
          <Mark className="size-6 shrink-0 text-primary sm:size-7" />
          <h2 className="font-heading text-lg font-semibold tracking-tight text-balance sm:text-xl">
            {first.title}
          </h2>
        </div>
        <p className="-mt-3 text-sm text-muted-foreground text-pretty sm:text-base">
          {first.subtitle}
        </p>

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
              className="h-12 w-full gap-2 rounded-full px-6 text-[0.95rem] font-medium sm:w-auto"
              render={<Link href="/start" />}
            >
              Carry on
              <ArrowRightIcon className="size-4" />
            </Button>
          </div>
        ) : null}
      </section>

      <section className="grid gap-7 border-t border-border/60 pt-9 sm:grid-cols-3 sm:gap-6 sm:pt-10">
        <Feature
          icon={<ShuffleIcon className="size-4" />}
          title="Never the same idea twice"
          body="Every idea gets a fingerprint. Once it has been shown, it is retired for good, even across sessions."
        />
        <Feature
          icon={<SparklesIcon className="size-4" />}
          title="Questions that adapt"
          body="Pick cooking and the follow-ups turn to cooking. Say vibe coding is new and the whole path changes."
        />
        <Feature
          icon={<BookmarkIcon className="size-4" />}
          title="Saved the moment it is tapped"
          body="Ideas land in the library straight away. No account, no email, nothing to set up first."
        />
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

function Feature({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
  return (
    <div className="flex flex-col gap-2">
      <span className="flex size-9 items-center justify-center rounded-lg bg-secondary text-secondary-foreground">
        {icon}
      </span>
      <h3 className="font-heading font-medium tracking-tight">{title}</h3>
      <p className="text-sm/relaxed text-muted-foreground text-pretty">{body}</p>
    </div>
  );
}

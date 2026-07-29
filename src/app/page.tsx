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
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-10 px-4 py-10 sm:gap-14 sm:py-16 lg:py-20">
      <header className="flex flex-col items-start gap-6 rounded-3xl border border-border bg-card px-6 py-10 shadow-sm sm:px-10 sm:py-14">
        <h1 className="font-heading text-[2.1rem] leading-[1.08] font-semibold tracking-tight text-balance text-card-foreground sm:text-5xl lg:text-6xl">
          Find a project <span className="text-primary">worth building</span>.
        </h1>

        <p className="max-w-xl text-base/relaxed text-muted-foreground text-pretty sm:text-lg/relaxed">
          Made for vibe coders, the kind who build by telling an AI what they want. Answer a handful
          of plain questions, each one shaped by the last, and get ideas built around what
          you&rsquo;re into and how much time you actually have. No jargon, no languages to name, no
          test to pass.
        </p>

        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className="size-1.5 rounded-full bg-primary" aria-hidden />
          No account needed to use any of this.
        </p>
      </header>

      <section className="flex flex-col gap-5">
        <div className="flex items-center gap-3">
          <Mark className="size-6 shrink-0 text-primary" />
          <h2 className="font-heading text-lg font-semibold tracking-tight sm:text-xl">
            {first.title}
          </h2>
        </div>
        <p className="-mt-3 text-sm text-muted-foreground text-pretty sm:text-base">
          {first.subtitle}
        </p>

        <ChoiceGrid choices={first.choices ?? []} value={[]} onChange={choose} columns={1} />

        {inProgress ? (
          <div className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm ring-1 ring-black/[0.02] sm:flex-row sm:items-center sm:gap-5 sm:p-6">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <SparklesIcon className="size-5" />
            </span>
            <div className="flex-1 space-y-1">
              <p className="text-[0.95rem] font-medium tracking-tight text-card-foreground">
                You&rsquo;ve already started
              </p>
              <p className="text-sm/relaxed text-muted-foreground text-pretty">
                Pick up where you left off, or choose again above to begin fresh.
              </p>
            </div>
            <Button size="lg" className="w-full sm:w-auto" render={<Link href="/start" />}>
              Continue
              <ArrowRightIcon data-icon="inline-end" />
            </Button>
          </div>
        ) : null}
      </section>

      <section className="grid gap-7 border-t border-border/60 pt-10 sm:grid-cols-3 sm:gap-6">
        <Feature
          icon={<ShuffleIcon className="size-4" />}
          title="Never the same idea twice"
          body="Every idea gets a fingerprint. Once you've seen it, it's retired for good, even across sessions."
        />
        <Feature
          icon={<SparklesIcon className="size-4" />}
          title="Questions that adapt"
          body="Pick cooking and you get cooking follow-ups. Say you're new to vibe coding and the whole path changes."
        />
        <Feature
          icon={<BookmarkIcon className="size-4" />}
          title="Saved the moment you tap"
          body="Ideas land in your library straight away. No account, no email, nothing to set up first."
        />
      </section>

      {saved.length || seenCount ? (
        <p className="text-sm text-muted-foreground">
          So far you&rsquo;ve seen {seenCount} {seenCount === 1 ? "idea" : "ideas"} and saved{" "}
          {saved.length}.{" "}
          <Link href="/library" className="underline underline-offset-4 hover:text-primary">
            Open your library
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

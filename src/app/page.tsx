"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRightIcon, BookmarkIcon, ShuffleIcon, SparklesIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-12 px-4 py-14 sm:py-20">
      <header className="flex flex-col items-start gap-5">
        <Badge variant="secondary" className="h-6 gap-1.5">
          <SparklesIcon />
          No account needed to use any of this
        </Badge>

        <h1 className="font-heading text-4xl leading-[1.05] font-semibold tracking-tight text-balance sm:text-6xl">
          Find a project <span className="text-ember">worth building</span>.
        </h1>

        <p className="max-w-xl text-lg/relaxed text-muted-foreground text-pretty">
          Answer a handful of questions — each one shaped by the last — and get ideas built around
          what you&rsquo;re into, what you can already do, and how much time you actually have.
        </p>
      </header>

      <section className="flex flex-col gap-5">
        <div className="flex items-center gap-3">
          <Mark className="size-6 text-primary" />
          <h2 className="font-heading text-xl font-semibold tracking-tight">{first.title}</h2>
        </div>
        <p className="-mt-3 text-muted-foreground">{first.subtitle}</p>

        <ChoiceGrid choices={first.choices ?? []} value={[]} onChange={choose} columns={1} />

        {inProgress ? (
          <div className="flex flex-wrap items-center gap-3 rounded-xl border border-border bg-card p-4">
            <p className="flex-1 text-sm/relaxed text-muted-foreground text-pretty">
              You&rsquo;ve already started. Pick up where you left off, or choose again above to
              begin fresh.
            </p>
            <Button size="sm" render={<Link href="/start" />}>
              Continue
              <ArrowRightIcon data-icon="inline-end" />
            </Button>
          </div>
        ) : null}
      </section>

      <section className="grid gap-6 border-t border-border/60 pt-10 sm:grid-cols-3">
        <Feature
          icon={<ShuffleIcon className="size-4" />}
          title="Never the same idea twice"
          body="Every idea gets a fingerprint. Once you've seen it, it's retired — permanently, even across sessions."
        />
        <Feature
          icon={<SparklesIcon className="size-4" />}
          title="Questions that adapt"
          body="Pick cooking and you get cooking follow-ups. Say you have no skills and the whole path changes."
        />
        <Feature
          icon={<BookmarkIcon className="size-4" />}
          title="Save first, sign up later"
          body="Ideas save straight away. Make an account whenever you like and everything comes with you."
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
      <span className="flex size-8 items-center justify-center rounded-lg bg-secondary text-secondary-foreground">
        {icon}
      </span>
      <h3 className="font-heading font-medium tracking-tight">{title}</h3>
      <p className="text-sm/relaxed text-muted-foreground text-pretty">{body}</p>
    </div>
  );
}

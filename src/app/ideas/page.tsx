"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { InfoIcon, PencilIcon, RefreshCwIcon, RotateCcwIcon } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { IdeaCard } from "@/components/idea-card";
import { useKindling } from "@/lib/store";
import { countSeenInPool, poolSize } from "@/lib/engine/generate";
import { DOMAIN_BY_ID } from "@/lib/engine/taxonomy";
import { effectiveDomains } from "@/lib/engine/questions";

export default function IdeasPage() {
  const router = useRouter();
  const { ready, profile, batch, seen, generating, exhausted, generate, restart } = useKindling();

  // Someone who lands here cold has no profile yet — send them to the start.
  useEffect(() => {
    if (ready && !profile.path) router.replace("/");
  }, [ready, profile.path, router]);

  if (!ready || !profile.path) return null;

  const domains = effectiveDomains(profile)
    .slice(0, 3)
    .map((id) => DOMAIN_BY_ID.get(id)?.label)
    .filter(Boolean) as string[];
  // Only ideas this profile could actually draw count against its own pool.
  const remaining = Math.max(0, poolSize(profile) - countSeenInPool(profile, seen));

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 py-8 sm:px-6 sm:py-14">
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="flex flex-col gap-2">
            <h1 className="font-heading text-[1.7rem] leading-[1.15] font-semibold tracking-tight text-balance sm:text-4xl">
              Three ideas, shaped by every answer
            </h1>
          </div>

          <div className="flex w-full flex-wrap gap-2 sm:w-auto">
            <Button className="flex-1 rounded-full sm:flex-none" onClick={generate} disabled={generating}>
              {generating ? (
                <Spinner data-icon="inline-start" />
              ) : (
                <RefreshCwIcon data-icon="inline-start" />
              )}
              Three more
            </Button>
            <Button variant="outline" className="rounded-full" render={<Link href="/start" />}>
              <PencilIcon data-icon="inline-start" />
              Change answers
            </Button>
            <Button variant="ghost" className="rounded-full" onClick={() => { restart(); router.push("/"); }}>
              <RotateCcwIcon data-icon="inline-start" />
              Start over
            </Button>
          </div>
        </div>

        <p className="text-sm text-muted-foreground text-pretty">
          {[
            ...domains,
            profile.timeBudget ? timeLabel(profile.timeBudget) : null,
            profile.skillLevel ? skillLabel(profile.skillLevel) : null,
          ]
            .filter(Boolean)
            .join(" · ")}
          {domains.length || profile.timeBudget || profile.skillLevel ? " · " : ""}
          {remaining.toLocaleString()} unseen combinations left for these answers
        </p>
      </div>

      {exhausted ? (
        <Alert>
          <InfoIcon />
          <AlertTitle>That is nearly all of them</AlertTitle>
          <AlertDescription>
            These answers have produced almost everything they can. Widening them on the questions
            page opens the pool right back up.
          </AlertDescription>
        </Alert>
      ) : null}

      {generating && !batch.length ? (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-52 w-full rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="grid items-start gap-5 md:grid-cols-2 lg:grid-cols-3">
          {batch.map((idea, i) => (
            <IdeaCard key={idea.id} idea={idea} index={i} />
          ))}
        </div>
      )}

      <div className="flex flex-wrap items-center justify-center gap-3 border-t border-border/60 pt-8">
        <p className="text-sm text-muted-foreground">Nothing here landed?</p>
        <Button variant="outline" className="rounded-full" onClick={generate} disabled={generating}>
          {generating ? <Spinner data-icon="inline-start" /> : <RefreshCwIcon data-icon="inline-start" />}
          Show me three completely different ones
        </Button>
      </div>
    </div>
  );
}

function timeLabel(t: string) {
  return (
    {
      weekend: "A weekend",
      "few-weeks": "A few weeks",
      "few-months": "A few months",
      open: "No deadline",
    }[t] ?? t
  );
}

function skillLabel(s: string) {
  return (
    {
      none: "New to vibe coding",
      learning: "Some vibe coding",
      comfortable: "Comfortable vibe coding",
      strong: "Fluent at vibe coding",
    }[s] ?? s
  );
}

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { InfoIcon, PencilIcon, RefreshCwIcon, RotateCcwIcon } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { IdeaCard } from "@/components/idea-card";
import { AuthDialog } from "@/components/auth-dialog";
import { useKindling } from "@/lib/store";
import { countSeenInPool, poolSize } from "@/lib/engine/generate";
import { DOMAIN_BY_ID } from "@/lib/engine/taxonomy";
import { effectiveDomains } from "@/lib/engine/questions";

export default function IdeasPage() {
  const router = useRouter();
  const {
    ready,
    profile,
    batch,
    saved,
    seen,
    generating,
    exhausted,
    generate,
    restart,
    session,
    cloudEnabled,
  } = useKindling();
  const [promptedAt, setPromptedAt] = useState(0);
  const [authOpen, setAuthOpen] = useState(false);

  // Someone who lands here cold has no profile yet — send them to the start.
  useEffect(() => {
    if (ready && !profile.path) router.replace("/");
  }, [ready, profile.path, router]);

  // One gentle nudge, the third time something is saved. Never again after that.
  useEffect(() => {
    if (!cloudEnabled || session || saved.length < 3 || promptedAt) return;
    setPromptedAt(saved.length);
    setAuthOpen(true);
  }, [saved.length, session, cloudEnabled, promptedAt]);

  if (!ready || !profile.path) return null;

  const domains = effectiveDomains(profile)
    .slice(0, 3)
    .map((id) => DOMAIN_BY_ID.get(id)?.label)
    .filter(Boolean) as string[];
  // Only ideas this profile could actually draw count against its own pool.
  const remaining = Math.max(0, poolSize(profile) - countSeenInPool(profile, seen));

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 py-10 sm:py-14">
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="flex flex-col gap-2">
            <h1 className="font-heading text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
              Six ideas, shaped around you
            </h1>
            <p className="text-muted-foreground text-pretty">
              None of these has been shown to you before, and none of them will be shown again.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button onClick={generate} disabled={generating}>
              {generating ? (
                <Spinner data-icon="inline-start" />
              ) : (
                <RefreshCwIcon data-icon="inline-start" />
              )}
              Six more
            </Button>
            <Button variant="outline" render={<Link href="/start" />}>
              <PencilIcon data-icon="inline-start" />
              Change answers
            </Button>
            <Button variant="ghost" onClick={() => { restart(); router.push("/"); }}>
              <RotateCcwIcon data-icon="inline-start" />
              Start over
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {domains.map((d) => (
            <Badge key={d} variant="secondary">
              {d}
            </Badge>
          ))}
          {profile.timeBudget ? <Badge variant="outline">{timeLabel(profile.timeBudget)}</Badge> : null}
          {profile.skillLevel ? <Badge variant="outline">{skillLabel(profile.skillLevel)}</Badge> : null}
          <span className="text-sm text-muted-foreground">
            {remaining.toLocaleString()} unseen combinations left for these answers
          </span>
        </div>
      </div>

      {exhausted ? (
        <Alert>
          <InfoIcon />
          <AlertTitle>You&rsquo;ve been thorough</AlertTitle>
          <AlertDescription>
            You&rsquo;ve worked through nearly everything these answers can produce. Widen them on
            the questions page and the pool opens right back up.
          </AlertDescription>
        </Alert>
      ) : null}

      {generating && !batch.length ? (
        <div className="grid gap-5 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-80 w-full rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="grid items-start gap-5 md:grid-cols-2">
          {batch.map((idea, i) => (
            <IdeaCard key={idea.id} idea={idea} index={i} />
          ))}
        </div>
      )}

      <div className="flex flex-wrap items-center justify-center gap-3 border-t border-border/60 pt-8">
        <p className="text-sm text-muted-foreground">Nothing here landed?</p>
        <Button variant="outline" onClick={generate} disabled={generating}>
          {generating ? <Spinner data-icon="inline-start" /> : <RefreshCwIcon data-icon="inline-start" />}
          Show me six completely different ones
        </Button>
      </div>

      <AuthDialog open={authOpen} onOpenChange={setAuthOpen} />
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
      none: "New to building",
      learning: "Learning",
      comfortable: "Comfortable",
      strong: "Experienced",
    }[s] ?? s
  );
}

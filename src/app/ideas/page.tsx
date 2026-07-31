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

export default function IdeasPage() {
  const router = useRouter();
  const { ready, profile, batch, generating, exhausted, generate, restart } = useKindling();

  // Someone who lands here cold has no profile yet — send them to the start.
  useEffect(() => {
    if (ready && !profile.path) router.replace("/");
  }, [ready, profile.path, router]);

  if (!ready || !profile.path) return null;

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 py-8 sm:px-6 sm:py-14">
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-4">
          <h1 className="font-heading text-[1.7rem] leading-[1.15] font-semibold tracking-tight text-balance sm:text-4xl">
            Three ideas, shaped by every answer
          </h1>

          <div className="grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto sm:flex-wrap">
            <Button size="lg" className="col-span-2 sm:col-span-1" onClick={generate} disabled={generating}>
              {generating ? (
                <Spinner data-icon="inline-start" />
              ) : (
                <RefreshCwIcon data-icon="inline-start" />
              )}
              Three more
            </Button>
            <Button size="lg" variant="outline" render={<Link href="/start" />}>
              <PencilIcon data-icon="inline-start" />
              Change answers
            </Button>
            <Button size="lg" variant="ghost" onClick={() => { restart(); router.push("/"); }}>
              <RotateCcwIcon data-icon="inline-start" />
              Start over
            </Button>
          </div>
        </div>
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

      <div className="flex flex-col items-center gap-3 border-t border-border/60 pt-8 sm:flex-row sm:flex-wrap sm:justify-center">
        <p className="text-sm text-muted-foreground">Nothing here landed?</p>
        <Button
          size="lg"
          variant="outline"
          onClick={generate}
          disabled={generating}
          className="w-full text-center whitespace-normal sm:w-auto"
        >
          {generating ? <Spinner data-icon="inline-start" /> : <RefreshCwIcon data-icon="inline-start" />}
          Show me three completely different ones
        </Button>
      </div>
    </div>
  );
}


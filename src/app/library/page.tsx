"use client";

import Link from "next/link";
import { BookmarkIcon, CloudIcon, SparklesIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { IdeaCard } from "@/components/idea-card";
import { AuthDialog } from "@/components/auth-dialog";
import { useKindling } from "@/lib/store";

export default function LibraryPage() {
  const { ready, saved, removeSaved, session, cloudEnabled } = useKindling();

  if (!ready) return null;

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 py-10 sm:py-14">
      <div className="flex flex-col gap-2">
        <h1 className="font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
          Your library
        </h1>
        <p className="text-muted-foreground text-pretty">
          {saved.length
            ? `${saved.length} ${saved.length === 1 ? "idea" : "ideas"} kept. They stay on this device, and follow you if you make an account.`
            : "Ideas you save land here."}
        </p>
      </div>

      {saved.length && !session && cloudEnabled ? (
        <Alert>
          <CloudIcon />
          <AlertTitle>These live on this device only</AlertTitle>
          <AlertDescription className="flex flex-col items-start gap-3">
            Make an account and every one of them moves across untouched — along with the record of
            what you&rsquo;ve already been shown.
            <AuthDialog>
              <Button size="sm" variant="outline">
                Keep them safe
              </Button>
            </AuthDialog>
          </AlertDescription>
        </Alert>
      ) : null}

      {saved.length ? (
        <div className="grid items-start gap-5 md:grid-cols-2">
          {saved.map((idea, i) => (
            <IdeaCard key={idea.id} idea={idea} index={i} onRemove={removeSaved} />
          ))}
        </div>
      ) : (
        <Empty className="border">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <BookmarkIcon />
            </EmptyMedia>
            <EmptyTitle>Nothing saved yet</EmptyTitle>
            <EmptyDescription>
              Work through the questions and hit save on anything that makes you sit up.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button render={<Link href="/" />}>
              <SparklesIcon data-icon="inline-start" />
              Find some ideas
            </Button>
          </EmptyContent>
        </Empty>
      )}
    </div>
  );
}

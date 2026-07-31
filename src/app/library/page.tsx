"use client";

import Link from "next/link";
import { BookmarkIcon, SparklesIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { IdeaCard } from "@/components/idea-card";
import { useKindling } from "@/lib/store";

export default function LibraryPage() {
  const { ready, saved, removeSaved, token } = useKindling();

  if (!ready) return null;

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 py-8 sm:px-6 sm:py-14">
      <div className="flex flex-col gap-2">
        <h1 className="font-heading text-[1.7rem] leading-[1.15] font-semibold tracking-tight text-balance sm:text-4xl">
          The library
        </h1>
        <p className="text-sm/relaxed text-muted-foreground text-pretty sm:text-base/relaxed">
          {saved.length
            ? `${saved.length} ${saved.length === 1 ? "idea" : "ideas"} kept.${token ? " Stored on the server, so it lands on every signed-in device." : ""}`
            : "Every saved idea lands here."}
        </p>
      </div>

      {saved.length ? (
        <div className="grid items-start gap-5 md:grid-cols-2 lg:grid-cols-3">
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
              Work through the questions, then hit save on anything worth a second look.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button size="lg" render={<Link href="/" />}>
              <SparklesIcon data-icon="inline-start" />
              Find some ideas
            </Button>
          </EmptyContent>
        </Empty>
      )}
    </div>
  );
}

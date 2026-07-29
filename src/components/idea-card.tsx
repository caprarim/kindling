"use client";

import { BookmarkIcon, ClockIcon, Trash2Icon, WrenchIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useKindling } from "@/lib/store";
import { cn } from "@/lib/utils";
import type { Idea } from "@/lib/engine/types";

const DIFFICULTY_TONE = {
  Gentle: "text-muted-foreground",
  Moderate: "text-foreground",
  Ambitious: "text-primary",
} as const;

export function IdeaCard({
  idea,
  index = 0,
  onRemove,
}: {
  idea: Idea;
  index?: number;
  onRemove?: (id: string) => void;
}) {
  const { isSaved, toggleSave } = useKindling();
  const saved = isSaved(idea.id);

  return (
    <Card
      className="animate-rise h-full"
      style={{ animationDelay: `${Math.min(index, 8) * 55}ms` }}
    >
      <CardHeader>
        <CardTitle className="text-xl">{idea.title}</CardTitle>
        <CardDescription className="text-[0.95rem]/relaxed text-pretty">
          {idea.pitch}
        </CardDescription>
        <CardAction>
          <span className={cn("text-xs font-medium tracking-wide uppercase", DIFFICULTY_TONE[idea.difficulty])}>
            {idea.difficulty}
          </span>
        </CardAction>
      </CardHeader>

      <CardContent className="flex flex-col gap-5">
        <p className="rounded-lg bg-accent/60 p-3 text-sm/relaxed text-accent-foreground text-pretty">
          {idea.why}
        </p>

        <div className="flex flex-col gap-2.5">
          <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            Where to start
          </p>
          <ol className="flex flex-col gap-2.5">
            {idea.steps.map((step, i) => (
              <li key={i} className="flex gap-3 text-sm/relaxed text-pretty">
                <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-medium text-secondary-foreground">
                  {i + 1}
                </span>
                {step}
              </li>
            ))}
          </ol>
        </div>

        <div className="flex flex-col gap-2.5">
          <Separator />
          <p className="text-sm/relaxed text-muted-foreground text-pretty">
            <span className="font-medium text-foreground">Once it works: </span>
            {idea.stretch}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <ClockIcon className="size-3.5" />
            {idea.timeToFirst}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <WrenchIcon className="size-3.5" />
            {idea.stack.join(" · ")}
          </span>
        </div>

        <p className="text-sm text-muted-foreground text-pretty">{idea.tags.join(" · ")}</p>
      </CardContent>

      <CardFooter className="gap-2">
        <Button
          variant={saved ? "secondary" : "outline"}
          size="sm"
          onClick={() => toggleSave(idea)}
          aria-pressed={saved}
        >
          <BookmarkIcon
            data-icon="inline-start"
            className={cn(saved && "fill-current")}
          />
          {saved ? "Saved" : "Save this one"}
        </Button>
        {onRemove ? (
          <Button variant="ghost" size="sm" onClick={() => onRemove(idea.id)}>
            <Trash2Icon data-icon="inline-start" />
            Remove
          </Button>
        ) : null}
      </CardFooter>
    </Card>
  );
}

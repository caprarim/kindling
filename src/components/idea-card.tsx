"use client";

import { BookmarkIcon, Trash2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useKindling } from "@/lib/store";
import { cn } from "@/lib/utils";
import type { Idea } from "@/lib/engine/types";

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
        <CardDescription className="text-[1rem]/relaxed text-pretty">
          {idea.pitch}
        </CardDescription>
      </CardHeader>

      <CardFooter className="mt-auto flex-wrap gap-2">
        <Button
          variant={saved ? "secondary" : "outline"}
          size="sm"
          className="h-9 rounded-full px-4"
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
          <Button
            variant="ghost"
            size="sm"
            className="h-9 rounded-full px-4"
            onClick={() => onRemove(idea.id)}
          >
            <Trash2Icon data-icon="inline-start" />
            Remove
          </Button>
        ) : null}
      </CardFooter>
    </Card>
  );
}

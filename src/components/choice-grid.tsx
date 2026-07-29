"use client";

import { Toggle as TogglePrimitive } from "@base-ui/react/toggle";
import { ToggleGroup as ToggleGroupPrimitive } from "@base-ui/react/toggle-group";
import { CheckIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Choice } from "@/lib/engine/types";

/**
 * Large selectable option cards with a label and a line of explanation.
 *
 * Built on the same Base UI toggle-group primitive the `ToggleGroup` component
 * uses — so roving focus, keyboard selection and pressed state are handled —
 * but sized for onboarding choices rather than compact toolbar toggles.
 */
export function ChoiceGrid({
  choices,
  value,
  onChange,
  multiple,
  max,
  columns = 2,
}: {
  choices: Choice[];
  value: string[];
  onChange: (next: string[]) => void;
  multiple?: boolean;
  max?: number;
  columns?: 1 | 2;
}) {
  const atLimit = multiple && max !== undefined && value.length >= max;

  return (
    <ToggleGroupPrimitive
      multiple={multiple}
      value={value}
      onValueChange={(ids: string[]) => {
        if (multiple && max !== undefined && ids.length > max) {
          // Keep the most recent picks rather than silently rejecting the click.
          onChange(ids.slice(-max));
          return;
        }
        onChange(ids);
      }}
      className={cn(
        "grid w-full gap-2.5",
        columns === 2 ? "sm:grid-cols-2" : "grid-cols-1",
      )}
    >
      {choices.map((choice) => {
        const selected = value.includes(choice.id);
        return (
          <TogglePrimitive
            key={choice.id}
            value={choice.id}
            disabled={Boolean(atLimit) && !selected}
            className={cn(
              "group/choice relative flex w-full cursor-pointer flex-col items-start gap-1 rounded-xl border p-4 text-left transition-all outline-none",
              "border-border bg-card hover:border-primary/40 hover:bg-accent/50",
              "focus-visible:ring-[3px] focus-visible:ring-ring/50",
              "aria-pressed:border-primary aria-pressed:bg-accent aria-pressed:shadow-sm",
              "disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:border-border disabled:hover:bg-card",
            )}
          >
            <span className="flex w-full items-start justify-between gap-3">
              <span className="font-heading text-[0.95rem] leading-snug font-medium text-balance">
                {choice.label}
              </span>
              <span
                aria-hidden
                className={cn(
                  "mt-0.5 flex size-4.5 shrink-0 items-center justify-center rounded-full border transition-colors",
                  selected
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-transparent",
                )}
              >
                <CheckIcon
                  className={cn("size-3 transition-opacity", selected ? "opacity-100" : "opacity-0")}
                />
              </span>
            </span>
            {choice.hint ? (
              <span className="text-sm/relaxed text-muted-foreground text-pretty">{choice.hint}</span>
            ) : null}
          </TogglePrimitive>
        );
      })}
    </ToggleGroupPrimitive>
  );
}

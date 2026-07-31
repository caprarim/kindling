"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeftIcon, ArrowRightIcon, PencilIcon, RotateCcwIcon, SparklesIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import { ChoiceGrid } from "@/components/choice-grid";
import { useKindling } from "@/lib/store";
import { summarise } from "@/lib/engine/summary";
import type { Question } from "@/lib/engine/types";

/**
 * Pushes one browser history entry per answered question, so the browser's
 * own Back button steps through the MCQ flow instead of leaving the page.
 * The in-app Back button goes through window.history.back() too, so both
 * paths funnel through the same popstate handler and never fall out of sync.
 */
function useBrowserBack(depth: number, back: () => void, canGoBack: boolean) {
  const depthRef = useRef(depth);
  const backRef = useRef(back);

  useEffect(() => {
    backRef.current = back;
  }, [back]);

  useEffect(() => {
    if (depth > depthRef.current) {
      window.history.pushState({ kindlingDepth: depth }, "");
    }
    depthRef.current = depth;
  }, [depth]);

  useEffect(() => {
    function onPopState(e: PopStateEvent) {
      const target = (e.state as { kindlingDepth?: number } | null)?.kindlingDepth ?? 0;
      if (target < depthRef.current) backRef.current();
    }
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  return useCallback(() => {
    if (canGoBack) window.history.back();
  }, [canGoBack]);
}

export function Flow() {
  const router = useRouter();
  const { ready, question, profile, answer, skip, back, canGoBack, depth, generate } = useKindling();

  const goBack = useBrowserBack(depth, back, canGoBack);

  const [selection, setSelection] = useState<string[]>([]);
  const [text, setText] = useState("");
  const questionId = question?.id ?? null;
  const lastQuestion = useRef<string | null>(null);
  const finishing = useRef(false);
  const answeredHere = useRef(false);
  // Back rewinds to the profile as it was before the description was typed, so
  // without this the words come back as an empty box.
  const lastText = useRef("");

  // Reset the working answer whenever the engine moves us to a new question.
  // Anything the description already answered arrives ticked.
  useEffect(() => {
    if (lastQuestion.current === questionId) return;
    lastQuestion.current = questionId;
    setSelection(question?.preselect ?? []);
    setText(questionId === "ideaText" ? (profile.ideaText ?? lastText.current) : "");
  }, [questionId, profile.ideaText, question]);

  useEffect(() => {
    if (question) answeredHere.current = true;
  }, [question]);

  // Reaching the end of the flow builds the first batch and moves on. Arriving
  // with a complete profile instead shows the review screen below.
  useEffect(() => {
    if (!ready || question || !answeredHere.current || finishing.current) return;
    finishing.current = true;
    generate();
    router.push("/ideas");
  }, [ready, question, generate, router]);

  const commit = useCallback(
    (q: Question, ids: string[]) => {
      answer(q, q.kind === "single" ? ids[0] : ids);
    },
    [answer],
  );

  const textReady = text.trim().length > 2;

  const picked = useMemo(() => {
    if (!question || question.kind === "text") return null;
    const min = question.min ?? 1;
    const max = question.max ?? 1;
    const prefilled = (question.preselect?.length ?? 0) > 0;
    return {
      min,
      max,
      count: selection.length,
      prefilled,
      // A question that allows a range of answers has to wait to be confirmed.
      // Moving on at the minimum made every "pick up to three" a pick-one, so
      // the second and third options could never be reached at all.
      confirms: prefilled || (question.kind === "multi" && min !== max),
    };
  }, [question, selection]);

  if (!ready || (!question && answeredHere.current)) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4">
        <p className="text-sm text-muted-foreground">Lighting things up…</p>
      </div>
    );
  }

  if (!question) return <Review />;

  const q = question;

  /**
   * A pick is the answer, but only where a single pick can be the whole answer.
   * Anything that invites more than one waits for the button below.
   */
  function choose(ids: string[]) {
    setSelection(ids);

    if (picked?.confirms) return;

    if (q.kind === "single") {
      if (ids.length) commit(q, ids);
      return;
    }

    // Removing a tick is a correction, not an answer, so only additions move on.
    if (ids.length <= selection.length) return;
    if (ids.length >= (q.min ?? 1)) commit(q, ids);
  }

  function submitText() {
    if (!textReady) return;
    answer(q, text.trim());
  }

  const columns = (q.choices?.length ?? 0) > 4 ? 2 : 1;

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-7 px-4 py-8 sm:gap-9 sm:px-6 sm:py-14">
      <div className="flex flex-col gap-2.5">
        <Progress value={Math.round(q.progress * 100)} className="h-1.5" />
        <p className="text-[0.7rem] tracking-wide text-muted-foreground uppercase sm:text-xs">
          {Math.round(q.progress * 100)}% · {canGoBack ? "shaped by every answer so far" : "no wrong answers"}
        </p>
      </div>

      <div key={q.id} className="animate-rise flex flex-col gap-6 sm:gap-7">
        <div className="flex flex-col gap-2">
          <h1 className="font-heading text-[1.7rem] leading-[1.15] font-semibold tracking-tight text-balance sm:text-4xl">
            {q.title}
          </h1>
        </div>

        {q.kind === "text" ? (
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="idea-text" className="sr-only">
                The idea
              </FieldLabel>
              <Textarea
                id="idea-text"
                autoFocus
                rows={4}
                value={text}
                placeholder={q.placeholder}
                onChange={(e) => {
                  setText(e.target.value);
                  lastText.current = e.target.value;
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    submitText();
                  }
                }}
              />
              <FieldDescription className="flex flex-wrap items-center gap-x-2 gap-y-1">
                <span>Everything after this is built from these words.</span>
                <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[0.7rem] text-muted-foreground">
                  Enter
                </kbd>
                <span>to carry on.</span>
              </FieldDescription>
              <Button
                size="lg"
                onClick={submitText}
                disabled={!textReady}
                className="w-full sm:w-auto sm:self-start"
              >
                Carry on
                <ArrowRightIcon className="size-4" />
              </Button>
            </Field>
          </FieldGroup>
        ) : (
          <ChoiceGrid
            choices={q.choices ?? []}
            value={selection}
            onChange={choose}
            multiple={q.kind === "multi"}
            max={q.max}
            columns={columns}
          />
        )}

        {picked ? (
          <div
            aria-live="polite"
            className="flex min-h-5 flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground"
          >
            {picked.prefilled ? (
              <span>{q.note ?? "Change anything that does not fit, then carry on."}</span>
            ) : picked.confirms ? (
              <>
                <span className="tabular-nums">{picked.count} picked</span>
                <span aria-hidden>·</span>
                <span>up to {picked.max}, then carry on</span>
              </>
            ) : picked.min > 1 ? (
              <>
                <span className="tabular-nums">
                  {picked.count} of {picked.min} picked
                </span>
                <span aria-hidden>·</span>
                <span>it carries on as soon as {picked.min} are in</span>
              </>
            ) : (
              <span>One tap is the whole answer.</span>
            )}
          </div>
        ) : null}

        {picked?.confirms ? (
          <Button
            size="lg"
            onClick={() => commit(q, selection)}
            disabled={selection.length < picked.min}
            className="w-full sm:w-auto sm:self-start"
          >
            Carry on
            <ArrowRightIcon className="size-4" />
          </Button>
        ) : null}

        <Separator className="opacity-60" />

        <div className="flex flex-col-reverse gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
          {canGoBack ? (
            <Button
              variant="outline"
              size="lg"
              onClick={goBack}
              className="group/back w-full justify-center gap-2.5 py-0 pr-6 pl-3 hover:border-primary/40 active:scale-[0.98] sm:w-auto"
            >
              <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-foreground transition-colors group-hover/back:bg-primary/15 group-hover/back:text-primary">
                <ArrowLeftIcon className="size-4 transition-transform group-hover/back:-translate-x-0.5" />
              </span>
              <span className="leading-none">Back</span>
            </Button>
          ) : (
            <span className="hidden sm:block" />
          )}

          {q.escape ? (
            <Button
              variant="link"
              onClick={() => skip(q)}
              className="h-auto justify-center px-0 text-[0.95rem] whitespace-normal sm:justify-end sm:text-right"
            >
              {q.escape.label}
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
}

/**
 * Shown when someone comes back to change something. Every answer is listed
 * and individually re-openable — clearing one sends the engine back to exactly
 * that question, and everything downstream of it re-derives from the new answer.
 */
function Review() {
  const router = useRouter();
  const { profile, reopen, restart, generate } = useKindling();
  const answers = summarise(profile);

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-7 px-4 py-8 sm:gap-9 sm:px-6 sm:py-14">
      <div className="flex flex-col gap-2">
        <h1 className="font-heading text-[1.7rem] leading-[1.15] font-semibold tracking-tight text-balance sm:text-4xl">
          Every answer so far
        </h1>
        <p className="text-sm/relaxed text-muted-foreground text-pretty sm:text-base/relaxed">
          Changing one re-opens that question. Everything after it rebuilds around the new answer.
        </p>
      </div>

      <div className="flex flex-col gap-1 rounded-2xl border border-border bg-card shadow-sm">
        {answers.map((answer, i) => (
          <div key={String(answer.field)}>
            {i > 0 ? <Separator /> : null}
            <div className="flex flex-col gap-x-4 gap-y-2 p-4 sm:flex-row sm:flex-wrap sm:items-center sm:p-5">
              <p className="shrink-0 text-sm font-medium sm:w-32">{answer.label}</p>
              <p className="flex-1 text-sm text-muted-foreground text-pretty">
                {answer.values.join(", ")}
              </p>
              <Button
                variant="ghost"
                size="sm"
                className="self-start rounded-full sm:self-auto"
                onClick={() => reopen(answer.field, answer.questionIds)}
              >
                <PencilIcon data-icon="inline-start" />
                Change
              </Button>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        <Button
          size="lg"
          className="w-full sm:w-auto"
          onClick={() => {
            generate();
            router.push("/ideas");
          }}
        >
          <SparklesIcon className="size-4" />
          Three fresh ideas
        </Button>
        <Button
          variant="outline"
          size="lg"
          className="w-full sm:w-auto"
          onClick={() => {
            restart();
            router.push("/");
          }}
        >
          <RotateCcwIcon className="size-4" />
          Start completely over
        </Button>
      </div>
    </div>
  );
}

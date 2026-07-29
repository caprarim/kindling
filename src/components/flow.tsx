"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeftIcon, ArrowRightIcon, PencilIcon, RotateCcwIcon, SparklesIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import { ChoiceGrid } from "@/components/choice-grid";
import { useKindling } from "@/lib/store";
import { summarise } from "@/lib/engine/summary";

export function Flow() {
  const router = useRouter();
  const { ready, question, profile, answer, skip, back, canGoBack, generate } = useKindling();

  const [selection, setSelection] = useState<string[]>([]);
  const [text, setText] = useState("");
  const questionId = question?.id ?? null;
  const lastQuestion = useRef<string | null>(null);
  const finishing = useRef(false);
  // True once a question has been shown on this visit. Distinguishes "you just
  // finished the flow" from "you came here to change an answer".
  const answeredHere = useRef(false);

  // Reset the working answer whenever the engine moves us to a new question.
  useEffect(() => {
    if (lastQuestion.current === questionId) return;
    lastQuestion.current = questionId;
    setSelection([]);
    setText(questionId === "ideaText" ? (profile.ideaText ?? "") : "");
  }, [questionId, profile.ideaText]);

  // Pre-tick anything the engine suggested (e.g. domains read from free text).
  useEffect(() => {
    if (question?.id !== "domains") return;
    const suggested = question.choices?.filter((c) => c.hint?.includes("matched your description"));
    if (suggested?.length) setSelection(suggested.map((c) => c.id));
  }, [question]);

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

  const canContinue = useMemo(() => {
    if (!question) return false;
    if (question.kind === "text") return text.trim().length > 2;
    if (question.kind === "single") return selection.length === 1;
    return selection.length >= (question.min ?? 1);
  }, [question, selection, text]);

  if (!ready || (!question && answeredHere.current)) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-sm text-muted-foreground">Lighting things up…</p>
      </div>
    );
  }

  if (!question) return <Review />;

  function submit() {
    if (!question || !canContinue) return;
    if (question.kind === "text") {
      answer(question, text.trim());
      return;
    }
    answer(question, question.kind === "single" ? selection[0] : selection);
  }

  const columns = (question.choices?.length ?? 0) > 4 ? 2 : 1;

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-4 py-10 sm:py-14">
      <div className="flex flex-col gap-3">
        <Progress value={Math.round(question.progress * 100)} className="h-1.5" />
        <p className="text-xs tracking-wide text-muted-foreground uppercase">
          {Math.round(question.progress * 100)}% · shaped by your answers
        </p>
      </div>

      <div key={question.id} className="animate-rise flex flex-col gap-7">
        <div className="flex flex-col gap-2">
          <h1 className="font-heading text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
            {question.title}
          </h1>
          {question.subtitle ? (
            <p className="text-base/relaxed text-muted-foreground text-pretty">{question.subtitle}</p>
          ) : null}
        </div>

        {question.kind === "text" ? (
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="idea-text" className="sr-only">
                Your idea
              </FieldLabel>
              <Textarea
                id="idea-text"
                autoFocus
                rows={4}
                value={text}
                placeholder={question.placeholder}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) submit();
                }}
              />
              <FieldDescription>
                Everything after this is built from what you write here.
              </FieldDescription>
            </Field>
          </FieldGroup>
        ) : (
          <ChoiceGrid
            choices={question.choices ?? []}
            value={selection}
            onChange={setSelection}
            multiple={question.kind === "multi"}
            max={question.max}
            columns={columns}
          />
        )}

        {question.kind === "multi" && question.max ? (
          <p className="-mt-3 text-sm text-muted-foreground">
            {selection.length} of {question.max} picked
            {question.min && question.min > 1 ? ` · pick at least ${question.min}` : ""}
          </p>
        ) : null}

        <div className="flex flex-wrap items-center gap-3">
          <Button size="lg" onClick={submit} disabled={!canContinue}>
            Continue
            <ArrowRightIcon data-icon="inline-end" />
          </Button>

          {canGoBack ? (
            <Button variant="ghost" size="lg" onClick={back}>
              <ArrowLeftIcon data-icon="inline-start" />
              Back
            </Button>
          ) : null}

          <div className="flex-1" />

          {question.escape ? (
            <Button variant="link" onClick={() => skip(question)} className="px-0">
              {question.escape.label}
            </Button>
          ) : null}
        </div>

        {question.escape?.hint ? (
          <p className="-mt-4 text-right text-xs text-muted-foreground">{question.escape.hint}</p>
        ) : null}
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
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-4 py-10 sm:py-14">
      <div className="flex flex-col gap-2">
        <h1 className="font-heading text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
          Here&rsquo;s what you told us
        </h1>
        <p className="text-base/relaxed text-muted-foreground text-pretty">
          Change any one of these and we&rsquo;ll ask that question again — the ones after it
          rebuild around your new answer.
        </p>
      </div>

      <div className="flex flex-col gap-1 rounded-xl border border-border bg-card">
        {answers.map((answer, i) => (
          <div key={String(answer.field)}>
            {i > 0 ? <Separator /> : null}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 p-4">
              <p className="w-32 shrink-0 text-sm font-medium">{answer.label}</p>
              <div className="flex flex-1 flex-wrap gap-1.5">
                {answer.values.map((v) => (
                  <Badge key={v} variant="secondary" className="h-auto py-1 text-wrap">
                    {v}
                  </Badge>
                ))}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => reopen(answer.field, answer.questionIds)}
              >
                <PencilIcon data-icon="inline-start" />
                Change
              </Button>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Button
          size="lg"
          onClick={() => {
            generate();
            router.push("/ideas");
          }}
        >
          <SparklesIcon data-icon="inline-start" />
          Six fresh ideas
        </Button>
        <Button
          variant="ghost"
          size="lg"
          onClick={() => {
            restart();
            router.push("/");
          }}
        >
          <RotateCcwIcon data-icon="inline-start" />
          Start completely over
        </Button>
      </div>
    </div>
  );
}

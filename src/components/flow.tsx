"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeftIcon, ArrowRightIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import { ChoiceGrid } from "@/components/choice-grid";
import { useKindling } from "@/lib/store";

export function Flow() {
  const router = useRouter();
  const { ready, question, profile, answer, skip, back, canGoBack, generate } = useKindling();

  const [selection, setSelection] = useState<string[]>([]);
  const [text, setText] = useState("");
  const questionId = question?.id ?? null;
  const lastQuestion = useRef<string | null>(null);
  const finishing = useRef(false);

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

  // Out of questions: build the first batch and move on.
  useEffect(() => {
    if (!ready || question || finishing.current) return;
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

  if (!ready || !question) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-sm text-muted-foreground">Lighting things up…</p>
      </div>
    );
  }

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
          Question {Math.round(question.progress * 8) + 1} · shaped by your answers
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

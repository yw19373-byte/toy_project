"use client";

import Link from "next/link";
import { useState, useTransition } from "react";

import { BookOpenIcon } from "lucide-react";

import { nextQuestion, submitAnswer } from "@/app/quiz/actions";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import type { QuizQuestion } from "@/lib/quiz/question";

type Answered = { chosen: string; correct: boolean };

export function QuizPlayer({
  initialQuestion,
}: {
  initialQuestion: QuizQuestion | null;
}) {
  const [question, setQuestion] = useState(initialQuestion);
  const [answered, setAnswered] = useState<Answered | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  if (question === null) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <BookOpenIcon />
          </EmptyMedia>
          <EmptyTitle>먼저 slang을 보세요</EmptyTitle>
          <EmptyDescription>
            본 표현으로 퀴즈를 냅니다. 오늘의 slang을 본 뒤에 다시 와 주세요.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Link href="/" className={buttonVariants()}>
            오늘의 slang 보기
          </Link>
        </EmptyContent>
      </Empty>
    );
  }

  function choose(chosen: string) {
    if (answered || !question) return;
    setError(null);

    startTransition(async () => {
      const result = await submitAnswer(question.expression, chosen);
      if ("error" in result) {
        setError(result.error);
        return;
      }
      setAnswered({ chosen, correct: result.correct });
    });
  }

  function next() {
    if (!question) return;
    setError(null);

    startTransition(async () => {
      const upcoming = await nextQuestion(question.expression);
      setQuestion(upcoming);
      setAnswered(null);
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardDescription>이 뜻에 맞는 표현을 고르세요.</CardDescription>
        <CardTitle className="text-xl">{question.ko}</CardTitle>
        <CardDescription className="text-base">
          {question.definition}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <div className="flex flex-col gap-2" role="group" aria-label="보기">
          {question.options.map((option) => {
            const isAnswer = option === question.expression;
            const isChosen = answered?.chosen === option;
            const variant = !answered
              ? "outline"
              : isAnswer
                ? "default"
                : isChosen
                  ? "destructive"
                  : "outline";

            return (
              <Button
                key={option}
                variant={variant}
                size="lg"
                disabled={pending || answered !== null}
                onClick={() => choose(option)}
              >
                {option}
              </Button>
            );
          })}
        </div>

        {error ? (
          <Alert variant="destructive" role="alert">
            <AlertTitle>{error}</AlertTitle>
          </Alert>
        ) : null}

        {answered ? (
          <>
            <Alert role="status">
              <AlertTitle>
                {answered.correct ? "정답입니다!" : "아쉬워요."}
              </AlertTitle>
              <AlertDescription>
                {answered.correct
                  ? `"${question.expression}"가 맞아요.`
                  : `정답은 "${question.expression}"입니다.`}
              </AlertDescription>
            </Alert>
            <Button size="lg" disabled={pending} onClick={next}>
              다음 문제
            </Button>
          </>
        ) : null}
      </CardContent>
    </Card>
  );
}

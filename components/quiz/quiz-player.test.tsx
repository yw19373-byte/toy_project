import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, expect, test, vi } from "vitest";

import { nextQuestion, submitAnswer } from "@/app/quiz/actions";
import { QuizPlayer } from "@/components/quiz/quiz-player";
import type { QuizQuestion } from "@/lib/quiz/question";

vi.mock("@/app/quiz/actions", () => ({
  submitAnswer: vi.fn(),
  nextQuestion: vi.fn(),
}));

const question: QuizQuestion = {
  expression: "tea",
  ko: "정보, 특히 가십이나 뒷이야기",
  definition: "Information, especially gossip.",
  options: [
    { value: "beat", label: "beat" },
    { value: "tea", label: "tea" },
    { value: "baloney", label: "baloney" },
    { value: "slap", label: "slap" },
  ],
};

beforeEach(() => {
  vi.mocked(submitAnswer).mockReset();
  vi.mocked(nextQuestion).mockReset();
});

test("문제는 한국어 번역과 영어 정의를 보여주고 보기 4개를 낸다", () => {
  render(<QuizPlayer kind="slang" initialQuestion={question} />);

  expect(screen.getByText(question.ko)).toBeInTheDocument();
  expect(screen.getByText(question.definition)).toBeInTheDocument();
  expect(screen.getAllByRole("button")).toHaveLength(4);
});

test("본 표현이 없으면 먼저 slang을 보라는 안내를 보여주고 문제를 내지 않는다", () => {
  render(<QuizPlayer kind="slang" initialQuestion={null} />);

  expect(screen.getByText("먼저 slang을 보세요")).toBeInTheDocument();
  expect(screen.getByRole("link", { name: "오늘의 slang 보기" })).toHaveAttribute(
    "href",
    "/",
  );
  expect(screen.queryByRole("group", { name: "보기" })).not.toBeInTheDocument();
});

test("정답을 고르면 정답 표시가 나오고 다음 문제로 넘어갈 수 있다", async () => {
  vi.mocked(submitAnswer).mockResolvedValue({ correct: true });
  const upcoming: QuizQuestion = {
    expression: "beat",
    ko: "녹초가 된, 완전히 지친",
    definition: "Exhausted.",
    options: [
      { value: "beat", label: "beat" },
      { value: "tea", label: "tea" },
      { value: "slap", label: "slap" },
      { value: "baloney", label: "baloney" },
    ],
  };
  vi.mocked(nextQuestion).mockResolvedValue(upcoming);
  render(<QuizPlayer kind="slang" initialQuestion={question} />);

  fireEvent.click(screen.getByRole("button", { name: "tea" }));

  expect(await screen.findByText("정답입니다!")).toBeInTheDocument();
  expect(submitAnswer).toHaveBeenCalledWith("slang", "tea", "tea");

  fireEvent.click(screen.getByRole("button", { name: "다음 문제" }));

  await waitFor(() =>
    expect(screen.getByText(upcoming.ko)).toBeInTheDocument(),
  );
  expect(nextQuestion).toHaveBeenCalledWith("slang", "tea");
  expect(screen.queryByText("정답입니다!")).not.toBeInTheDocument();
});

test("오답을 고르면 오답 표시와 함께 정답을 알려준다", async () => {
  vi.mocked(submitAnswer).mockResolvedValue({ correct: false });
  render(<QuizPlayer kind="slang" initialQuestion={question} />);

  fireEvent.click(screen.getByRole("button", { name: "beat" }));

  expect(await screen.findByText("아쉬워요.")).toBeInTheDocument();
  expect(screen.getByText('정답은 "tea"입니다.')).toBeInTheDocument();
  expect(submitAnswer).toHaveBeenCalledWith("slang", "tea", "beat");
});

test("답을 고르고 나면 보기를 다시 고를 수 없다", async () => {
  vi.mocked(submitAnswer).mockResolvedValue({ correct: true });
  render(<QuizPlayer kind="slang" initialQuestion={question} />);

  fireEvent.click(screen.getByRole("button", { name: "tea" }));
  await screen.findByText("정답입니다!");
  fireEvent.click(screen.getByRole("button", { name: "beat" }));

  expect(submitAnswer).toHaveBeenCalledTimes(1);
});

test("저장에 실패하면 오류를 보여주고 다시 고를 수 있다", async () => {
  vi.mocked(submitAnswer).mockResolvedValueOnce({ error: "답을 저장하지 못했습니다." });
  vi.mocked(submitAnswer).mockResolvedValueOnce({ correct: true });
  render(<QuizPlayer kind="slang" initialQuestion={question} />);

  fireEvent.click(screen.getByRole("button", { name: "tea" }));
  expect(await screen.findByRole("alert")).toHaveTextContent("답을 저장하지 못했습니다.");

  fireEvent.click(screen.getByRole("button", { name: "tea" }));
  expect(await screen.findByText("정답입니다!")).toBeInTheDocument();
});

test("건강 퀴즈는 한국어 이름으로 보기를 보여주고 건강 기록으로 답을 보낸다", async () => {
  vi.mocked(submitAnswer).mockResolvedValue({ correct: true });
  const health: QuizQuestion = {
    expression: "Healthy Sleep",
    ko: "잠을 자는 동안에도 뇌와 몸의 기능은 계속 활동합니다.",
    definition: "While you are sleeping, your brain and body functions are still active.",
    options: [
      { value: "Nutrition", label: "영양" },
      { value: "Healthy Sleep", label: "건강한 수면" },
      { value: "Stress", label: "스트레스" },
      { value: "Caffeine", label: "카페인" },
    ],
  };
  render(<QuizPlayer kind="health" initialQuestion={health} />);

  fireEvent.click(screen.getByRole("button", { name: "건강한 수면" }));

  expect(await screen.findByText("정답입니다!")).toBeInTheDocument();
  expect(submitAnswer).toHaveBeenCalledWith("health", "Healthy Sleep", "Healthy Sleep");
});

test("건강 퀴즈에서 본 항목이 없으면 건강 정보를 먼저 보라는 안내를 보여준다", () => {
  render(<QuizPlayer kind="health" initialQuestion={null} />);

  expect(screen.getByText("먼저 건강 정보를 보세요")).toBeInTheDocument();
  expect(screen.getByRole("link", { name: "오늘의 건강 보기" })).toHaveAttribute(
    "href",
    "/health",
  );
});

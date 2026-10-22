import { fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, expect, test, vi } from "vitest";

import Home from "@/app/page";

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date(2026, 9, 22, 9, 0));
});

afterEach(() => {
  vi.useRealTimers();
});

test("첫 화면은 오늘의 slang 3개를 표현, 영어 정의, 한국어 번역, 예문과 함께 보여준다", () => {
  render(<Home />);

  expect(
    screen.getByRole("heading", { level: 1, name: "오늘의 slang" }),
  ).toBeInTheDocument();

  const items = screen.getAllByRole("listitem");
  expect(items).toHaveLength(3);

  for (const item of items) {
    expect(item.querySelectorAll("[data-slot='card-title']")).toHaveLength(1);
    expect(item.querySelectorAll("[data-slot='card-description']")).toHaveLength(1);
    expect(item.querySelector("blockquote")?.textContent).toBeTruthy();
  }
});

test("각 항목에서 Wiktionary 출처 링크와 라이선스 표시를 볼 수 있다", () => {
  render(<Home />);

  for (const item of screen.getAllByRole("listitem")) {
    expect(
      within(item).getByRole("link", { name: "Wiktionary" }),
    ).toHaveAttribute("href", expect.stringContaining("en.wiktionary.org/wiki/"));
    expect(within(item).getByRole("link", { name: "CC BY-SA 4.0" })).toBeVisible();
  }
});

test("더 보기를 누르면 새 3개가 맨 위에 오고 이전 항목은 아래로 밀린다", () => {
  render(<Home />);
  const titles = () =>
    screen
      .getAllByRole("listitem")
      .map((item) => item.querySelector("[data-slot='card-title']")?.textContent);
  const initial = titles();

  fireEvent.click(screen.getByRole("button", { name: "더 보기" }));
  const afterOne = titles();
  expect(afterOne).toHaveLength(6);
  expect(afterOne.slice(3)).toEqual(initial);

  fireEvent.click(screen.getByRole("button", { name: "더 보기" }));
  const afterTwo = titles();
  expect(afterTwo).toHaveLength(9);
  expect(afterTwo.slice(3)).toEqual(afterOne);
  expect(new Set(afterTwo.slice(0, 3))).not.toEqual(new Set(afterOne.slice(0, 3)));
});

test("더 보기 버튼은 목록 위에 있어 눌러도 새 항목이 바로 아래에 보인다", () => {
  render(<Home />);

  const button = screen.getByRole("button", { name: "더 보기" });
  const list = screen.getByRole("list");

  expect(
    button.compareDocumentPosition(list) & Node.DOCUMENT_POSITION_FOLLOWING,
  ).toBeTruthy();
});

test("같은 날 다시 열면 같은 3개가 나온다", () => {
  const { unmount } = render(<Home />);
  const first = screen
    .getAllByRole("listitem")
    .map((item) => item.querySelector("[data-slot='card-title']")?.textContent);
  unmount();

  render(<Home />);
  const second = screen
    .getAllByRole("listitem")
    .map((item) => item.querySelector("[data-slot='card-title']")?.textContent);

  expect(second).toEqual(first);
});

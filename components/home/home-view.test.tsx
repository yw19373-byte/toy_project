import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeEach, expect, test, vi } from "vitest";

import { getDailyBatch, recordViews } from "@/app/activity-actions";
import { HomeView } from "@/components/home/home-view";
import { HEALTH_COLLECTION } from "@/lib/health/collection";
import { SLANG_COLLECTION } from "@/lib/slang/collection";
import { pickBatch } from "@/lib/slang/order";

vi.mock("@/app/activity-actions", () => ({
  recordViews: vi.fn(async () => {}),
  getDailyBatch: vi.fn(),
}));

// 서버가 돌려주는 하루 순서를 흉내 낸다. 기본은 모음 순서 그대로다.
function serveOrder(order: string[]) {
  vi.mocked(getDailyBatch).mockImplementation(async (_kind, _key, index) =>
    pickBatch(order, index).map(
      (expression) => SLANG_COLLECTION.find((item) => item.expression === expression)!,
    ),
  );
}
const collectionOrder = SLANG_COLLECTION.map((item) => item.expression);

beforeEach(() => {
  vi.mocked(recordViews).mockClear();
  vi.mocked(getDailyBatch).mockReset();
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(new Date(2026, 9, 22, 9, 0));
});

afterEach(() => {
  vi.useRealTimers();
});

test("첫 화면은 오늘의 slang 3개를 표현, 영어 정의, 한국어 번역, 예문과 함께 보여준다", () => {
  render(<HomeView kind="slang" signedIn={false} />);

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
  render(<HomeView kind="slang" signedIn={false} />);

  for (const item of screen.getAllByRole("listitem")) {
    expect(
      within(item).getByRole("link", { name: "Wiktionary" }),
    ).toHaveAttribute("href", expect.stringContaining("en.wiktionary.org/wiki/"));
    expect(within(item).getByRole("link", { name: "CC BY-SA 4.0" })).toBeVisible();
  }
});

test("더 보기를 누르면 새 3개가 맨 위에 오고 이전 항목은 아래로 밀린다", () => {
  render(<HomeView kind="slang" signedIn={false} />);
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
  render(<HomeView kind="slang" signedIn={false} />);

  const button = screen.getByRole("button", { name: "더 보기" });
  const list = screen.getByRole("list");

  expect(
    button.compareDocumentPosition(list) & Node.DOCUMENT_POSITION_FOLLOWING,
  ).toBeTruthy();
});

test("같은 날 다시 열면 같은 3개가 나온다", () => {
  const { unmount } = render(<HomeView kind="slang" signedIn={false} />);
  const first = screen
    .getAllByRole("listitem")
    .map((item) => item.querySelector("[data-slot='card-title']")?.textContent);
  unmount();

  render(<HomeView kind="slang" signedIn={false} />);
  const second = screen
    .getAllByRole("listitem")
    .map((item) => item.querySelector("[data-slot='card-title']")?.textContent);

  expect(second).toEqual(first);
});

const titles = () =>
  screen
    .getAllByRole("listitem")
    .map((item) => item.querySelector("[data-slot='card-title']")?.textContent);

test("로그인한 사용자가 보는 표현은 본 표현으로 기록된다", async () => {
  serveOrder(collectionOrder);
  render(<HomeView kind="slang" signedIn />);

  await screen.findAllByRole("listitem");

  expect(recordViews).toHaveBeenCalledTimes(1);
  expect(recordViews).toHaveBeenCalledWith("slang", ["tea", "beat", "baloney"]);
});

test("더 보기로 새로 나온 표현만 추가로 기록된다", async () => {
  serveOrder(collectionOrder);
  render(<HomeView kind="slang" signedIn />);
  await screen.findAllByRole("listitem");

  fireEvent.click(screen.getByRole("button", { name: "더 보기" }));
  await waitFor(() => expect(titles()).toHaveLength(6));

  expect(recordViews).toHaveBeenCalledTimes(2);
  expect(recordViews).toHaveBeenLastCalledWith("slang", [
    "slap",
    "prolly",
    "shoot the breeze",
  ]);
});

test("로그인하지 않으면 아무것도 기록하지 않고 서버 순서도 부르지 않는다", () => {
  render(<HomeView kind="slang" signedIn={false} />);

  fireEvent.click(screen.getByRole("button", { name: "더 보기" }));

  expect(recordViews).not.toHaveBeenCalled();
  expect(getDailyBatch).not.toHaveBeenCalled();
});

test("로그인한 사용자는 서버가 정한 하루 순서대로 보고 더 보기도 그 순서를 따른다", async () => {
  const order = ["ride shotgun", "scarf", "dogs", "hood", "jones", "feds"];
  serveOrder(order);
  render(<HomeView kind="slang" signedIn />);

  await screen.findAllByRole("listitem");
  expect(titles()).toEqual(["ride shotgun", "scarf", "dogs"]);

  fireEvent.click(screen.getByRole("button", { name: "더 보기" }));
  await waitFor(() => expect(titles()).toHaveLength(6));
  expect(titles()).toEqual(["hood", "jones", "feds", "ride shotgun", "scarf", "dogs"]);
  expect(getDailyBatch).toHaveBeenCalledWith("slang", "2026-10-22", 0, undefined);
  expect(getDailyBatch).toHaveBeenCalledWith("slang", "2026-10-22", 1, undefined);
});

test("서버 순서를 불러오지 못하면 날짜로 정해지는 순서로 보여준다", async () => {
  vi.mocked(getDailyBatch).mockRejectedValue(new Error("network"));
  render(<HomeView kind="slang" signedIn />);

  await waitFor(() => expect(titles()).toEqual(["tea", "beat", "baloney"]));
});

test("건강 화면은 오늘의 건강 논문 3개를 제목, 한국어 요약, 영어 핵심 문장과 함께 보여준다", () => {
  render(<HomeView kind="health" signedIn={false} />);

  expect(
    screen.getByRole("heading", { level: 1, name: "오늘의 건강" }),
  ).toBeInTheDocument();
  expect(titles()).toEqual([
    "마음챙김 명상과 만성 통증",
    "명상 앱과 스트레스",
    "자연 노출과 건강",
  ]);

  const first = screen.getAllByRole("listitem")[0];
  expect(first).toHaveTextContent("정신건강");
  expect(first).toHaveTextContent("무작위 대조 시험 38편을 정리한 메타분석입니다.");
  expect(first).toHaveTextContent("While mindfulness meditation improves pain");
});

test("건강 화면에는 의학적 조언이 아니라는 안내와 원문 논문 출처가 보인다", () => {
  render(<HomeView kind="health" signedIn={false} />);

  expect(screen.getByText(/의학적 조언이 아니니/)).toBeInTheDocument();
  for (const item of screen.getAllByRole("listitem")) {
    const link = within(item).getAllByRole("link")[0];
    expect(link).toHaveAttribute(
      "href",
      expect.stringMatching(/^https:\/\/pmc\.ncbi\.nlm\.nih\.gov\/articles\/PMC\d+\/$/),
    );
    expect(item).toHaveTextContent("라이선스 CC BY");
    expect(within(item).queryByRole("link", { name: "Wiktionary" })).toBeNull();
  }
});

test("건강 화면에서도 더 보기는 새 3개를 맨 위에 쌓는다", () => {
  render(<HomeView kind="health" signedIn={false} />);

  fireEvent.click(screen.getByRole("button", { name: "더 보기" }));

  expect(titles()).toHaveLength(6);
  expect(titles().slice(3)).toEqual([
    "마음챙김 명상과 만성 통증",
    "명상 앱과 스트레스",
    "자연 노출과 건강",
  ]);
});

test("건강 화면에서 분류를 고르면 그 분류의 논문만 보여주고 선택한 분류가 표시된다", () => {
  render(<HomeView kind="health" category="sleep" signedIn={false} />);

  expect(titles()).toEqual([
    "수면 규칙성이 수면 시간보다",
    "사회적 시차(소셜 제트랙)",
    "사회적 시차와 우울 증상",
  ]);
  for (const item of screen.getAllByRole("listitem")) {
    expect(item).toHaveTextContent("수면");
  }
  expect(screen.getByRole("link", { name: "수면" })).toHaveAttribute(
    "aria-current",
    "page",
  );
  expect(screen.getByRole("link", { name: "전체" })).not.toHaveAttribute("aria-current");
});

test("건강 분류 링크는 운동, 음식, 수면, 정신건강 네 가지와 전체를 제공한다", () => {
  render(<HomeView kind="health" signedIn={false} />);

  const nav = screen.getByRole("navigation", { name: "건강 분류" });
  expect(
    within(nav)
      .getAllByRole("link")
      .map((link) => [link.textContent, link.getAttribute("href")]),
  ).toEqual([
    ["전체", "/health"],
    ["운동", "/health?category=exercise"],
    ["음식", "/health?category=food"],
    ["수면", "/health?category=sleep"],
    ["정신건강", "/health?category=mind"],
  ]);
});

test("로그인한 사용자가 건강 논문을 보면 건강 기록으로 남고 서버 순서도 건강으로 부른다", async () => {
  vi.mocked(getDailyBatch).mockImplementation(async (_kind, _key, index) =>
    pickBatch(
      HEALTH_COLLECTION.map((item) => item.expression),
      index,
    ).map((name) => HEALTH_COLLECTION.find((item) => item.expression === name)!),
  );
  render(<HomeView kind="health" signedIn />);

  await screen.findAllByRole("listitem");

  expect(getDailyBatch).toHaveBeenCalledWith("health", "2026-10-22", 0, undefined);
  expect(recordViews).toHaveBeenCalledWith("health", [
    "PMC8417757",
    "PMC12354995",
    "PMC11391736",
  ]);
});

test("로그인한 사용자가 분류를 고르면 서버 순서도 그 분류로 부른다", async () => {
  const sleep = HEALTH_COLLECTION.filter((item) => item.category === "sleep");
  vi.mocked(getDailyBatch).mockImplementation(async (_kind, _key, index) =>
    pickBatch(
      sleep.map((item) => item.expression),
      index,
    ).map((name) => sleep.find((item) => item.expression === name)!),
  );
  render(<HomeView kind="health" category="sleep" signedIn />);

  await screen.findAllByRole("listitem");

  expect(getDailyBatch).toHaveBeenCalledWith("health", "2026-10-22", 0, "sleep");
});

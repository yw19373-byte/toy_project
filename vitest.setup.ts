import "@testing-library/jest-dom/vitest";
import { cleanup, configure } from "@testing-library/react";
import { afterEach } from "vitest";

// globals: false 이므로 Testing Library 자동 cleanup이 걸리지 않는다.
afterEach(cleanup);

// 테스트를 병렬로 돌릴 때 컴퓨터가 바쁘면 비동기 대기가 기본 1초를 넘겨 가끔 실패한다.
configure({ asyncUtilTimeout: 5000 });

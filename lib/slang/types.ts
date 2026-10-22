// 건강 항목의 분류. 화면에서 고르는 값이기도 하다.
export type HealthCategory = "exercise" | "food" | "sleep" | "mind";

// 영어 slang과 건강 정보가 함께 쓰는 항목 형태. expression은 항목을 구별하는 이름이다.
export type ContentItem = {
  expression: string;
  definition: string;
  ko: string;
  // slang의 예문. 건강 항목에는 없다.
  example?: string;
  // 건강 항목의 한국어 제목. 있으면 화면과 퀴즈 보기에 expression 대신 쓴다.
  titleKo?: string;
  // 건강 항목의 분류.
  category?: HealthCategory;
  // 건강 항목이 소개하는 논문의 영어 제목과 인용 정보(첫 저자, 연도, 학술지).
  paperTitle?: string;
  citation?: string;
  // 건강 항목의 출처 페이지 주소.
  sourceUrl?: string;
};

export type SlangItem = ContentItem;

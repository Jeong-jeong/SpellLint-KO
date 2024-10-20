import { KOREAN_WORD_PATTERN } from "../regex";

const getMatchKoreanWords = (line: string) => {
  const matches = Array.from(line.matchAll(KOREAN_WORD_PATTERN));

  return matches;
};

export default getMatchKoreanWords;
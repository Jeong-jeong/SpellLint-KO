import { expect } from "chai";
import getPreprocessedWord from "../src/utils/getPreprocessedWord";

describe('getPreprocessedWord', () => {
  it('should return an empty string for empty input', () => {
    expect(getPreprocessedWord('')).to.equal('');
    expect(getPreprocessedWord('   ')).to.equal('');
  });

  it('should remove all non-Korean characters', () => {
    expect(getPreprocessedWord('안녕123')).to.equal('안녕');
    expect(getPreprocessedWord('Hello 세상')).to.equal('세상');
    expect(getPreprocessedWord('한글Korean혼용')).to.equal('한글혼용');
  });

  it('should handle strings with only non-Korean characters', () => {
    expect(getPreprocessedWord('ABC123')).to.equal('');
    expect(getPreprocessedWord('!@#$%^&*')).to.equal('');
  });

  it('should preserve Korean characters and remove others', () => {
    expect(getPreprocessedWord('가나다라마바사')).to.equal('가나다라마바사');
    expect(getPreprocessedWord('안녕 하세요')).to.equal('안녕하세요');
    expect(getPreprocessedWord('테스트-입니다')).to.equal('테스트입니다');
  });

  it('should handle mixed input correctly', () => {
    expect(getPreprocessedWord(' 안녕 123 하세요! ')).to.equal('안녕하세요');
    expect(getPreprocessedWord('한글123한글456')).to.equal('한글한글');
    expect(getPreprocessedWord('!@#한글$%^한글&*()')).to.equal('한글한글');
  });
});
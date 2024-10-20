import { expect } from 'chai';
import getMatchKoreanWords from '../src/utils/getMatchKoreanWords';

describe('getMatchKoreanWords', () => {
  it('should match simple Korean words', () => {
    const line = '안녕하세요 반갑습니다';
    const matches = getMatchKoreanWords(line);
    
    expect(matches).to.have.lengthOf(2);
    expect(matches).to.have.deep.members([['안녕하세요', undefined], ['반갑습니다', undefined]]);
  });

  it('should match Korean words with numbers and letters in between', () => {
    const line = '한글123단어 English 한글abc단어';
    const matches = getMatchKoreanWords(line);
    
    expect(matches).to.have.lengthOf(2);
    expect(matches).to.have.deep.members([['한글123단어', '123단어'], ['한글abc단어', 'abc단어']]);
  });

  it('should not match non-Korean words', () => {
    const line = 'Hello World 123';
    const matches = getMatchKoreanWords(line);
    
    expect(matches).to.have.lengthOf(0);
  });

  it('should match Korean words in a mixed sentence', () => {
    const line = '안녕하세요 Hello 세계 World 한글123테스트';
    const matches = getMatchKoreanWords(line);
    
    expect(matches).to.have.lengthOf(3);
    expect(matches).to.have.deep.members([['안녕하세요', undefined], ['세계', undefined], ['한글123테스트', '123테스트']]);
  });

  it('should return an empty array for an empty string', () => {
    const line = '';
    const matches = getMatchKoreanWords(line);
    
    expect(matches).to.be.an('array').that.is.empty;
  });

  it('should match the correct positions of Korean words', () => {
    const line = 'Hello 안녕하세요 World 세계';
    const matches = getMatchKoreanWords(line);
    
    expect(matches).to.have.lengthOf(2);
    expect(matches).to.have.deep.members([['안녕하세요', undefined], ['세계', undefined]]);
  });
});
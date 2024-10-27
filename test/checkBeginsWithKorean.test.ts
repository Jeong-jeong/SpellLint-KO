import { expect } from 'chai';
import checkBeginsWithKorean from '../src/utils/checkBeginsWithKorean';

describe('checkBeginsWithKorean', () => {
  it('should match simple Korean line', () => {
    const line = '안녕하세요 반갑습니다';
    const matches = checkBeginsWithKorean(line);
    
    expect(matches).to.have.lengthOf(1);
    expect(matches).to.have.deep.members(['안녕하세요 반갑습니다']);
  });

  it('should match Korean line with numbers and letters in between', () => {
    const line = '한글123단어 English 한글abc단어';
    const matches = checkBeginsWithKorean(line);
    
    expect(matches).to.have.lengthOf(1);
    expect(matches).to.have.deep.members(['한글123단어 English 한글abc단어']);
  });

  it('should match Korean line ending with numbers and letters', () => {
    const line = '한글123단어123 English';
    const matches = checkBeginsWithKorean(line);
    
    expect(matches).to.have.lengthOf(1);
    expect(matches).to.have.deep.members(['한글123단어123 English']);
  });

  it('should not match line starting with english', () => {
    const line = 'Hello World 123';
    const matches = checkBeginsWithKorean(line);
    
    expect(matches).to.be.null;
  });

  it('should match Korean words in a mixed sentence', () => {
    const line = '안녕하세요 Hello 세계 World 한글123테스트';
    const matches = checkBeginsWithKorean(line);
    
    expect(matches).to.have.lengthOf(1);
    expect(matches).to.have.deep.members(['안녕하세요 Hello 세계 World 한글123테스트']);
  });

  it('should return null for an empty string', () => {
    const line = '';
    const matches = checkBeginsWithKorean(line);
    
    expect(matches).to.be.null;
  });

  it('should match the correct positions of Korean line', () => {
    const line = 'Hello 안녕하세요 여기부터 시작합니다 World 세계';
    const matches = checkBeginsWithKorean(line);
    
    expect(matches).to.have.lengthOf(1);
    expect(matches).to.have.deep.members(['안녕하세요 여기부터 시작합니다 World 세계']);
  });
});
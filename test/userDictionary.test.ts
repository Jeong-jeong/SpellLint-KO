import { expect } from 'chai';
import * as sinon from 'sinon';
import * as vscode from 'vscode';
import { Hunspell } from 'hunspell-asm';
import * as userDictionary from '../src/utils/userDictionary';
import { SKIP_COMMAND } from '../src/constants/command';

describe('userDictionary', () => {
  let globalStateMock: vscode.ExtensionContext['globalState'];
  let mockHunspell: sinon.SinonStubbedInstance<Hunspell>;
  let state: Map<string, any>;

  before(() => {
    state = new Map();
    globalStateMock = {
      get: (key: string) => state.get(key),
      update: async (key: string, value: any) => {
        state.set(key, value);
        return Promise.resolve();
      },
      setKeysForSync: sinon.stub()
    } as any;
    mockHunspell = {
      addWord: sinon.stub(),
    } as sinon.SinonStubbedInstance<Hunspell>;
  });

  afterEach(() => {
    sinon.restore();
    state.clear();
  });

  describe('getSkipWords', () => {
    it('should return empty Set when no words are skipped', () => {
      const words = userDictionary.getSkipWords(globalStateMock);
      expect(words).to.be.instanceOf(Set);
      expect(words.size).to.equal(0);
    });
  
    it('should return Set of skipped words', () => {
      state.set(SKIP_COMMAND, ['줄바꿈']);
      const words = userDictionary.getSkipWords(globalStateMock);
      expect(words.size).to.equal(1);
      expect(words.has('줄바꿈')).to.be.true;
    });
  });

  describe('isSkipWord', () => {
    it('should return false when word is not skipped', () => {
      const result = userDictionary.isSkipWord('줄바꿈');
      expect(result).to.be.false;
    });

    it('should return true when word is skipped', async () => {
      await userDictionary.addSkipWord({
        globalState: globalStateMock,
        word: '줄바꿈',
        hunspell: mockHunspell
      });

      const result = userDictionary.isSkipWord('줄바꿈', globalStateMock);
      expect(result).to.be.true;
    });
  });

  describe('addSkipWord', () => {
    it('should add word to skip list', async () => {
      await userDictionary.addSkipWord({
        globalState: globalStateMock,
        word: '줄바꿈',
        hunspell: mockHunspell
      });

      const words = userDictionary.getSkipWords(globalStateMock);
      expect(words.has('줄바꿈')).to.be.true;
    });
  });

  it('should call hunspell.addWord', async () => {
    await userDictionary.addSkipWord({
      globalState: globalStateMock,
      word: '줄바꿈',
      hunspell: mockHunspell
    });

    expect(mockHunspell.addWord.calledOnceWithExactly('줄바꿈')).to.be.true;
  });

  it('should not add duplicate words', async () => {
    await userDictionary.addSkipWord({
      globalState: globalStateMock,
      word: '줄바꿈',
      hunspell: mockHunspell
    });

    await userDictionary.addSkipWord({
      globalState: globalStateMock,
      word: '줄바꿈',
      hunspell: mockHunspell
    });

    const words = userDictionary.getSkipWords(globalStateMock);
    expect(words.size).to.equal(1);
    expect(words.has('줄바꿈')).to.be.true;
  });
});
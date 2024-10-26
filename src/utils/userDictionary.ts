import * as vscode from 'vscode';
import { SKIP_COMMAND } from '../constants/command';
import { Hunspell } from 'hunspell-asm';

type GlobalState = vscode.ExtensionContext['globalState'];

export const getSkipWords = (globalState: GlobalState) => {
  const words = globalState.get<string[]>(SKIP_COMMAND) || [];

  return new Set(words);
};

export const isSkipWord = (word: string, globalState?: GlobalState) => {
  if (!globalState) {
    return false;
  }

  return getSkipWords(globalState).has(word);
};

  interface AddSkipWordProps {
  globalState: GlobalState;
  word: string;
  hunspell: Hunspell;
}

export const addSkipWord = async ({ globalState, word, hunspell }: AddSkipWordProps) => {
  const words = getSkipWords(globalState);
  
  words.add(word);
  hunspell.addWord(word);
  await globalState.update(SKIP_COMMAND, Array.from(words));
};

export const loadSkipWords = (globalState: GlobalState, hunspell: Hunspell) => {
  const words = getSkipWords(globalState);
  words.forEach((word) => hunspell.addWord(word));
};
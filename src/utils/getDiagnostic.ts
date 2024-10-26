import getPreprocessedWord from "./getPreprocessedWord";
import { Hunspell } from 'hunspell-asm';
import * as vscode from 'vscode';
import { DISPLAY_NAME } from "../constants/command";
import { isSkipWord } from "./userDictionary";

interface GetDiagnosticProps {
  match: RegExpExecArray;
  lineIndex: number;
  documentUri: vscode.Uri;
  hunspell: Hunspell;
  globalState?: vscode.ExtensionContext['globalState'];
}

const getDiagnostic = ({ match, lineIndex, documentUri, hunspell, globalState }: GetDiagnosticProps): vscode.Diagnostic | null => {
  const word = match[0];

  if (!word) {
    return null;
  }

  const preprocessedWord = getPreprocessedWord(word);

  if (!preprocessedWord.length) {
    return null;
  }

  if (isSkipWord(preprocessedWord, globalState)) {
    return null;
  }

  if (!hunspell.spell(preprocessedWord)) {
    const startPosition = new vscode.Position(lineIndex, match.index);
    const endPosition = new vscode.Position(lineIndex, match.index + word.length);
    const range = new vscode.Range(startPosition, endPosition);

    const suggestions = hunspell.suggest(preprocessedWord);
    const diagnostic = new vscode.Diagnostic(
      range,
      `맞춤법 오류: ${preprocessedWord}`,
      vscode.DiagnosticSeverity.Information
    );
    diagnostic.source = DISPLAY_NAME;
    diagnostic.relatedInformation = [
      new vscode.DiagnosticRelatedInformation(
        new vscode.Location(documentUri, range),
        `제안: ${suggestions.join(', ')}`
      )
    ];

    return diagnostic;
  }

  return null;
};

export default getDiagnostic;
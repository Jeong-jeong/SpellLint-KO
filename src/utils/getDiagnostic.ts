import getPreprocessedWord from "./getPreprocessedWord";
import { Hunspell } from 'hunspell-asm';
import * as vscode from 'vscode';

interface GetDiagnosticProps {
  match: RegExpExecArray;
  lineIndex: number;
  documentUri: vscode.Uri;
  hunspell: Hunspell;
}

const getDiagnostic = ({ match, lineIndex, documentUri, hunspell }: GetDiagnosticProps): vscode.Diagnostic | null => {
  const word = match[0];

  if (!word) {
    return null;
  }

  const preprocessedWord = getPreprocessedWord(word);

  if (preprocessedWord.length > 0 && !hunspell.spell(preprocessedWord)) {
    console.log(hunspell.spell('메세지'), hunspell.suggest('메세지'));
    const startPosition = new vscode.Position(lineIndex, match.index);
    const endPosition = new vscode.Position(lineIndex, match.index + word.length);
    const range = new vscode.Range(startPosition, endPosition);

    const suggestions = hunspell.suggest(preprocessedWord);
    const diagnostic = new vscode.Diagnostic(
      range,
      `맞춤법 오류: ${preprocessedWord}`,
      vscode.DiagnosticSeverity.Information
    );
    diagnostic.source = 'SpellLint-KO';
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
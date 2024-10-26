import getPreprocessedWord from "./getPreprocessedWord";
import { Hunspell } from 'hunspell-asm';
import * as vscode from 'vscode';
import { DISPLAY_NAME } from "../constants/command";
import { isSkipWord } from "./userDictionary";

interface GetDiagnosticProps {
  line: string;
  response: HanspellResponse;
  lineIndex: number;
  documentUri: vscode.Uri;
}

const getDiagnostic = ({ line, response, lineIndex, documentUri }: GetDiagnosticProps): vscode.Diagnostic => {
  const { token, suggestions } = response;
  const tokenIndex = line.indexOf(token);
  const startPosition = new vscode.Position(lineIndex, tokenIndex);
  const endPosition = new vscode.Position(lineIndex, tokenIndex + token.length);
  const range = new vscode.Range(startPosition, endPosition);
  console.log(startPosition, endPosition, range, 'range');

    const diagnostic = new vscode.Diagnostic(
      range,
      `맞춤법 오류: ${token}`,
      vscode.DiagnosticSeverity.Information
    );
  console.log(diagnostic, 'diagnostic');
    diagnostic.source = DISPLAY_NAME;
    diagnostic.relatedInformation = [
      new vscode.DiagnosticRelatedInformation(
        new vscode.Location(documentUri, range),
        `제안: ${suggestions.join(', ')}`
      )
    ];

    return diagnostic;
};

export default getDiagnostic;
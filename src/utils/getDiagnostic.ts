import * as vscode from 'vscode';
import { DIAGNOSTIC_SPELL_SUGGESTION_CODE, DISPLAY_NAME } from "../constants/command";

interface DiagnosticResponse {
  token: string;
  suggestions: string[];
  info?: string;
}

interface GetDiagnosticProps {
  line: string;
  response: DiagnosticResponse;
  lineIndex: number;
  documentUri: vscode.Uri;
  severity: vscode.DiagnosticSeverity;
}

const getDiagnostic = ({ line, response, lineIndex, documentUri, severity }: GetDiagnosticProps): vscode.Diagnostic => {
  const { token, suggestions } = response;
  const tokenIndex = line.indexOf(token);
  const startPosition = new vscode.Position(lineIndex, tokenIndex);
  const endPosition = new vscode.Position(lineIndex, tokenIndex + token.length);
  const range = new vscode.Range(startPosition, endPosition);

  const diagnostic = new vscode.Diagnostic(
    range,
    `맞춤법 오류: ${token}`,
    severity
  );
  
  diagnostic.source = DISPLAY_NAME;
  diagnostic.code = {
    value: DIAGNOSTIC_SPELL_SUGGESTION_CODE,
    target: vscode.Uri.parse(JSON.stringify(suggestions)),
  };
  diagnostic.relatedInformation = [
    new vscode.DiagnosticRelatedInformation(
      new vscode.Location(documentUri, range),
      response.info || ''
    ),
  ];

  return diagnostic;
};

export default getDiagnostic;
import { Hunspell } from 'hunspell-asm';
import * as vscode from 'vscode';
import getMatchKoreanWords from './getMatchKoreanWords';
import getDiagnostic from './getDiagnostic';

interface CheckSpellingProps {
  document: vscode.TextDocument;
  hunspell: Hunspell;
  diagnosticCollection: vscode.DiagnosticCollection;
}

const checkSpelling = ({ document, hunspell, diagnosticCollection }: CheckSpellingProps) => {
  const text = document.getText();
  const diagnostics: vscode.Diagnostic[] = [];
  const lines = text.split('\n');

  lines.forEach((line, lineIndex) => {
    const matches = getMatchKoreanWords(line);
    
    matches.forEach((match) => {
      const diagnostic = getDiagnostic({ match, lineIndex, documentUri: document.uri, hunspell });

      if (diagnostic) {
        diagnostics.push(diagnostic);
      }
    });
  });

  diagnosticCollection.set(document.uri, diagnostics);
};

export default checkSpelling;
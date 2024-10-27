import { Hunspell } from 'hunspell-asm';
import * as vscode from 'vscode';
import getDiagnostic from './getDiagnostic';
import * as hanspell from 'hanspell';
import getPreprocessedWord from './getPreprocessedWord';
import { isSkipWord } from './userDictionary';

interface CheckSpellingProps {
  document: vscode.TextDocument;
  hunspell: Hunspell;
  diagnosticCollection: vscode.DiagnosticCollection;
  globalState?: vscode.ExtensionContext['globalState'];
}

const checkSpelling = async ({ document, hunspell, diagnosticCollection, globalState }: CheckSpellingProps) => {
  const text = document.getText();
  const diagnostics: vscode.Diagnostic[] = [];
  const lines = text.split('\n');

  for (const [lineIndex, line] of lines.entries()) {
    const koreanSentences = line.match(/([가-힣]+[^\n]*[.!?]?)/g);
    if (!koreanSentences) {
      continue;
    }

    for (const koreanSentence of koreanSentences) {
      const word = koreanSentence.split(' ').find((word) => word.trim().length > 0 && getPreprocessedWord(word));

      if (word) {
        if (!word.length || isSkipWord(word, globalState) || hunspell.spell(word)) {
          continue;
        }

        try {
          const responseArray = await new Promise<HanspellResponse[]>((resolve, reject) => {
            hanspell.spellCheckByPNU(koreanSentence, 6000, resolve, console.log, reject);
          });
  
          responseArray.forEach((response) => {
            const diagnostic = getDiagnostic({
              line,
              response,
              lineIndex: lineIndex,
              documentUri: document.uri,
              severity: vscode.DiagnosticSeverity.Warning,
            });
    
            if (diagnostic) {
              diagnostics.push(diagnostic);
            }
          });
        } catch (error) {
          const suggestions = hunspell.suggest(word);
          const diagnostic = getDiagnostic({
            line,
            response: {
              token: word,
              suggestions,
            },
            lineIndex: lineIndex,
            documentUri: document.uri,
            severity: vscode.DiagnosticSeverity.Information
          });

          if (diagnostic) {
            diagnostics.push(diagnostic);
          }
          console.error(error);
        }
      }
    };
  }

  diagnosticCollection.set(document.uri, diagnostics);
};

export default checkSpelling;
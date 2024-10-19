import { Hunspell } from 'hunspell-asm';
import * as vscode from 'vscode';

interface CheckSpellingProps {
  document: vscode.TextDocument;
  hunspell: Hunspell;
  diagnosticCollection: vscode.DiagnosticCollection;
}

const checkSpelling = ({ document, hunspell, diagnosticCollection }: CheckSpellingProps) => {
  // 문서의 전체 텍스트를 가져온다.
  const text = document.getText();
  // 발견된 맞춤법 오류를 저장할 배열을 초기화한다.
  const diagnostics: vscode.Diagnostic[] = [];
  // 줄 단위로 분리
  const lines = text.split('\n');

  // 각 줄을 순회
  lines.forEach((line, lineIndex) => {
    const matches = Array.from(line.matchAll(KOREAN_WORD_PATTERN));

    matches.forEach((match) => {
      const word = match[0];
      const preprocessedWord = getPreprocessedWord(word);

      if (preprocessedWord.length > 0 && !hunspell.spell(preprocessedWord)) {
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
            new vscode.Location(document.uri, range),
            `제안: ${suggestions.join(', ')}`
          )
        ];

        diagnostics.push(diagnostic);
      }
    });
  });

  diagnosticCollection.set(document.uri, diagnostics);
};

// 한국어 단어 패턴(한글이 하나 이상 포함된 연속된 문자열)
  // [\uAC00-\uD7A3]: 한글 음절로 시작
  // [\uAC00-\uD7A3\s.,!?]*: 한글, 공백, 일부 문장 부호를 포함
  // [\uAC00-\uD7A3]: 한글 음절로 끝남
  const KOREAN_WORD_PATTERN = /[가-힣]+([0-9a-zA-Z]*[가-힣]+)*/g;

export default checkSpelling;

function getPreprocessedWord(word: string) {
  if (word.trim().length === 0) {
    return '';
  }

  return word.replace(/[^가-힣]/g, '');
}
import { expect } from 'chai';
import * as sinon from 'sinon';
import * as vscode from 'vscode';
import getDiagnostic from '../src/utils/getDiagnostic';
import { DIAGNOSTIC_SPELL_SUGGESTION_CODE, DISPLAY_NAME } from '../src/constants/command';

describe('getDiagnostic', () => {
  const mockDocumentUri = vscode.Uri.parse('file:///path/to/file.txt');

  afterEach(() => {
    sinon.restore();
  });

  it('should return a diagnostic for a misspelled word', () => {
    const lineIndex = 0;

    const result = getDiagnostic({
      line: '맛춤뻡이 틀렸어요.',
      response: {
        token: '맛춤뻡',
        suggestions: ['맞춤법'],
        info: '입력 오류입니다.',
      },
      lineIndex,
      documentUri: mockDocumentUri,
      severity: vscode.DiagnosticSeverity.Warning
    });

    expect(result?.message).to.equal('맞춤법 오류: 맛춤뻡');
    expect(result?.source).to.equal(DISPLAY_NAME);
    expect(result?.relatedInformation?.[0].message).to.equal('입력 오류입니다.');
    if (typeof result.code === 'object') {
      expect(result?.code?.value).to.equal(DIAGNOSTIC_SPELL_SUGGESTION_CODE);
      expect(result?.code?.target.path).to.equal('/["맞춤법"]');
    }
  });
});
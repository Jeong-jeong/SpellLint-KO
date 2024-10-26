import { expect } from 'chai';
import * as sinon from 'sinon';
import * as vscode from 'vscode';
import { Hunspell } from 'hunspell-asm';
import getDiagnostic from '../src/utils/getDiagnostic';

describe('getDiagnostic', () => {
  let mockHunspell: sinon.SinonStubbedInstance<Hunspell>;
  const mockDocumentUri = vscode.Uri.parse('file:///path/to/file.txt');

  beforeEach(() => {
    mockHunspell = {
      spell: sinon.stub(),
      suggest: sinon.stub(),
    } as sinon.SinonStubbedInstance<Hunspell>,
    mockHunspell?.spell?.callsFake((word: string) => word !== '맛춤뻡');
    mockHunspell?.suggest?.returns(['맞춤법']);
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should return a diagnostic for a misspelled word', () => {
    const match: RegExpExecArray = Object.assign(['맛춤뻡']);
    const lineIndex = 0;

    const result = getDiagnostic({
      match,
      lineIndex,
      documentUri: mockDocumentUri,
      hunspell: mockHunspell,
    });

    expect(result?.message).to.equal('맞춤법 오류: 맛춤뻡');
    expect(result?.source).to.equal('SpellLint-KO');
    expect(result?.relatedInformation?.[0].message).to.equal('제안: 맞춤법');
  });

  it('should return null for a correct word', () => {
    const match: RegExpExecArray = Object.assign(['맞춤법']);
    const lineIndex = 0;

    const result = getDiagnostic({
      match,
      lineIndex,
      documentUri: mockDocumentUri,
      hunspell: mockHunspell,
    });

    expect(result).to.be.null;
  });
});
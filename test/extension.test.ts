import { expect } from "chai";
import * as hanspell from 'hanspell';
import * as vscode from 'vscode';
import { DIAGNOSTIC_SPELL_SUGGESTION_CODE, DISPLAY_NAME } from "../src/constants/command";
import { Hunspell } from "hunspell-asm";
import * as sinon from 'sinon';
import checkSpelling from "../src/utils/checkSpelling";

describe('extension', () => {
  let sandbox: sinon.SinonSandbox;
  let mockDocument: sinon.SinonStubbedInstance<vscode.TextDocument>;
  let mockHunspell: sinon.SinonStubbedInstance<Hunspell>;
  let mockDiagnosticCollection: sinon.SinonStubbedInstance<vscode.DiagnosticCollection>;
  let mockGlobalState: sinon.SinonStubbedInstance<vscode.ExtensionContext['globalState']>;

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    mockDocument = {
      getText: () => 'Hello 맛춤뻡이 틀렸어요.',
      uri: {
        scheme: 'file',
        path: '/test.txt'
      } as vscode.Uri
    } as sinon.SinonStubbedInstance<vscode.TextDocument>;

    mockHunspell = {
      spell: sandbox.stub(),
      suggest: sandbox.stub()
    } as sinon.SinonStubbedInstance<Hunspell>;
    mockHunspell.spell.callsFake((word: string) => word !== '맛춤뻡이');
    mockHunspell.suggest.returns(['맞춤법']);

    mockDiagnosticCollection = {
      set: sandbox.stub()
    } as sinon.SinonStubbedInstance<vscode.DiagnosticCollection>;

    mockGlobalState = {
      get: sandbox.stub(),
      update: sandbox.stub()
    } as sinon.SinonStubbedInstance<vscode.ExtensionContext['globalState']>;

    sandbox.stub(hanspell, 'spellCheckByPNU').callsFake(
      (_, __, callback: (result: HanspellResponse[]) => void): Promise<void> => {
        callback([{
          token: '맛춤뻡',
          suggestions: ['맞춤법'],
          info: '입력 오류입니다.',
          context: '맛춤뻡이 틀렸어요.'
        }]);
        return Promise.resolve();
      }
    );
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should check spelling for Korean sentences', async () => {
    (mockHunspell.spell).returns(false);

    await checkSpelling({
      document: mockDocument,
      hunspell: mockHunspell,
      diagnosticCollection: mockDiagnosticCollection,
      globalState: mockGlobalState
    });

    const diagnostics = (mockDiagnosticCollection.set as sinon.SinonStub).firstCall.args[1];
    const { severity, message, source, relatedInformation, code } = diagnostics[0];

    expect((mockDiagnosticCollection.set as sinon.SinonStub).calledOnce).to.be.true;
    expect(diagnostics.length).to.equal(1);
    expect(severity).to.equal(vscode.DiagnosticSeverity.Warning);
    expect(message).to.equal('맞춤법 오류: 맛춤뻡');
    expect(source).to.equal(DISPLAY_NAME);
    expect(relatedInformation[0].message).to.be.equal('입력 오류입니다.');
    expect(code.value).to.equal(DIAGNOSTIC_SPELL_SUGGESTION_CODE);
    expect(code.target.path).to.equal('/["맞춤법"]');
  });

  it('should handle hunspell fallback when hanspell fails', async () => {
    (mockHunspell.spell as sinon.SinonStub).returns(false);
    (mockHunspell.suggest as sinon.SinonStub).returns(['맞춤법']);
    (hanspell.spellCheckByPNU as sinon.SinonStub).callsFake(
      (_, __, ___, ____, reject: Function) => {
        reject(new Error('Network error'));
      }
    );

    await checkSpelling({
      document: mockDocument,
      hunspell: mockHunspell,
      diagnosticCollection: mockDiagnosticCollection,
      globalState: mockGlobalState
    });

    const diagnostics = (mockDiagnosticCollection.set as sinon.SinonStub).firstCall.args[1];
    const { severity, message, source, relatedInformation, code } = diagnostics[0];

    expect((mockDiagnosticCollection.set as sinon.SinonStub).calledOnce).to.be.true;
    expect(diagnostics.length).to.equal(1);
    expect(severity).to.equal(vscode.DiagnosticSeverity.Information);
    expect(message).to.equal('맞춤법 오류: 맛춤뻡이');
    expect(source).to.equal(DISPLAY_NAME);
    expect(relatedInformation[0].message).to.be.empty.string;
    expect(code.value).to.equal(DIAGNOSTIC_SPELL_SUGGESTION_CODE);
    expect(code.target.path).to.equal('/["맞춤법"]');
  });

  it('should skip non-Korean lines', async () => {
    const mockEnglishDocument = {
      getText: () => 'Hello world\nGood morning',
      uri: { scheme: 'file', path: '/test.txt' } as vscode.Uri
    } as vscode.TextDocument;

    await checkSpelling({
      document: mockEnglishDocument,
      hunspell: mockHunspell,
      diagnosticCollection: mockDiagnosticCollection,
      globalState: mockGlobalState
    });

    const diagnostics = (mockDiagnosticCollection.set as sinon.SinonStub).firstCall.args[1];

    expect(diagnostics.length).to.equal(0);
  });

  it('should skip words in user dictionary', async () => {
    (mockGlobalState.get as sinon.SinonStub).returns(['맛춤뻡이']);
    
    await checkSpelling({
      document: mockDocument,
      hunspell: mockHunspell,
      diagnosticCollection: mockDiagnosticCollection,
      globalState: mockGlobalState
    });

    const diagnostics = (mockDiagnosticCollection.set as sinon.SinonStub).firstCall.args[1];
    
    expect((mockHunspell.spell as sinon.SinonStub).called).to.be.false;
    expect(diagnostics.length).to.equal(0);
  });
});

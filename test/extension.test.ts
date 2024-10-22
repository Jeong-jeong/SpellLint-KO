import { expect } from "chai";
import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';

describe('extension', () => {
  let extensionId: string;

  before(async function() {
    this.timeout(10000);

    const packageJsonPath = path.join(__dirname, '../../package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    extensionId = `${packageJson.publisher}.${packageJson.name}`;

    const extension = vscode.extensions.getExtension(extensionId);
    if (extension) {
      if (!extension.isActive) {
        await extension.activate();
      }
    } else {
      throw new Error(`Extension ${extensionId} not found`);
    }
    
    vscode.window.showInformationMessage('Start all tests.');
  });

  it('Extension should be present', () => {
    const extension = vscode.extensions.getExtension(extensionId);
    expect(extension).to.not.be.undefined;
    expect(extension!.isActive).to.be.true;
  });

  it('Should correctly identify spelling errors', async () => {
    const docUri = vscode.Uri.file(
      path.join(__dirname, './test-fixtures', 'errors.txt')
    );
    const document = await vscode.workspace.openTextDocument(docUri);
    await vscode.window.showTextDocument(document);

    const diagnostics = vscode.languages.getDiagnostics(docUri);

    const expectedErrors = [
      {
      word: '맛춤법',
      line: 0,
      startCharacter: 7,
      },
      {
        word: '몇가지',
        line: 1,
        startCharacter: 0,
      },
      {
        word: '맞춤표',
        line: 2,
        startCharacter: 6,
      },
      {
        word: '빠졋어요',
        line: 2,
        startCharacter: 14,
      },
    ];
    expectedErrors.forEach((expectedError) => {
      const diagnostic = diagnostics.find((diagnostic) => {
        return diagnostic.source === 'SpellLint-KO' &&
          diagnostic.message === `맞춤법 오류: ${expectedError.word}`;
      });

      expect(diagnostic?.message).to.equal(`맞춤법 오류: ${expectedError.word}`);
      expect(diagnostic?.severity).to.equal(vscode.DiagnosticSeverity.Information);
      expect(diagnostic?.range.start.line).to.equal(expectedError.line);
    });
  });

  it('Should correctly identify spelling correct', async () => {
    const docUri = vscode.Uri.file(
      path.join(__dirname, './test-fixtures', 'correct.txt')
    );
    const document = await vscode.workspace.openTextDocument(docUri);
    await vscode.window.showTextDocument(document);

    const diagnostics = vscode.languages.getDiagnostics(docUri);

    expect(diagnostics).to.have.lengthOf(0, 'No spelling errors should be found');
  });

  it('Should apply quick fix correctly', async () => {
    const docUri = vscode.Uri.file(
      path.join(__dirname, './test-fixtures', 'errors.txt')
    );
    const document = await vscode.workspace.openTextDocument(docUri);
    await vscode.window.showTextDocument(document);

    const diagnostics = vscode.languages.getDiagnostics(docUri);
    const firstDiagnostic = diagnostics[0];
    const originalWord = document.getText(firstDiagnostic.range);
    const actions = await vscode.commands.executeCommand<vscode.CodeAction[]>(
      'vscode.executeCodeActionProvider',
      docUri,
      firstDiagnostic.range,
    );

    const [firstAction, secondAction] = actions;
    expect(originalWord).to.equal('맛춤법');
    expect(firstAction.title).to.equal(`"맞춤법"(으)로 바꾸기`);
    expect(secondAction.title).to.equal('건너뛰기');
    
    if (firstAction.edit) {
      await vscode.workspace.applyEdit(firstAction.edit);
      const updatedText = document.getText(firstDiagnostic.range);
      expect(updatedText).to.not.equal(originalWord);
    }
  });
});


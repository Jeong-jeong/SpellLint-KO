import * as vscode from 'vscode';
import { loadModule, HunspellFactory, Hunspell } from 'hunspell-asm';
import * as fs from 'fs';
import * as path from 'path';
import checkSpelling from './utils/checkSpelling';

export async function activate(context: vscode.ExtensionContext) {
	console.log('Congratulations, your extension "spell-lint-ko" is now active!');
	// DiagnosticCollection 생성
	// 이 컬렉션이 모든 맞춤법 오류를 저장하고 관리.
	const diagnosticCollection = vscode.languages.createDiagnosticCollection('spell-lint-ko');
	// 확장 프로그램이 비활성화될 때 자동으로 정리되도록 context.subscriptions에 추가
	context.subscriptions.push(diagnosticCollection);

	try {
		const dictionaryPath = path.join(context.extensionPath, 'dictionaries');
		const affPath = path.join(dictionaryPath, 'ko.aff');
		const dicPath = path.join(dictionaryPath, 'ko.dic');
		const affBuffer = await fs.promises.readFile(affPath);
		const dicBuffer = await fs.promises.readFile(dicPath);
		const affUint8Array = new Uint8Array(affBuffer);
		const dicUint8Array = new Uint8Array(dicBuffer);
		
		const hunspellFactory = await loadModule();
		const affFile = hunspellFactory.mountBuffer(affUint8Array);
		const dicFile = hunspellFactory.mountBuffer(dicUint8Array);
		const hunspell = hunspellFactory.create(affFile, dicFile);

		const disposable = vscode.commands.registerCommand('spellLintKo.checkSpelling', () => {
			// The code you place here will be executed every time your command is executed
			// Display a message box to the user
			vscode.window.showInformationMessage('Hello World from SpellLint-KO!');
		});
	
		context.subscriptions.push(disposable);
	
		context.subscriptions.push(
			vscode.workspace.onDidOpenTextDocument((document) => {
				checkSpelling({ document, hunspell, diagnosticCollection });
			})
		);
		context.subscriptions.push(
			vscode.workspace.onDidChangeTextDocument((event) => {
				checkSpelling({ document: event.document, hunspell, diagnosticCollection });
			})
		);
		

	} catch (error) {
		console.log(error, 'error');
	}

	
	
	// checkSpelling({
	// 	document: 
	// })
	// const dictionaryPath = path.join(context.extensionPath, 'dictionaries');
	// const affPath = path.join(dictionaryPath, 'ko.aff');
	// const dicPath = path.join(dictionaryPath, 'ko.dic');
}

// This method is called when your extension is deactivated
export function deactivate() {}

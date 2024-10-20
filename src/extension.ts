import * as vscode from 'vscode';
import SpellCheckActionProvider from './utils/SpellCheckActionProvider';
import checkSpelling from './utils/checkSpelling';
import initializeHunspell from './utils/initializeHunspell';

export async function activate(context: vscode.ExtensionContext) {
	console.log('Congratulations, your extension "SpellLint-KO" is now active!');
	const diagnosticCollection = vscode.languages.createDiagnosticCollection('SpellLint-KO');
	
	context.subscriptions.push(diagnosticCollection);

	try {
		const hunspell = await initializeHunspell(context.extensionPath);

		const disposable = vscode.commands.registerCommand('SpellLint-KO.checkSpelling', () => {
			vscode.window.showInformationMessage('Hello World from SpellLint-KO!');
		});
	
		context.subscriptions.push(disposable);
	
		context.subscriptions.push(
			vscode.workspace.onDidOpenTextDocument((document) => {
				checkSpelling({ document, hunspell, diagnosticCollection });
			})
		);
		context.subscriptions.push(
			vscode.workspace.onDidSaveTextDocument((document) => {
				checkSpelling({ document, hunspell, diagnosticCollection });
			})
		);

		context.subscriptions.push(
			vscode.languages.registerCodeActionsProvider(
				{ scheme: 'file' },
				new SpellCheckActionProvider(),
				{
					providedCodeActionKinds: [vscode.CodeActionKind.QuickFix]
				}
			)
		);

		context.subscriptions.push(
			vscode.commands.registerCommand('SpellLintKo.skip', (word: string) => {
				vscode.window.showInformationMessage(`Skip: ${word}`);
			})
		);
		

	} catch (error) {
		console.log(error, 'error');
	}
}

// This method is called when your extension is deactivated
export function deactivate() {
}

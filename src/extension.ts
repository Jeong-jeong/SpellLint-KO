import * as vscode from 'vscode';
import SpellCheckActionProvider from './utils/SpellCheckActionProvider';
import checkSpelling from './utils/checkSpelling';
import initializeHunspell from './utils/initializeHunspell';
import { DISPLAY_NAME, REGISTER_COMMAND, SKIP_COMMAND } from './constants/command';
import * as userDictionary from './utils/userDictionary';

export async function activate(context: vscode.ExtensionContext) {
	const {
		extensionPath,
		globalState
	} = context;

	console.log(`Congratulations, your extension "${DISPLAY_NAME}" is now active!`);
	const diagnosticCollection = vscode.languages.createDiagnosticCollection(DISPLAY_NAME);
	
	context.subscriptions.push(diagnosticCollection);

	try {
		const hunspell = await initializeHunspell(extensionPath);
		userDictionary.loadSkipWords(globalState, hunspell);

		const disposable = vscode.commands.registerCommand(REGISTER_COMMAND, () => {
			vscode.window.showInformationMessage(`Hello World from ${DISPLAY_NAME}!`);
		});
	
		context.subscriptions.push(disposable);
	
		context.subscriptions.push(
			vscode.workspace.onDidOpenTextDocument(async (document) => {
				vscode.window.onDidChangeActiveTextEditor((editor) => {
					if (editor?.document === document) {
						checkSpelling({
							document,
							hunspell,
							diagnosticCollection,
							globalState,
						});
					}
				});
			})
		);
		context.subscriptions.push(
			vscode.workspace.onDidSaveTextDocument((document) => {
				checkSpelling({
					document,
					hunspell,
					diagnosticCollection,
					globalState
				});
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
			vscode.commands.registerCommand(SKIP_COMMAND, async (word: string) => {
				await userDictionary.addSkipWord({ globalState, word, hunspell });
				const editor = vscode.window.activeTextEditor;
				setTimeout(() => {
					if (editor) {
						checkSpelling({
							document: editor.document,
							hunspell,
							diagnosticCollection,
							globalState,
						});
					}
					vscode.window.showInformationMessage(`"${word}"(을)를 스킵 목록에 추가했어요.)`);
				}, 100);
			})
		);
		

	} catch (error) {
		console.log(error, 'error');
	}
}

// This method is called when your extension is deactivated
export function deactivate() {
}

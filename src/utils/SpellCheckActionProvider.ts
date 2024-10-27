import * as vscode from 'vscode';
import { DIAGNOSTIC_SPELL_SUGGESTION_CODE, DISPLAY_NAME, SKIP_COMMAND } from '../constants/command';

class SpellCheckActionProvider implements vscode.CodeActionProvider {
  public provideCodeActions(
    document: vscode.TextDocument,
    range: vscode.Range,
    context: vscode.CodeActionContext,
    token: vscode.CancellationToken
  ): vscode.CodeAction[] {
    const actions: vscode.CodeAction[] = [];
    for (const diagnostic of context.diagnostics) {
      if (diagnostic.source !== DISPLAY_NAME ) {
        continue;
      }

      const word = document.getText(diagnostic.range);
      let suggestions: string[] = [];
      try {
        if (typeof diagnostic.code === 'object' && diagnostic.code.value === DIAGNOSTIC_SPELL_SUGGESTION_CODE) {
          suggestions = JSON.parse(diagnostic.code?.target.path.replace('/', ''));
        }
      } catch (error) {
        console.error(error);
      };

      for (const suggestion of suggestions) {
        const action = new vscode.CodeAction(`"${suggestion}"(으)로 바꾸기`, vscode.CodeActionKind.QuickFix);
        action.edit = new vscode.WorkspaceEdit();
        action.edit.replace(document.uri, diagnostic.range, suggestion);
        action.isPreferred = true;
        actions.push(action);
      }

      const skipAction = new vscode.CodeAction('건너뛰기', vscode.CodeActionKind.QuickFix);
      skipAction.command = {
        title: '건너뛰기',
        command: SKIP_COMMAND,
        arguments: [word]
      };
      actions.push(skipAction);
    }


    return actions;
  }
}

export default SpellCheckActionProvider;
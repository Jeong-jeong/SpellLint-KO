import * as vscode from 'vscode';

class SpellCheckActionProvider implements vscode.CodeActionProvider {
  public provideCodeActions(
    document: vscode.TextDocument,
    range: vscode.Range,
    context: vscode.CodeActionContext,
    token: vscode.CancellationToken
  ): vscode.CodeAction[] {
    const actions: vscode.CodeAction[] = [];
    console.log(context.diagnostics, 'context.diagnostics');
    for (const diagnostic of context.diagnostics) {
      console.log(diagnostic, 'diagnostic');
      if (diagnostic.source !== 'SpellLint-KO' ) {
        continue;
      }

      const word = document.getText(diagnostic.range);
      const suggestions = diagnostic.relatedInformation?.[0].message.replace('제안: ', '').split(', ') || [];

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
        command: 'SpellLintKo.skip',
        arguments: [word]
      };
      actions.push(skipAction);
    }


    return actions;
  }
}

export default SpellCheckActionProvider;
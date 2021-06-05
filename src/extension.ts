import { commands, DocumentSelector, ExtensionContext, IndentAction, languages, workspace } from 'vscode';
import { onSkriptEnable } from './Skript';
import * as Provider from './provider';
import TextDocumentChangeEvent from './event/TextDocumentChangeEvent';

// Options
languages.setLanguageConfiguration('vskript', {
	onEnterRules: [{
		action: {indentAction: IndentAction.Indent},
		beforeText: /\:((\s\t)*?\#.*?)?$/i
	}],
	brackets: [['(', ')'], ['[', ']'], ['{', '}'], ['"', '"'], ['%', '%']],
	comments: {lineComment: '#'},
});

export function activate(context:ExtensionContext) {

	onSkriptEnable();

	context.subscriptions.push(

		// Provider
		languages.registerCompletionItemProvider('vskript', new Provider.SkriptCompletionItemProvider()),
		languages.registerColorProvider('vskript', new Provider.SkriptDocumentColorProvider()),
		languages.registerDocumentSymbolProvider('vskript', new Provider.SkriptDocumentSymbolProvider()),
		languages.registerWorkspaceSymbolProvider(new Provider.SkriptWorkspaceSymbolProvider()),
		languages.registerHoverProvider('vskript', new Provider.SkriptHoverProvider()),
		languages.registerDefinitionProvider('vskript', new Provider.SkriptDefinitionProvider()),

		// Event;
		workspace.onDidChangeTextDocument(TextDocumentChangeEvent)

		
	);


}

export function deactivate() {}

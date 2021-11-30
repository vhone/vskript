import { ExtensionContext, IndentAction, languages, workspace } from 'vscode';
import { onSkriptEnable } from './skript_v0.0.7/Skript';
import * as Provider from './provider/Provider';
import TextDocumentChangeEvent from './event/TextDocumentChangeEvent';
import { LEGEND } from './provider/SkriptDocumentSemanticTokensProvider';
import { VisualSkript } from './skript_v0.0.8/skript/Skript';
import { PatternType, Type } from './skript_v0.0.8/skript/parser/type/LangType';

// Options
languages.setLanguageConfiguration('vskript', {
	onEnterRules: [{
		action: {indentAction: IndentAction.Indent},
		beforeText: /\:((\s\t)*?\#.*?)?$/i
	}],
	brackets: [['(', ')'], ['[', ']'], ['{', '}']],
	comments: {lineComment: '#'}
});

export function activate(_context:ExtensionContext) {

	onSkriptEnable();

	// Provider
	languages.registerDocumentSymbolProvider('vskript', new Provider.SkriptDocumentSymbolProvider());
	languages.registerWorkspaceSymbolProvider(new Provider.SkriptWorkspaceSymbolProvider());
	languages.registerHoverProvider('vskript', new Provider.SkriptHoverProvider());
	languages.registerDefinitionProvider('vskript', new Provider.SkriptDefinitionProvider());
	languages.registerCompletionItemProvider('vskript', new Provider.SkriptCompletionItemProvider());
	languages.registerDocumentSemanticTokensProvider('vskript', new Provider.SkriptDocumentSemanticTokensProvider(), LEGEND);
	languages.registerColorProvider('vskript', new Provider.SkriptDocumentColorProvider());
	
	// Event;
	workspace.onDidChangeTextDocument(TextDocumentChangeEvent);
	
	VisualSkript.onEnable()

	let type = new PatternType(Type.ENTITY, false);
	console.log(type.name);
}

export function deactivate() {}

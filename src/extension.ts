import { ExtensionContext, IndentAction, languages, workspace } from 'vscode';
import { onSkriptEnable } from './skript_v0.0.7/Skript';
import * as Provider from './skript_v0.0.7/provider/Provider';
import TextDocumentChangeEvent from './skript_v0.0.7/event/TextDocumentChangeEvent';
import { LEGEND } from './skript_v0.0.7/provider/SkriptDocumentSemanticTokensProvider';
import { VisualSkript } from './skript_v0.0.8/skript/Skript';
import { Class, StringBuilder } from './Java';

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
	
	// VisualSkript.onEnable()
	
	// let text = ['#test',
	// 			'command /test:',
	// 			'	trigger:',
	// 			'	set {_a} to true']
	// console.log(FileParser.parseFileLines('text', text, 0, 0));

	
	// let lang = FileSystem.readFileSync(`${context.extensionUri.fsPath}/src/resource/lang/default.lang`, 'utf-8');
	// let lines: string[] = lang.split(/\r\n|\r|\n/);
	// // console.log(lines);
	// console.log(FileParser.parseFileLines('alias', lines, 0, 0))
	
}

export function deactivate() {}


class Test {
	constructor(public msg: string) {
		console.log(msg)
	}
}

let a: Class<Test> = Test;
console.log(new a())
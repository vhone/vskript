import { ExtensionContext, IndentAction, languages, workspace } from 'vscode';
import { onSkriptEnable } from './Skript';
import * as Provider from './provider';
import TextDocumentChangeEvent from './event/TextDocumentChangeEvent';
import { LEGEND } from './provider/SkriptDocumentSemanticTokensProvider';
import { SkriptPattern } from './Pattern';

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

	/*
	let line = 'send [the] action bar [with text] %text% to %players%';
	let regexp = new RegExp("send\\s+(?!the\\s+)?action\\s+bar\\s+(?!with\\s+text\\s+)?%([^%])%\\s+to\\s+%([^%])%")
	console.log(regexp.exec(line))
	*/

	/* 변수, 글자 찾기 */
	
	// let line = 'set {_a::%{_c}%::%{_d}%} to {_b}';
	let line = 'set {_a::%{_c}%::%{_d}%} to "text in ""a"" at %world "over"% to ""good job""."';
	// let line = '"text in %world "over"%"';

	let text = new SkriptPattern('text', '"', '"', ['""', '%%']);
	let variable = new SkriptPattern('normal_variable', '{', '}');
	let nested = new SkriptPattern('nested_expression', '%', '%');

	text.addInclude('nested_expression');
	variable.addInclude('nested_expression');
	nested.addInclude('text');
	nested.addInclude('normal_variable');
	
	// console.log(variable.exec(line));
	// console.log(nested.exec(line));
	console.log(text.exec(line));
	




	/*
	패턴 종류
	소괄호() - 필수 선택
	대괄호[] - 비필수 선택
	세로바| - 선택지
	퍼센트%% - 타입
	하이픈- - 나열형 타입
	*/

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

}

export function deactivate() {}
import { ExtensionContext, IndentAction, languages, workspace } from 'vscode';
import * as Provider from './provider';
import TextDocumentChangeEvent from './event/TextDocumentChangeEvent';
import { LEGEND } from './provider/SkriptDocumentSemanticTokensProvider';
import { SkriptType } from './skript/element/SkriptType';
import { SkriptManager } from './Skript';
import { SkriptParser } from './skript/language/SkriptParser';
import { SkriptPattern } from './skript/language/SkriptPattern';

// Options
languages.setLanguageConfiguration('vskript', {
	onEnterRules: [{
		action: {indentAction: IndentAction.Indent},
		beforeText: /\:((\s\t)*?\#.*?)?$/i
	}],
	brackets: [['(', ')'], ['[', ']'], ['{', '}']],
	comments: {lineComment: '#'}
});

export function activate(context:ExtensionContext) {

	/* 변수, 글자 찾기 */
	/*
	// let line = 'set {_a::%{_c}%::%{_d}%} to {_b}';
	let line = 'set {_a::%{_c}%::%{_d}%} to "text in ""a"" at %world "over"% to ""good job""."';
	// let line = '"text in %world "over"%"';

	let text = SkriptPattern.create('text', '"', '"', ['""', '%%']);
	text.addInclude('nested_expression');

	let variable = SkriptPattern.create('normal_variable', '{', '}');
	variable.addInclude('nested_expression');

	let nested = SkriptPattern.create('nested_expression', '%', '%');
	nested.addInclude('text');
	nested.addInclude('normal_variable');

	SkriptPattern.REPOSITORY.register(text, variable, nested);
	
	console.log(variable.exec(line));
	// console.log(variable.exec(line));
	// console.log(nested.exec(line));
	// console.log(text.exec(line));
	*/


	
	/*
	let line = 'send action bar "a" to player';

	let line_index = 0;
	for (const skWord of words) {
		console.log(`[${skWord.word}] ${skWord.isNormal} ${skWord.isOption} ${skWord.isType}`);

		if (skWord.isNormal) {
			if (line.indexOf(skWord.word, line_index) === line_index) {
				line_index += skWord.word.length;
				console.log(`[1] ${line_index}`)
				while (line_index === line.indexOf( ' ', line_index)) {
					line_index++;
					console.log(`[2] ${line_index}`)
				}
			} else {
				console.log(`Invailed Normal Word - word: ${skWord.word}, char: ${line_index}`)
				break;
			}

		} else if (skWord.isOption) {
			if (line.indexOf(skWord.word, line_index) === line_index) {
				line_index += skWord.word.length;
				console.log(`[1] ${line_index}`)
				while (line_index === line.indexOf( ' ', line_index)) {
					line_index++;
					console.log(`[2] ${line_index}`)
				}
			} else {
				continue;
			}

		} else if (skWord.isType && skWord instanceof SkriptParserType) {
			let skLangType = skWord.skType.type;
			let search
			if (skLangType.name === 'text') {
				text.setLastIndex(line_index)
				search = text.exec(line);
			} else if (skLangType.name === 'player') {
				console.log( `익스프레션 처리 - player`)
				search = {index: line.indexOf('player'), text: 'player'}
			}
			if (search && search.index === line_index) {
				line_index += search.text.length;
				console.log(`[1] ${line_index}`)
				while (line_index === line.indexOf( ' ', line_index)) {
					line_index++;
					console.log(`[2] ${line_index}`)
				}
			} else {
				console.log(`Invailed Normal Word - word: ${skWord.word}, char: ${line_index}`)
				break;
			}
		}
	}
	*/



	// let search
	// while (search = option.exec(pattern)) {
	// 	console.log(search);

	// 	let inText = search.text.substring(1, search.text.length - 1);
	// 	console.log(`inText=${inText}`)
	// 	console.log(`lastindex=${option.getLastIndex()}`)

	// 	let skWord = new SkriptParserWord( inText, SkriptParserWordType.OPTION );

	// }
	// let line = 'send action bar \"message\" to player'




	/*
	패턴 종류
	소괄호() - 필수 선택
	대괄호[] - 비필수 선택
	세로바| - 선택지
	퍼센트%% - 타입
	하이픈- - 나열형 타입
	*/

	SkriptManager.onSkriptEnable(context);

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


	
	
	let parser = new SkriptParser('EffSendActionBar', 'send [the] action bar [with text] %text% to %players%');
	let line = 'send action bar "a" to player';
	console.log(parser.exec(line))


}

export function deactivate() {}
import { ExtensionContext, IndentAction, languages, workspace } from 'vscode';
import { onSkriptEnable } from './Skript';
import * as Provider from './provider';
import TextDocumentChangeEvent from './event/TextDocumentChangeEvent';
import { LEGEND } from './provider/SkriptDocumentSemanticTokensProvider';
import { SkriptPattern } from './Pattern';
import { SkriptType } from './skript/element/SkriptType';

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
	let pattern = 'send [the] action bar [with text] %text% to %players%';
	console.log(pattern);

	let option = new SkriptPattern('pattern_option', '\\[', '\\]');
	option.addInclude('pattern_option');

	let type = new SkriptPattern('pattern_type', '\\%', '\\%');

	let normal = new SkriptPattern('pattern_normal', '[^\\s]+');



	let words = new Array<ISkriptParserWord>();


	let index = 0;
	let result;
	while (true) {

		if (index >= pattern.length) {
			break;
		}

		option.setLastIndex(index);
		if (result = option.exec(pattern)) {
			if (result.index === index) {

				let word = new SkriptParserOption(result.text.substring(1, result.text.length - 1).trim());
				words.push(word);

				index = option.getLastIndex();
				while (index === pattern.indexOf(' ', index)) {
					index++;
				}
				continue;
			}
		}

		type.setLastIndex(index);
		if (result = type.exec(pattern)) {
			if (result.index === index) {

				let word = new SkriptParserType(result.text.substring(1, result.text.length - 1).trim());
				words.push(word);

				index = type.getLastIndex();
				while (index === pattern.indexOf(' ', index)) {
					index++;
				}
				continue;
			}
		}

		normal.setLastIndex(index);
		if (result = normal.exec(pattern)) {
			if (result.index === index) {

				let word = new SkriptParserNormal(result.text);
				words.push(word);

				index = normal.getLastIndex();
				while (index === pattern.indexOf(' ', index)) {
					index++;
				}
				continue;
			}
		}

		console.log(`invaild - [${index}]`)
		break;
	   
	}

	console.log(words);
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




	

	/* 변수, 글자 찾기 */
	/*
	let line = 'set {_a::%{_c}%::%{_d}%} to {_b}';
	// let line = 'set {_a::%{_c}%::%{_d}%} to "text in ""a"" at %world "over"% to ""good job""."';
	// let line = '"text in %world "over"%"';

	let text = new SkriptPattern('text', '"', '"', ['""', '%%']);
	let variable = new SkriptPattern('normal_variable', '{', '}');
	let nested = new SkriptPattern('nested_expression', '%', '%');

	text.addInclude('nested_expression');
	variable.addInclude('nested_expression');
	nested.addInclude('text');
	nested.addInclude('normal_variable');
	
	console.log(variable.exec(line));
	console.log(variable.exec(line));
	// console.log(nested.exec(line));
	console.log(text.exec(line));
	*/




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

export interface ISkriptParserWord {

}

abstract class SkriptParserWord implements ISkriptParserWord {

	private readonly _word: string;

	constructor(word:string) {
		this._word = word;
	}

	public get word(): string {
		return this._word;
	}
	
}

class SkriptParserOption extends SkriptParserWord {

	// private readonly _inWord: string;

	constructor(word:string) {
		super(word);

	}

}

class SkriptParserType extends SkriptParserWord {

	// private readonly _inWord: string;

	constructor(word:string) {
		super(word);
		console.log(SkriptType.value(word).type.name)
	}

}

class SkriptParserNormal extends SkriptParserWord {

	// private readonly _inWord: string;

	constructor(word:string) {
		super(word);

	}

}
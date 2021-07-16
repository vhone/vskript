import { ExtensionContext, IndentAction, languages, Position, Range, workspace } from 'vscode';
import { onSkriptEnable } from './Skript';
import { SkriptExpression, SkriptExprVariable } from './skript/Context';
import * as Provider from './provider';
import TextDocumentChangeEvent from './event/TextDocumentChangeEvent';
import { EFFECTS } from './skript_fork/resource/Effects';

// Options
languages.setLanguageConfiguration('vskript', {
	onEnterRules: [{
		action: {indentAction: IndentAction.Indent},
		beforeText: /\:((\s\t)*?\#.*?)?$/i
	}],
	brackets: [['(', ')'], ['[', ']'], ['{', '}']],
	comments: {lineComment: '#'}
});


/*
function findText(text:string, opener:string, closer:string, inner?:string): String[] | undefined {

	let any = `[^${opener}${closer}]*`
	let expr = `%[^%]*%`
	inner = (inner) ? `%${any}${inner}${any}%` : '';
	let regexp = new RegExp(`${opener}${any}(${expr}${any})?${inner}${any}(${expr}${any})?${closer}`, 'g');

	console.log(regexp + ' → ' + text)
	let set = new Set<string>();
	let search
	let range = [-1, -1];
	while (search = regexp.exec(text)) {
		let inner = findText(text, opener, closer, search[0]);
		if (!inner) {
			set.add(search[0]);
		} else {
			inner.forEach(e => set.add(e));
		}
	}

	// console.log(range)
	// console.log(text.substring(range[0], range[1]));
	
	// array.push(...findText(text, opener, closer, search[0]));
	
	return (set.size > 0) ? Array.from(set) : undefined;
}
*/











// (c) 2007 Steven Levithan <stevenlevithan.com>
// MIT License

/*** matchRecursive
	accepts a string to search and a format (start and end tokens separated by "...").
	returns an array of matches, allowing nested instances of format.

	examples:
		matchRecursive("test",          "(...)")   -> []
		matchRecursive("(t(e)s)()t",    "(...)")   -> ["t(e)s", ""]
		matchRecursive("t<e>>st",       "<...>")   -> ["e"]
		matchRecursive("t<<e>st",       "<...>")   -> ["e"]
		matchRecursive("t<<e>>st",      "<...>")   -> ["<e>"]
		matchRecursive("<|t<e<|s|>t|>", "<|...|>") -> ["t<e<|s|>t"]
*/
const matchRecursive = function () {
	let	formatParts = /^([\S\s]+?)\.\.\.([\S\s]+)/,
		metaChar = /[-[\]{}()*+?.\\^$|,]/g,
		escape = function (str: string) {
			return str.replace(metaChar, "\\$&");
		};

	return function (str: string, format: string) {
		let p = formatParts.exec(format);
		if (!p) throw new Error("format must include start and end tokens separated by '...'");
		if (p[1] == p[2]) throw new Error("start and end format tokens cannot be identical");

		let	opener = p[1],
			closer = p[2],
			iterator = new RegExp(format.length === 5 ? "["+escape(opener+closer)+"]" : escape(opener)+"|"+escape(closer), "g"),
			results = [],
			openTokens,
			matchStartIndex = -1,
			match;

		do {
			openTokens = 0;
			while (match = iterator.exec(str)) {
				if (match[0] === opener) {
					if (openTokens === 0)
						matchStartIndex = iterator.lastIndex;
					openTokens++;
				} else if (openTokens > 0) {
					openTokens--;
					if (openTokens > 0)
						results.push(str.slice(matchStartIndex, match.index));
				}
			}
		} while (openTokens && (iterator.lastIndex = matchStartIndex));

		return results;
	};
}();











export function activate(_context:ExtensionContext) {

	// let variable = 'set {asdf::%{bacde::%{_asd}%::asd}%} to {123::%{1252::%{_232}%::151 123}%}';
	let variable = 'set {asdf.{abcd}::%{bacde::%{_asd}%::%{_wnm}%}%} to {123::% {1252::%player%::151 123}%}'

	// let brackets: string[][] = [['{', '}'], ['%', '%']];
	let brackets: string[] = ['{', '}'];

	console.log(matchRecursive(variable, '{...}'))
	// let find = findText(variable, '{', '}');
	// console.log(find)

	/*
	// let text = 'set {_a} to "b"';
	let text = 'set ';

	for (const eff of EFFECTS) {
		eff.next(text);
	}
	*/

	/*
	let map = new Map<number,string>();
	// let pattern = 'send [the] action bar [with text] %text% to %players%';
	let pattern = 'break %blocks% [naturally] [using %item type%]';
	let i = 0;
	let pos = 0;
	let regexp = /\%[^\%]+\%/g;
	let search
	while(search = regexp.exec(pattern)) {
		let index = search.index!;
		if (index === pos) {
			map.set(i++, search[0]);
		} else {
			let sub = pattern.substring(pos, index);
			map.set(i++, sub.trim());
			map.set(i++, search[0]);
		}
		pos = index + search[0].length;
		console.log(pos, search);
	}
	console.log(map);
	*/

	onSkriptEnable();

	// Provider
	languages.registerDocumentSymbolProvider('vskript', new Provider.SkriptDocumentSymbolProvider());
	languages.registerWorkspaceSymbolProvider(new Provider.SkriptWorkspaceSymbolProvider());
	languages.registerHoverProvider('vskript', new Provider.SkriptHoverProvider());
	languages.registerDefinitionProvider('vskript', new Provider.SkriptDefinitionProvider());
	languages.registerCompletionItemProvider('vskript', new Provider.SkriptCompletionItemProvider());
	
	// Event;
	workspace.onDidChangeTextDocument(TextDocumentChangeEvent);
	
	/*
	
	languages.registerColorProvider('vskript', new Provider.SkriptDocumentColorProvider());
	languages.registerDocumentSemanticTokensProvider('vskript', new Provider.SkriptDocumentSemanticTokensProvider(), LEGEND);


	languages.registerEvaluatableExpressionProvider('vskript', {
		provideEvaluatableExpression(_document: TextDocument, _position: Position, _token: CancellationToken): EvaluatableExpression {
			console.log('registerEvaluatableExpressionProvider');
			return new EvaluatableExpression(new Range(new Position(1,0), new Position(1,10)));
		}
	})
	*/



	
	// let expressionMap = createExpressionMap(1, `set {_a} to func( a, "b", {_c::%{_d}%}, "func3() = %% 퍼센트 %func2( player, {_b}, func4() )%" )`);
	// console.log(expressionMap);
}

export function deactivate() {}



function createExpressionMap(line:number, text:string): Map<string, SkriptExpression> | undefined {

	console.log('[start]');

	let map = new Map<string, SkriptExpression>();
	let mapRemover = new Array<string>();
	let code = text;
	let search;

	// // Text
	// while (search = code.match(/\"([^\"]*)\"/)) {
		
	// 	// console.log('[text]');

	// 	// 반복 세팅
	// 	let key = '$['+map.size+']';
	// 	code = code.replace(search[0], key);

	// 	// search 치환 : 먼저 생성되어 key로 치환된 값
	// 	let children = new Set<SkriptExpression>();
	// 	let replace;
	// 	while (replace = search[0].match(/\$\[\d\]/)) {
	// 		console.log(replace);
	// 		let expression = map.get(replace[0]);
	// 		if (expression) {
	// 			mapRemover.push(replace[0]);
	// 			children.add(expression);
	// 			search[0] = search[0].replace(replace[0], expression.code);
	// 		}
	// 	}

	// 	// Function 생성 : 먼저 생성된 Expression에 연결
	// 	let position = search.index!;
	// 	let range = new Range(new Position(line, position), new Position(line, position + search[0].length + 1))
	// 	let skExprText = new SkriptExprText(range, search[0]);

	// 	// 재귀 : 아직 생성되지 않은 Expression 생성
	// 	let innerCode = search[1];
	// 	let inner;
	// 	while (inner = innerCode.match(/\%([^%]*)%/)) {
	// 		let innerMap = createExpressionMap(line, inner[1])!;
	// 		if (innerMap) {
	// 			for (const value of innerMap) {
	// 				value[1].setParent(skExprText);
	// 				skExprText.addChildren(value[1]);
	// 			}
	// 		}
	// 		innerCode = innerCode.replace(inner[0], '');
	// 	}

	// 	// Map 세팅
	// 	map.set(key, skExprText);
	// 	console.log(skExprText);

	// }

	// // Function
	// while (search = code.match(/([a-zA-Z0-9_]*)\(([^()]*)\)/)) {

	// 	// 반복 세팅
	// 	let key = '$[' + map.size + ']';
	// 	code = code.replace(search[0], key);

	// 	// search 치환 : 먼저 생성되어 key로 치환된 값
	// 	let children = new Set<SkriptExpression>();
	// 	let replace;
	// 	while (replace = search[0].match(/\$\[\d\]/)) {
	// 		let expression = map.get(replace[0]);
	// 		if (expression) {
	// 			mapRemover.push(replace[0]);
	// 			children.add(expression);
	// 			search[0] = search[0].replace(replace[0], expression.code);
	// 		}
	// 	}

	// 	// Function 생성 : 먼저 생성된 Expression에 연결
	// 	let position = search.index!;
	// 	let range = new Range(new Position(line, position), new Position(line, position + search[0].length + 1));
	// 	let skExprFunction = new SkriptExprFunction(range, search[0], search[1]);
	// 	for (const child of children) {
	// 		child.setParent(skExprFunction);
	// 		skExprFunction.addChildren(child);
	// 	}
		
	// 	// 재귀 : 아직 생성되지 않은 Expression 생성
	// 	let innerMap = createExpressionMap(line, search[2]);
	// 	if (innerMap) {
	// 		// console.log('func.innerMap:', innerMap);
	// 		for (const value of innerMap) {
	// 			value[1].setParent(skExprFunction);
	// 			skExprFunction.setParent(value[1]);
	// 		}
	// 	}

	// 	// Map 세팅
	// 	map.set(key, skExprFunction);
	// 	console.log(skExprFunction);

	// }

	// Variable

	while (search = code.match(/\{[^{}]*\}/)) {

		// 반복 세팅
		let key = '$[' + map.size + ']';
		code = code.replace(search[0], key);
		console.log(search);

		// search 치환 : 먼저 생성되어 key로 치환된 값
		let children = new Set<SkriptExpression>();
		let replace;
		while (replace = search[0].match(/\$\[\d\]/)) {
			let expression = map.get(replace[0]);
			console.log(map)
			if (expression) {
				mapRemover.push(replace[0]);
				children.add(expression);
				search[0] = search[0].replace(replace[0], expression.code);
			}
		}

		// Variable 생성 : 먼저 생성된 Expression에 연결
		let position = search.index!;
		let range = new Range(new Position(line, position), new Position(line, position + search[0].length + 1));
		let skExprVariable = new SkriptExprVariable(range, search[0]);
		for (const child of children) {
			child.setParent(skExprVariable);
			skExprVariable.addChildren(child);
		}

		// Map 세팅
		map.set(key, skExprVariable);
		
		// // 재귀 : 아직 생성되지 않은 Expression 생성
		// let innerCode = search[1];
		// console.log('text.innerCode:', search[1]);
		// let inner;
		// while (inner = innerCode.match(/\%([^%]*)%/)) {
		// 	let innerMap = createExpressionMap(line, inner[1])!;
		// 	if (innerMap) {
		// 		console.log('text.innerMap:', innerMap)
		// 		for (const value of innerMap) {
		// 			value[1].setParent(skExprVariable);
		// 			skExprVariable.addChildren(value[1]);
		// 		}
		// 	}
		// 	innerCode = innerCode.replace(inner[0], '');
		// }

	}

	for (const removeKey of mapRemover) {
		map.delete(removeKey);
	}

	return (map.size === 0) ? undefined : map;

}
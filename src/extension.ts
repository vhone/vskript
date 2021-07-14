import { ExtensionContext, IndentAction, languages, Position, Range, workspace } from 'vscode';
import { onSkriptEnable } from './Skript';
import { SkriptExpression, SkriptExprVariable } from './skript/Context';
import * as Provider from './provider';
import TextDocumentChangeEvent from './event/TextDocumentChangeEvent';

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
	
	// Event;
	workspace.onDidChangeTextDocument(TextDocumentChangeEvent);
	
	/*
<<<<<<< HEAD
=======
	
>>>>>>> a2b2298247eaf3dab035b65b4cb99579908ad818
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
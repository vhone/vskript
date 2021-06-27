"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
const vscode_1 = require("vscode");
const Skript_1 = require("./Skript");
const Provider = require("./provider");
const TextDocumentChangeEvent_1 = require("./event/TextDocumentChangeEvent");
const SkriptDocumentSemanticTokensProvider_1 = require("./provider/SkriptDocumentSemanticTokensProvider");
const Context_1 = require("./skript/Context");
// Options
vscode_1.languages.setLanguageConfiguration('vskript', {
    onEnterRules: [{
            action: { indentAction: vscode_1.IndentAction.Indent },
            beforeText: /\:((\s\t)*?\#.*?)?$/i
        }],
    brackets: [['(', ')'], ['[', ']'], ['{', '}']],
    comments: { lineComment: '#' }
});
function activate(_context) {
    Skript_1.onSkriptEnable();
    // Provider
    vscode_1.languages.registerCompletionItemProvider('vskript', new Provider.SkriptCompletionItemProvider());
    vscode_1.languages.registerColorProvider('vskript', new Provider.SkriptDocumentColorProvider());
    vscode_1.languages.registerDocumentSymbolProvider('vskript', new Provider.SkriptDocumentSymbolProvider());
    vscode_1.languages.registerWorkspaceSymbolProvider(new Provider.SkriptWorkspaceSymbolProvider());
    vscode_1.languages.registerHoverProvider('vskript', new Provider.SkriptHoverProvider());
    vscode_1.languages.registerDefinitionProvider('vskript', new Provider.SkriptDefinitionProvider());
    vscode_1.languages.registerDocumentSemanticTokensProvider('vskript', new Provider.SkriptDocumentSemanticTokensProvider(), SkriptDocumentSemanticTokensProvider_1.LEGEND);
    // Event;
    vscode_1.workspace.onDidChangeTextDocument(TextDocumentChangeEvent_1.default);
    vscode_1.languages.registerEvaluatableExpressionProvider('vskript', {
        provideEvaluatableExpression(_document, _position, _token) {
            console.log('registerEvaluatableExpressionProvider');
            return new vscode_1.EvaluatableExpression(new vscode_1.Range(new vscode_1.Position(1, 0), new vscode_1.Position(1, 10)));
        }
    });
    let expressionMap = createExpressionMap(1, `set {_a} to func( a, "b", {_c::%{_d}%}, "func3() = %% 퍼센트 %func2( player, {_b}, func4() )%" )`);
    console.log(expressionMap);
}
exports.activate = activate;
function deactivate() { }
exports.deactivate = deactivate;
function createExpressionMap(line, text) {
    console.log('[start]');
    let map = new Map();
    let mapRemover = new Array();
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
        let children = new Set();
        let replace;
        while (replace = search[0].match(/\$\[\d\]/)) {
            let expression = map.get(replace[0]);
            console.log(map);
            if (expression) {
                mapRemover.push(replace[0]);
                children.add(expression);
                search[0] = search[0].replace(replace[0], expression.code);
            }
        }
        // Variable 생성 : 먼저 생성된 Expression에 연결
        let position = search.index;
        let range = new vscode_1.Range(new vscode_1.Position(line, position), new vscode_1.Position(line, position + search[0].length + 1));
        let skExprVariable = new Context_1.SkriptExprVariable(range, search[0]);
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
//# sourceMappingURL=extension.js.map
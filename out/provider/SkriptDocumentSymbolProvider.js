"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SkriptDocumentSymbolProvider = void 0;
const vscode_1 = require("vscode");
const Skript = require("../Skript");
const Component_1 = require("../skript/Component");
const Context_1 = require("../skript/Context");
const SYMBOLS_MAP = new Map();
/**
 * ```Ctrl + Shift + O``` 단축키로 바로 갈 수 있는 기능
 * ```Ctrl + Shift + .``` 단축키로 바로 갈 수 있는 기능
 * 옵션, 별칭, 명령어, 이벤트, 함수, 변수 등을 반환한다.
 * ***
 * ActiveDocument를 변경할때 동작한다.
 * TextDocument의 변화가 생기면 동작한다.
 */
class SkriptDocumentSymbolProvider {
    provideDocumentSymbols(document /*token: CancellationToken*/) {
        let fsPath = document.uri.fsPath;
        if (!SYMBOLS_MAP.has(fsPath) || document.isDirty) {
            let symbols = new Array();
            SYMBOLS_MAP.set(fsPath, symbols);
            let skFile = Skript.findFile(fsPath);
            if (!skFile) {
                return symbols;
            }
            for (const comp of skFile.components) {
                // Component 심볼
                let compSymbol = new vscode_1.DocumentSymbol(comp.name, comp.detail, comp.symbol, comp.range, comp.range);
                if (comp instanceof Component_1.SkriptCommand) {
                    // Option 심볼
                    for (const option of comp.options) {
                        let optionSymbol = new vscode_1.DocumentSymbol(option.name, option.value, option.symbol, option.range, option.range);
                        compSymbol.children.push(optionSymbol);
                    }
                    // Trigger 심볼
                    let trigger = comp.trigger;
                    let triggerSymbol = new vscode_1.DocumentSymbol(trigger.name, '', trigger.symbol, trigger.range, trigger.range);
                    compSymbol.children.push(triggerSymbol);
                    // 중복등록 방지
                    let variableChecker = new Set();
                    let textChecker = new Set();
                    let functionChecker = new Set();
                    // Text 심볼
                    for (const text of trigger.texts) {
                        textChecker.add(text);
                        let textSymbol = this._createSymbol(text);
                        triggerSymbol.children.push(textSymbol);
                        for (const child of text.getChildren()) {
                            if (child instanceof Context_1.SkriptExprVariable) {
                                variableChecker.add(child);
                                let variableSymbol = this._createSymbol(child);
                                textSymbol.children.push(variableSymbol);
                            }
                            else if (child instanceof Context_1.SkriptExprFunction) {
                                functionChecker.add(child);
                                let functionSymbol = this._createSymbol(child);
                                textSymbol.children.push(functionSymbol);
                            }
                        }
                    }
                    // // function 심볼
                    // for (const func of trigger.functions) if (!functionChecker.has(func) {
                    //     functionChecker.add(func);
                    //     let functionSymbol = new DocumentSymbol(func.name, '', SymbolKind.Function, func.range, func.range);
                    //     triggerSymbol.children.push(functionSymbol);
                    //     for (const child of func.getChildren()) {
                    //         if (child instanceof SkriptExprText) {
                    //         }
                    //     }
                    // }
                    // Variable 심볼
                    for (const variable of trigger.variables)
                        if (!variableChecker.has(variable)) {
                            let variableSymbol = new vscode_1.DocumentSymbol(variable.code, '', vscode_1.SymbolKind.Variable, variable.range, variable.range);
                            triggerSymbol.children.push(variableSymbol);
                        }
                }
                symbols.push(compSymbol);
            }
            return symbols;
        }
        else {
            let response = SYMBOLS_MAP.get(fsPath);
            return response;
        }
    }
    _createSymbol(expr) {
        let symbol = vscode_1.SymbolKind.Null;
        if (expr instanceof Context_1.SkriptExprText) {
            symbol = vscode_1.SymbolKind.String;
        }
        else if (expr instanceof Context_1.SkriptExprVariable) {
            symbol = vscode_1.SymbolKind.Variable;
        }
        else if (expr instanceof Context_1.SkriptExprFunction) {
            symbol = vscode_1.SymbolKind.Function;
        }
        return new vscode_1.DocumentSymbol(expr.code, '', symbol, expr.range, expr.range);
    }
}
exports.SkriptDocumentSymbolProvider = SkriptDocumentSymbolProvider;
//# sourceMappingURL=SkriptDocumentSymbolProvider.js.map
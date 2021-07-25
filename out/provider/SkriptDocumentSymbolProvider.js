"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SkriptDocumentSymbolProvider = void 0;
const vscode_1 = require("vscode");
const Skript = require("../Skript");
const SkriptExpressions_1 = require("../skript/language/SkriptExpressions");
const SkriptComponent_1 = require("../skript/SkriptComponent");
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
            let symbols = [];
            SYMBOLS_MAP.set(fsPath, symbols);
            let skDocument = Skript.find(fsPath);
            if (!skDocument)
                return;
            // Aliases
            for (const skAliases of skDocument.getComponents(SkriptComponent_1.SkriptAliases)) {
                let aliasesSymbol = new vscode_1.DocumentSymbol(skAliases.title, '', skAliases.symbolKind, skAliases.range, skAliases.range);
                symbols.push(aliasesSymbol);
                for (const aliases of skAliases.aliases) {
                    let value = Object.assign(aliases.value, {}).map(v => v.replace('minecraft:', '')).join(', ');
                    let optionSymbol = new vscode_1.DocumentSymbol(aliases.key, value, vscode_1.SymbolKind.Enum, aliases.range, aliases.range);
                    aliasesSymbol.children.push(optionSymbol);
                }
            }
            // Options
            for (const skOptions of skDocument.getComponents(SkriptComponent_1.SkriptOptions)) {
                let optionsSymbol = new vscode_1.DocumentSymbol(skOptions.title, '', skOptions.symbolKind, skOptions.range, skOptions.range);
                symbols.push(optionsSymbol);
                for (const option of skOptions.options) {
                    let optionSymbol = new vscode_1.DocumentSymbol(option.key, option.value, vscode_1.SymbolKind.Enum, option.range, option.range);
                    optionsSymbol.children.push(optionSymbol);
                }
            }
            // Command
            for (const skCommand of skDocument.getComponents(SkriptComponent_1.SkriptCommand)) {
                let commandSymbol = new vscode_1.DocumentSymbol(skCommand.title, '', skCommand.symbolKind, skCommand.range, skCommand.range);
                symbols.push(commandSymbol);
                if (skCommand.options)
                    for (const option of skCommand.options) {
                        let optionSymbol = new vscode_1.DocumentSymbol(option.key, option.value, vscode_1.SymbolKind.Enum, option.range, option.range);
                        commandSymbol.children.push(optionSymbol);
                        if (option.key === 'trigger') {
                            optionSymbol.children.push(...this._createVariableSymbols(skCommand.paragraph.variables));
                        }
                    }
            }
            // Event
            for (const skEvent of skDocument.getComponents(SkriptComponent_1.SkriptEvent)) {
                let eventSymbol = new vscode_1.DocumentSymbol(skEvent.title, '', skEvent.symbolKind, skEvent.range, skEvent.range);
                eventSymbol.children.push(...this._createVariableSymbols(skEvent.paragraph.variables));
                symbols.push(eventSymbol);
            }
            // Function
            for (const skFunction of skDocument.getComponents(SkriptComponent_1.SkriptFunction)) {
                let functionSymbol = new vscode_1.DocumentSymbol(skFunction.title, '', skFunction.symbolKind, skFunction.range, skFunction.range);
                functionSymbol.children.push(...this._createVariableSymbols(skFunction.paragraph.variables));
                symbols.push(functionSymbol);
            }
            return symbols;
        }
        else {
            let response = SYMBOLS_MAP.get(fsPath);
            return response;
        }
    }
    _createVariableSymbols(skVariables) {
        let result = [];
        let maps = new Map();
        for (const variables of skVariables)
            for (const skVariable of this._getAllVariable(variables))
                if (skVariable.kind === SkriptExpressions_1.SkriptVariableKind.LOCAL) {
                    let value;
                    if (value = maps.get(skVariable.raw)) {
                        value.amount += 1;
                    }
                    else {
                        maps.set(skVariable.raw, { variable: skVariable, amount: 1 });
                    }
                }
        for (const key of maps.keys()) {
            let value = maps.get(key);
            let variable = value.variable;
            let amount = value.amount;
            let variableSymbol = new vscode_1.DocumentSymbol(key, `used ${amount} times`, vscode_1.SymbolKind.Variable, variable.range, variable.range);
            result.push(variableSymbol);
        }
        return result;
    }
    _getAllVariable(skVariable) {
        if (skVariable.child.length === 0) {
            return [skVariable];
        }
        else {
            let array = [];
            for (const child of skVariable.child) {
                array.push(skVariable, ...this._getAllVariable(child));
            }
            return array;
        }
    }
}
exports.SkriptDocumentSymbolProvider = SkriptDocumentSymbolProvider;
//# sourceMappingURL=SkriptDocumentSymbolProvider.js.map
import { DocumentSymbol, DocumentSymbolProvider, SymbolKind, TextDocument } from 'vscode';
import * as Skript from '../Skript';
import { SkriptVariable, SkriptVariableKind } from '../language/SkriptExpressions';
import { SkriptAliases, SkriptOptions, SkriptCommand, SkriptEvent, SkriptFunction } from '../SkriptComponent';

const SYMBOLS_MAP = new Map<string,DocumentSymbol[]>();

/**
 * ```Ctrl + Shift + O``` 단축키로 바로 갈 수 있는 기능  
 * ```Ctrl + Shift + .``` 단축키로 바로 갈 수 있는 기능  
 * 옵션, 별칭, 명령어, 이벤트, 함수, 변수 등을 반환한다.   
 * ***
 * ActiveDocument를 변경할때 동작한다.  
 * TextDocument의 변화가 생기면 동작한다.  
 */
export class SkriptDocumentSymbolProvider implements DocumentSymbolProvider {
    provideDocumentSymbols(document: TextDocument /*token: CancellationToken*/) {

        let fsPath = document.uri.fsPath;
        if (!SYMBOLS_MAP.has(fsPath) || document.isDirty) {

            let symbols: DocumentSymbol[] = [];
            SYMBOLS_MAP.set(fsPath, symbols);
        
            let skDocument = Skript.find(fsPath);
            if (!skDocument)
                return
            
            // Aliases
            for (const skAliases of skDocument.getComponents(SkriptAliases)) {
                let aliasesSymbol = new DocumentSymbol(skAliases.title, '', skAliases.symbolKind, skAliases.range, skAliases.range);
                symbols.push(aliasesSymbol);

                for (const aliases of skAliases.aliases) {
                    let value = Object.assign(aliases.value, {}).map(v => v.replace('minecraft:', '')).join(', ');
                    let optionSymbol = new DocumentSymbol(aliases.key, value, SymbolKind.Enum, aliases.range, aliases.range);
                    aliasesSymbol.children.push(optionSymbol);
                }

            }

            // Options
            for (const skOptions of skDocument.getComponents(SkriptOptions)) {
                let optionsSymbol = new DocumentSymbol(skOptions.title, '', skOptions.symbolKind, skOptions.range, skOptions.range);
                symbols.push(optionsSymbol);

                for (const option of skOptions.options) {
                    let optionSymbol = new DocumentSymbol(option.key, option.value, SymbolKind.Enum, option.range, option.range);
                    optionsSymbol.children.push(optionSymbol);
                }

            }

            // Command
            for (const skCommand of skDocument.getComponents(SkriptCommand)) {
                let commandSymbol = new DocumentSymbol(skCommand.title, '', skCommand.symbolKind, skCommand.range, skCommand.range);
                symbols.push(commandSymbol);

                if (skCommand.options) for (const option of skCommand.options) {
                    let optionSymbol = new DocumentSymbol(option.key, option.value, SymbolKind.Enum, option.range, option.range);
                    commandSymbol.children.push(optionSymbol);

                    if (option.key === 'trigger') {
                        optionSymbol.children.push(...this._createVariableSymbols(skCommand.paragraph.variables));
                    }
                }

            }

            // Event
            for (const skEvent of skDocument.getComponents(SkriptEvent)) {
                let eventSymbol = new DocumentSymbol(skEvent.title, '', skEvent.symbolKind, skEvent.range, skEvent.range);
                eventSymbol.children.push(...this._createVariableSymbols(skEvent.paragraph.variables));
                symbols.push(eventSymbol);
            }

            // Function
            for (const skFunction of skDocument.getComponents(SkriptFunction)) {
                let functionSymbol = new DocumentSymbol(skFunction.title, '', skFunction.symbolKind, skFunction.range, skFunction.range);
                functionSymbol.children.push(...this._createVariableSymbols(skFunction.paragraph.variables));
                symbols.push(functionSymbol);
            }
            
            return symbols;

        } else {
            let response = SYMBOLS_MAP.get(fsPath);
            return response;
        }
    }

    private _createVariableSymbols(skVariables:SkriptVariable[]): DocumentSymbol[] {
        let result: DocumentSymbol[] = [];
        let maps = new Map<string, {variable:SkriptVariable, amount: number}>();

        for (const variables of skVariables)
            for (const skVariable of this._getAllVariable(variables))
                if (skVariable.kind === SkriptVariableKind.LOCAL) {
            let value
            if (value = maps.get(skVariable.raw)) {
                value.amount += 1;
            } else {
                maps.set(skVariable.raw, {variable:skVariable, amount:1});
            }
        }

        for (const key of maps.keys()) {
            let value = maps.get(key)!
            let variable = value.variable;
            let amount = value.amount;
            let variableSymbol = new DocumentSymbol(key, `used ${amount} times`, SymbolKind.Variable, variable.range, variable.range);
            result.push(variableSymbol);
        }

        return result;
    }

    private _getAllVariable(skVariable:SkriptVariable): SkriptVariable[] {
        if (skVariable.child.length === 0) {
            return [skVariable]
        } else {
            let array: SkriptVariable[] = [];
            for (const child of skVariable.child) {
                array.push(skVariable, ...this._getAllVariable(child));
            }
            return array;
        }
    }

}
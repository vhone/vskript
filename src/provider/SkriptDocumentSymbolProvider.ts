import { DocumentSymbol, DocumentSymbolProvider, SymbolKind, TextDocument } from 'vscode';
import * as Skript from '../Skript';
import { SkriptCommand } from '../skript/Component';
import { SkriptExpression, SkriptExprFunction, SkriptExprText, SkriptExprVariable } from '../skript/Context';

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
            let symbols = new Array<DocumentSymbol>();
            SYMBOLS_MAP.set(fsPath, symbols);
        
            let skFile = Skript.findFile(fsPath);
            if (!skFile) {
                return symbols;
            }
        
            for (const comp of skFile.components) {

                // Component 심볼
                let compSymbol = new DocumentSymbol(comp.name, comp.detail!, comp.symbol, comp.range, comp.range);
                
                if (comp instanceof SkriptCommand) {

                    // Option 심볼
                    for (const option of comp.options) {
                        let optionSymbol = new DocumentSymbol(option.name, option.value, option.symbol, option.range, option.range);
                        compSymbol.children.push(optionSymbol);
                    }

                    // Trigger 심볼
                    let trigger = comp.trigger;
                    let triggerSymbol = new DocumentSymbol(trigger.name, '', trigger.symbol, trigger.range, trigger.range);
                    compSymbol.children.push(triggerSymbol);

                    // 중복등록 방지
                    let variableChecker = new Set<SkriptExprVariable>();
                    let textChecker = new Set<SkriptExprText>();
                    let functionChecker = new Set<SkriptExprFunction>();

                    // Text 심볼
                    for (const text of trigger.texts) {
                        textChecker.add(text);
                        let textSymbol = this._createSymbol(text);
                        triggerSymbol.children.push(textSymbol);

                        for (const child of text.getChildren()) {
                            if (child instanceof SkriptExprVariable) {
                                variableChecker.add(child);
                                let variableSymbol = this._createSymbol(child);
                                textSymbol.children.push(variableSymbol);
                            } else if (child instanceof SkriptExprFunction) {
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
                    for (const variable of trigger.variables) if (!variableChecker.has(variable)) {
                        let variableSymbol = new DocumentSymbol(variable.code, '', SymbolKind.Variable, variable.range, variable.range);
                        triggerSymbol.children.push(variableSymbol);
                    }

                }

                symbols.push(compSymbol);
                    
            }
            
            return symbols;

        } else {
            let response = SYMBOLS_MAP.get(fsPath);
            return response;
        }
    }

    private _createSymbol(expr:SkriptExpression): DocumentSymbol {
        let symbol = SymbolKind.Null;
        if (expr instanceof SkriptExprText) {
            symbol = SymbolKind.String;
        } else if (expr instanceof SkriptExprVariable) {
            symbol = SymbolKind.Variable;
        } else if (expr instanceof SkriptExprFunction) {
            symbol = SymbolKind.Function;
        }
        return new DocumentSymbol(expr.code, '', symbol, expr.range, expr.range);
    }
}
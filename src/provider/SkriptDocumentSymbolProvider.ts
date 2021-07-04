import { DocumentSymbol, DocumentSymbolProvider, SymbolKind, TextDocument } from 'vscode';
import * as Skript from '../Skript';
import { SkriptExpression, SkriptExprFunction, SkriptExprText, SkriptExprVariable } from '../skript/Context';
import { SkriptAliases, SkriptOptions, SkriptCommand } from '../skript_fork/SkriptParagraph';

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
        
            let skDocument = Skript.find(fsPath);
            if (!skDocument) {
                return symbols;
            }
        
            for (const paragraph of skDocument.paragraphs) {

                // Component 심볼
                let paragraphSymbol = new DocumentSymbol(paragraph.title, '', paragraph.symbolKind, paragraph.range, paragraph.range);
                
                if (paragraph instanceof SkriptAliases) {
                    for (const phrase of paragraph.phrases) {
                        let value = Object.assign(phrase.value, {}).map(v => v.replace('minecraft:', '')).join(', ');
                        let phraseSymbol = new DocumentSymbol(phrase.key, value, SymbolKind.Enum, phrase.range, phrase.range);
                        paragraphSymbol.children.push(phraseSymbol);
                    }

                } else if (paragraph instanceof SkriptOptions) {
                    for (const phrase of paragraph.phrases) {
                        let phraseSymbol = new DocumentSymbol(phrase.key, phrase.value, SymbolKind.Enum, phrase.range, phrase.range);
                        paragraphSymbol.children.push(phraseSymbol);
                        
                    }

                } else if (paragraph instanceof SkriptCommand) {
                    if (paragraph.options) {
                        for (const option of paragraph.options) {
                            let optionSymbol = new DocumentSymbol(option.key, option.value, SymbolKind.Property, option.range, option.range);
                            paragraphSymbol.children.push(optionSymbol);
                        }
                    }
                }

                symbols.push(paragraphSymbol);
                    
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
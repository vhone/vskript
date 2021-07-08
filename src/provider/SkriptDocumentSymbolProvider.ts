import { DocumentSymbol, DocumentSymbolProvider, SymbolKind, TextDocument } from 'vscode';
import * as Skript from '../Skript';
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

            let symbols: DocumentSymbol[] = [];
            SYMBOLS_MAP.set(fsPath, symbols);
        
            let skDocument = Skript.find(fsPath);
            if (!skDocument)
                return
        
            // Aliases
            for (const skAliases of skDocument.getParagraphs(SkriptAliases)) {
                let aliasesSymbol = new DocumentSymbol(skAliases.title, '', skAliases.symbolKind, skAliases.range, skAliases.range);
                symbols.push(aliasesSymbol);

                for (const aliases of skAliases.aliases) {
                    let value = Object.assign(aliases.value, {}).map(v => v.replace('minecraft:', '')).join(', ');
                    let optionSymbol = new DocumentSymbol(aliases.key, value, SymbolKind.Enum, aliases.range, aliases.range);
                    aliasesSymbol.children.push(optionSymbol);
                }

            }

            // Options
            for (const skOptions of skDocument.getParagraphs(SkriptOptions)) {
                let optionsSymbol = new DocumentSymbol(skOptions.title, '', skOptions.symbolKind, skOptions.range, skOptions.range);
                symbols.push(optionsSymbol);

                for (const option of skOptions.options) {
                    let optionSymbol = new DocumentSymbol(option.key, option.value, SymbolKind.Enum, option.range, option.range);
                    optionsSymbol.children.push(optionSymbol);
                }

            }

            // Command
            for (const skCommand of skDocument.getParagraphs(SkriptCommand)) {
                let commandSymbol = new DocumentSymbol(skCommand.title, '', skCommand.symbolKind, skCommand.range, skCommand.range);
                symbols.push(commandSymbol);

                if (skCommand.options) for (const option of skCommand.options) {
                    let optionSymbol = new DocumentSymbol(option.key, option.value, SymbolKind.Enum, option.range, option.range);
                    commandSymbol.children.push(optionSymbol);
                }

            }

            console.log(symbols);
            
            return symbols;

        } else {
            let response = SYMBOLS_MAP.get(fsPath);
            return response;
        }
    }

    // private _createSymbol(expr:SkriptExpression): DocumentSymbol {
    //     let symbol = SymbolKind.Null;
    //     if (expr instanceof SkriptExprText) {
    //         symbol = SymbolKind.String;
    //     } else if (expr instanceof SkriptExprVariable) {
    //         symbol = SymbolKind.Variable;
    //     } else if (expr instanceof SkriptExprFunction) {
    //         symbol = SymbolKind.Function;
    //     }
    //     return new DocumentSymbol(expr.code, '', symbol, expr.range, expr.range);
    // }

}
import { DocumentSymbol, DocumentSymbolProvider, SymbolKind, TextDocument } from 'vscode';
import * as Skript from '../Skript';
import { SkriptAliases, SkriptCommand, SkriptEvent, SkriptFunction, SkriptOptions } from '../skript/Component';
import { OptionType, SkriptCommandOptionTypes as SkriptCommandOptionType } from '../skript/component/SkriptCommand';

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
                let docSymbol = new DocumentSymbol(comp.name, '', comp.symbol, comp.range, comp.range);
                
                if (comp instanceof SkriptCommand) {
                    for (const type of SkriptCommandOptionType.values()) {
                        
                    }
                    comp.options.getOption()
                }

                symbols.push(docSymbol);
            }
            
            return symbols;

        } else {
            let response = SYMBOLS_MAP.get(fsPath);
            return response;
        }
    }
}
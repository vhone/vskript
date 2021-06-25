"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SkriptDocumentSymbolProvider = void 0;
const vscode_1 = require("vscode");
const Skript = require("../Skript");
const Component_1 = require("../skript/Component");
const SkriptCommand_1 = require("../skript/component/SkriptCommand");
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
                let docSymbol = new vscode_1.DocumentSymbol(comp.name, '', comp.symbol, comp.range, comp.range);
                if (comp instanceof Component_1.SkriptCommand) {
                    for (const type of SkriptCommand_1.SkriptCommandOptionTypes.values()) {
                    }
                    comp.options.getOption();
                }
                symbols.push(docSymbol);
            }
            return symbols;
        }
        else {
            let response = SYMBOLS_MAP.get(fsPath);
            return response;
        }
    }
}
exports.SkriptDocumentSymbolProvider = SkriptDocumentSymbolProvider;
//# sourceMappingURL=SkriptDocumentSymbolProvider.js.map
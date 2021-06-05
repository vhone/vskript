"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SkriptWorkspaceSymbolProvider = void 0;
const vscode_1 = require("vscode");
const Skript = require("../Skript");
/**
 * ```Ctrl + T``` 단축키로 바로 갈 수 있는 기능
 */
class SkriptWorkspaceSymbolProvider {
    provideWorkspaceSymbols(query, _token) {
        let results = new Array();
        for (const skFile of Skript.getFileList()) {
            for (const comp of skFile.components)
                if (comp.name.includes(query)) {
                    let uri = vscode_1.Uri.file(skFile.fsPath);
                    let location = new vscode_1.Location(uri, comp.range);
                    results.push(new vscode_1.SymbolInformation(comp.name, comp.symbol, skFile.skName, location));
                }
        }
        console.log(results);
        return results;
    }
}
exports.SkriptWorkspaceSymbolProvider = SkriptWorkspaceSymbolProvider;
//# sourceMappingURL=SkriptWorkspaceSymbolProvider.js.map
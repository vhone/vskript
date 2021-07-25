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
        Skript.DOCUMENTS.forEach(skDocument => {
            for (const component of skDocument.components)
                if (!component.isInvisible && component.title.includes(query)) {
                    let uri = vscode_1.Uri.file(skDocument.skPath.fsPath);
                    let location = new vscode_1.Location(uri, component.range);
                    results.push(new vscode_1.SymbolInformation(component.title, component.symbolKind, skDocument.skPath.name, location));
                }
        });
        return results;
    }
}
exports.SkriptWorkspaceSymbolProvider = SkriptWorkspaceSymbolProvider;
//# sourceMappingURL=SkriptWorkspaceSymbolProvider.js.map
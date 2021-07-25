"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SkriptDefinitionProvider = void 0;
const vscode_1 = require("vscode");
const Skript = require("../Skript");
const SkriptComponent_1 = require("../skript/SkriptComponent");
/** 바로가기 */
class SkriptDefinitionProvider {
    provideDefinition(document, position, _token) {
        let range = document.getWordRangeAtPosition(position);
        if (range) {
            let funcName = document.getText(range);
            for (const skDocument of Skript.DOCUMENTS) {
                for (const comp of skDocument.components)
                    if (comp instanceof SkriptComponent_1.SkriptFunction && comp.name === funcName) {
                        let uri = vscode_1.Uri.file(skDocument.skPath.fsPath);
                        let location = new vscode_1.Location(uri, comp.range);
                        return location;
                    }
            }
        }
        return [];
    }
}
exports.SkriptDefinitionProvider = SkriptDefinitionProvider;
//# sourceMappingURL=SkriptDefinitionProvider.js.map
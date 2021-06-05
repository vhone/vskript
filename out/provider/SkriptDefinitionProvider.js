"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SkriptDefinitionProvider = void 0;
const vscode_1 = require("vscode");
const Skript = require("../Skript");
const Component_1 = require("../skript/Component");
/** 바로가기 */
class SkriptDefinitionProvider {
    provideDefinition(document, position, _token) {
        // console.log('SkriptDefinitionProvider');
        let range = document.getWordRangeAtPosition(position);
        if (range) {
            let funcName = document.getText(range);
            for (const skFile of Skript.getFileList()) {
                for (const comp of skFile.components)
                    if (comp instanceof Component_1.SkriptFunction && comp.name === funcName) {
                        let uri = vscode_1.Uri.file(skFile.fsPath);
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
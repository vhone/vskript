"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SkriptHoverProvider = void 0;
const vscode_1 = require("vscode");
const Skript = require("../Skript");
const SkriptComponent_1 = require("../skript/SkriptComponent");
class SkriptHoverProvider {
    provideHover(document, position /*token: CancellationToken*/) {
        let lineText = document.lineAt(position.line).text;
        // Function
        let skFunctions = [];
        Skript.DOCUMENTS.forEach(skDocument => skFunctions.push(...skDocument.getComponents(SkriptComponent_1.SkriptFunction)));
        for (const skFunction of skFunctions) {
            let markdown = (skFunction.tooltip) ? skFunction.tooltip.markdown : new vscode_1.MarkdownString();
            let hover = this._createHover(lineText, position, skFunction.name, markdown);
            if (hover)
                return hover;
        }
        // Options
        let skDocument = Skript.find(document.uri.fsPath);
        for (const skOptions of skDocument.getComponents(SkriptComponent_1.SkriptOptions)) {
            for (const option of skOptions.options) {
                let hover = this._createHover(lineText, position, `{@${option.key}}`, new vscode_1.MarkdownString().appendCodeblock(option.value, 'vskript'));
                if (hover)
                    return hover;
            }
        }
        // Aliases
        for (const skAliases of skDocument.getComponents(SkriptComponent_1.SkriptAliases)) {
            for (const alias of skAliases.aliases) {
                let hover = this._createHover(lineText, position, alias.key, new vscode_1.MarkdownString().appendCodeblock(alias.value.join('\r\n')));
                if (hover)
                    return hover;
            }
        }
        return;
    }
    _createHover(lineText, position, searchString, markdownString) {
        let length = searchString.length;
        let index = lineText.indexOf(searchString, 0);
        while (index >= 0) {
            if (index <= position.character && position.character < index + length) {
                return new vscode_1.Hover(markdownString, new vscode_1.Range(new vscode_1.Position(position.line, index), new vscode_1.Position(position.line, index + length)));
            }
            index = lineText.indexOf(searchString, index + length);
        }
        return undefined;
    }
}
exports.SkriptHoverProvider = SkriptHoverProvider;
//# sourceMappingURL=SkriptHoverProvider.js.map
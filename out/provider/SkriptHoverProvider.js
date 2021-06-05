"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SkriptHoverProvider = void 0;
const vscode_1 = require("vscode");
const Skript = require("../Skript");
const Component_1 = require("../skript/Component");
class SkriptHoverProvider {
    provideHover(document, position /*token: CancellationToken*/) {
        // let range = document.getWordRangeAtPosition(position);
        // if (!range)
        //     return;
        // let text = document.getText(range);
        // let strings = new Array<MarkdownString>();
        // for(const skFile of Skript.getFileList()) {
        //     for (const skFunc of skFile.functions) if (skFunc.name === text) {
        //         strings.push(skFunc.markdown, new MarkdownString('from ```' + skFile.skName + '```'));
        //     }
        // }
        // return new Hover(strings);
        let lineText = document.lineAt(position.line).text;
        for (const skFile of Skript.getFileList()) {
            let docThis = skFile.fsPath === document.uri.fsPath;
            for (const comp of skFile.components) {
                let hover = null;
                if (comp instanceof Component_1.SkriptFunction) {
                    hover = this.createHover(lineText, position, comp.name, comp.markdown);
                    if (hover)
                        return hover;
                }
                if (docThis) {
                    if (comp instanceof Component_1.SkriptOption) {
                        for (const variable of comp.variables) {
                            hover = this.createHover(lineText, position, `{@${variable[0]}}`, new vscode_1.MarkdownString().appendCodeblock(variable[1], 'vskript'));
                            if (hover)
                                return hover;
                        }
                    }
                    else if (comp instanceof Component_1.SkriptAlias) {
                        for (const itemtype of comp.itemtypes) {
                            let hover = this.createHover(lineText, position, itemtype[0], new vscode_1.MarkdownString().appendCodeblock(itemtype[1].join('\r\n')));
                            if (hover)
                                return hover;
                        }
                    }
                }
            }
        }
        return;
    }
    createHover(lineText, position, searchString, markdownString) {
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
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SkriptCompletionItemProvider = void 0;
const vscode_1 = require("vscode");
const Skript = require("../Skript");
const Component_1 = require("../skript/Component");
const ITEMS_MAP = new Map();
/**
 * ```Ctrl + space``` 단축키로 completion을 연다.
 * ***
 * completion을 열 때 동작한다.
 * resolveCompletionItem는 목록을 스크롤할 때 동작한다.
 */
class SkriptCompletionItemProvider {
    provideCompletionItems(document /*position: Position, token: CancellationToken, context: CompletionContext*/) {
        let fsPath = document.uri.fsPath;
        if (ITEMS_MAP.size === 0) {
            for (let skFile of Skript.getFileList()) {
                this.updateFunctionCompletionItem(skFile);
            }
        }
        else if (!ITEMS_MAP.has(fsPath) || document.isDirty) {
            this.updateFunctionCompletionItem(Skript.findFile(fsPath));
        }
        let response = new Array();
        for (let key of ITEMS_MAP.keys()) {
            for (let items of ITEMS_MAP.get(key)) {
                response.push(items);
            }
        }
        return response;
    }
    updateFunctionCompletionItem(skFile) {
        let items = this.createCompletionItemsInFile(skFile);
        ITEMS_MAP.set(skFile.fsPath, items);
        return items;
    }
    createCompletionItemsInFile(skFile) {
        let items = new Array();
        for (let comp of skFile.components)
            if (comp instanceof Component_1.SkriptFunction) {
                // item
                let item = new vscode_1.CompletionItem(comp.name, vscode_1.CompletionItemKind.Function);
                item.detail = skFile.skName;
                // insert
                let paramList = new Array();
                let i = 1;
                for (const p of comp.parameters) {
                    let param = '${' + i++ + '|\{_' + p.name + '\}|}';
                    paramList.push(param);
                }
                item.insertText = new vscode_1.SnippetString(comp.name + '( ' + paramList.join(', ') + ' )');
                // docs
                // let docs = new Array<string>();
                // if (comp.docs) {
                //     for (const info of comp.docs!)
                //         docs.push(info.replace(/(^|\b)(\@\w*)($|\b)/i, '_$2_'));
                //     docs.push('***');
                // }
                // docs.push(skFile.skName!);
                // item.documentation = new MarkdownString(docs.join('  \r\n'));
                item.documentation = comp.markdown;
                items.push(item);
            }
        return items;
    }
}
exports.SkriptCompletionItemProvider = SkriptCompletionItemProvider;
//# sourceMappingURL=SkriptCompletionItemProvider.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SkriptCompletionItemProvider = void 0;
const vscode_1 = require("vscode");
const Skript = require("../Skript");
const SkriptComponent_1 = require("../skript/SkriptComponent");
const Materials_1 = require("../skript/language/Materials");
const ITEMS_MAP = new Map();
const Components = (() => {
    let list = new Array();
    [{ isKeyword: true, name: 'aliases', snippet: 'aliases:\r\n\t' },
        { isKeyword: true, name: 'options', snippet: 'options:\r\n\t' },
        { isKeyword: true, name: 'command', snippet: 'command /${1:label} ${2:arguments}:\r\n\ttrigger:\r\n\t\t' },
        { isKeyword: true, name: 'function', snippet: 'function ${1:name}(${2:parameters}) :: ${3:return type}:\r\n\t' },
        { isKeyword: false, name: 'function void', snippet: 'function ${1:name}(${2:parameters}):\r\n\t' }
    ].forEach(value => {
        if (value.isKeyword)
            list.push(new vscode_1.CompletionItem(value.name, vscode_1.CompletionItemKind.Keyword));
        let snippet = new vscode_1.CompletionItem(value.name, vscode_1.CompletionItemKind.Snippet);
        snippet.insertText = new vscode_1.SnippetString(value.snippet);
        list.push(snippet);
    });
    return list;
})();
const CMD_Options = (() => {
    let list = new Array();
    [{ name: 'aliases', snippet: 'aliases: ' },
        { name: 'description', snippet: 'description: ' },
        { name: 'usage', snippet: 'usage: ' },
        { name: 'permission', snippet: 'permission: ' },
        { name: 'permission message', snippet: 'permission message: ' },
        { name: 'executable by', snippet: 'executable by: ' },
        { name: 'cooldown', snippet: 'cooldown: ' },
        { name: 'cooldown message', snippet: 'cooldown message: ' },
        { name: 'cooldown bypass', snippet: 'cooldown bypass: ' },
        { name: 'cooldown storage', snippet: 'cooldown storage: ' },
        { name: 'trigger', snippet: 'trigger: ' }
    ].forEach(value => {
        let snippet = new vscode_1.CompletionItem(value.name, vscode_1.CompletionItemKind.Property);
        snippet.insertText = new vscode_1.SnippetString(value.snippet);
        list.push(snippet);
    });
    return list;
})();
/**
 * ```Ctrl + space``` 단축키로 completion을 연다.
 * ***
 * completion을 열 때 동작한다.
 * resolveCompletionItem는 목록을 스크롤할 때 동작한다.
 */
class SkriptCompletionItemProvider {
    provideCompletionItems(document, position, _token, _context) {
        let result = new Array();
        let line = document.lineAt(position.line);
        let range = document.getWordRangeAtPosition(position);
        let word = (range) ? document.getText(range) : undefined;
        let skDocument = Skript.find(document.uri.fsPath);
        // 첫 입력 (keyword)
        if (!skDocument.componentOf(position) && (line.text === '' || line.text.indexOf(word) === 0)) {
            return Components;
        }
        // 메터리얼 입력
        let matrial_range = document.getWordRangeAtPosition(position, /minecraft:\w*/i);
        let matrial_word = (matrial_range) ? document.getText(matrial_range) : undefined;
        if (matrial_word) {
            for (const mat of Materials_1.Materials) {
                result.push(new vscode_1.CompletionItem(mat.toLowerCase(), vscode_1.CompletionItemKind.Enum));
            }
        }
        // Component
        let subText = line.text.substring(0, position.character);
        let skComponent = skDocument.componentOf(position, { isBefore: true });
        if (skComponent) {
            // Command Options
            if (skComponent instanceof SkriptComponent_1.SkriptCommand
                && subText.match(/^(\t|\s{4})($|[^\t\s\:]*$)/)) {
                let items = Object.assign(CMD_Options, {});
                if (skComponent.options)
                    for (const option of skComponent.options) {
                        items = items.filter(v => v.label !== option.key);
                    }
                result.push(...items);
                // return items;
            }
            // Grobal Functions
            if (skComponent instanceof SkriptComponent_1.SkriptParagraphComponent && skComponent.paragraph.range.contains(position)) {
                for (const skDocs of Skript.DOCUMENTS) {
                    let isThis = skDocs === skDocument;
                    for (const skFunc of skDocs.getComponents(SkriptComponent_1.SkriptFunction))
                        if (!skFunc.isInvisible || isThis) {
                            let item = new vscode_1.CompletionItem(skFunc.name, vscode_1.CompletionItemKind.Function);
                            item.detail = skDocs.skPath.name;
                            if (skFunc.tooltip)
                                item.documentation = skFunc.tooltip.markdown;
                            let parameters = [];
                            if (skFunc.parameters)
                                for (const skParam of skFunc.parameters) {
                                    let i = parameters.length + 1;
                                    if (skParam.type.isList) {
                                        parameters.push(`\${${i}:{_${skParam.name}::*\\\}}`);
                                    }
                                    else {
                                        parameters.push(`\${${i}:{_${skParam.name}\\\}}`);
                                    }
                                }
                            item.insertText = new vscode_1.SnippetString(`${skFunc.name}( ${parameters.join(', ')} )`);
                            result.push(item);
                        }
                }
            }
        }
        return result;
    } /*,

    resolveCompletionItem(item: CompletionItem, token: CancellationToken): CompletionItem {
        return item;
    }*/
}
exports.SkriptCompletionItemProvider = SkriptCompletionItemProvider;
//# sourceMappingURL=SkriptCompletionItemProvider.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_1 = require("vscode");
const Skript = require("../Skript");
const SkriptComponent_1 = require("../skript/SkriptComponent");
let pass = false;
/**
 * Docs 생성 스니펫
 */
function TextDocumentChangeEvent(event) {
    let document = event.document;
    let changes = event.contentChanges;
    if (changes.length < 0)
        return;
    // 입력 후 파일 업데이트
    let skDocument = Skript.find(document.uri.fsPath);
    skDocument.update(document.getText());
    for (const context of changes) {
        let text = context.text;
        // 개행 입력
        if (text.match(/^(\r\n|\r|\n)(\t|\s)*$/i)) {
            inputEnter(context, document);
        }
    }
}
exports.default = TextDocumentChangeEvent;
function inputEnter(context, document) {
    var _a;
    // docs 기호 선입력 확인
    let i = context.range.start.line;
    let line = document.lineAt(i).text;
    let groups = (_a = line.match(/^(?<space>(\t|\s)*)(?<prefix>\#\>\>?)(\s)?(.*)?$/i)) === null || _a === void 0 ? void 0 : _a.groups;
    if (groups) {
        let editor = vscode_1.window.activeTextEditor;
        if (!editor)
            return;
        let prefix = groups.prefix;
        // '#>>'
        if (prefix === '#>>') {
            // remove input
            editor.edit(builder => { builder.delete(new vscode_1.Range(document.lineAt(i).range.start, document.lineAt(i + 1).range.end)); });
            let skDocument = Skript.find(document.uri.fsPath);
            let skFunction = skDocument.componentOf(context.range.start, { isAfter: true });
            if (!skFunction || !(skFunction instanceof SkriptComponent_1.SkriptFunction))
                return;
            let docs = new Array();
            let j = 1;
            if (skFunction.parameters)
                for (const param of skFunction.parameters)
                    docs.push(`#> @param ${param.name} \${${j++}}`);
            if (skFunction.returnType)
                docs.push(`#> @return \${${j++}}`);
            docs.unshift(`#> \${${j}}`);
            editor.insertSnippet(new vscode_1.SnippetString(docs.join('\r\n')), context.range);
            // '#>'
        }
        else if (prefix === '#>') {
            editor.edit(builder => {
                builder.insert(new vscode_1.Position(i + 1, groups.space.length), '#> ');
            });
        }
        // ==========================================
        /* 컴포넌트에 따른 DOCS 샘플 및 어노테이션
         *
         * DOCS
         * @param - docs 파라메터
         * @return - docs 리턴
         *
         * 어노테이션
         * @Search(false) 서칭 제외 - WorkspaceSymbolProvider
         * @Complete(false) 자동완성 제외 - CompletionItemProvider
         * @options(search=false,complete=false)
         *
         * 시매틱 구문강조 프로바이더 검색해볼것.
         */
        // ==========================================
    }
}
//# sourceMappingURL=TextDocumentChangeEvent.js.map
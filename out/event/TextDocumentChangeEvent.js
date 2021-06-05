"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_1 = require("vscode");
const Skript = require("../Skript");
let pass = false;
/**
 * Docs 생성 스니펫
 */
function TextDocumentChangeEvent(event) {
    var _a;
    let document = event.document;
    let changes = event.contentChanges;
    if (changes.length > 0) {
        // console.log('TextDocumentChangeEvent: '+ document.isDirty);
        (_a = Skript.findFile(document.uri.fsPath)) === null || _a === void 0 ? void 0 : _a.update(document.getText());
    }
    for (const context of event.contentChanges) {
        let text = context.text;
        // 개행 입력
        // console.log('start');
        if (text.match(/^(\r\n|\r|\n)(\t|\s)*$/i)) {
            inputEnter(context, document);
            // 오른 꺽쇠> 입력
        }
        else if (text.match(/^\>$/i)) {
            inputRightAngleBraket(context, document);
        }
        // console.log('end');
    }
    // event.contentChanges.forEach(context => {
    // });
}
exports.default = TextDocumentChangeEvent;
/**
 *
 * @param fsPath FileSystem Path
 * @param i
 * @returns
 */
function findSkriptFunction(fsPath, loc) {
    let skFile = Skript.findFile(fsPath);
    if (!skFile)
        return;
    // skFile.update();
    let skFunc;
    let i = loc.line;
    // for (let func of skFile.functions) {
    for (let comp of skFile.components)
        if (comp instanceof Skript.Component.SkriptFunction) {
            if (i < comp.range.start.line) {
                skFunc = comp;
                break;
            }
        }
    return skFunc;
}
function inputEnter(context, document) {
    // docs 기호 선입력 확인
    let i = context.range.start.line;
    let line = document.lineAt(i).text;
    // let docs = document.getText();
    // console.log(document.eol);
    // let eol = (document.eol. === 1) ? '\r' : '\r\n';
    let match = line.match(/^((\t|\s)*)(\#\>)(\s)?(.*)?$/i);
    if (match) {
        // 함수 선언부 탐색
        let skFunc = findSkriptFunction(document.uri.fsPath, context.range.start);
        if (!skFunc)
            return;
        // 입력값 제거
        let editor = vscode_1.window.activeTextEditor;
        if (!editor)
            return;
        editor.edit(edit => {
            // console.log('에딧1');
            let range = new vscode_1.Range(new vscode_1.Position(i, line.length), new vscode_1.Position(i + 1, document.lineAt(i + 1).text.length));
            // console.log(range);
            edit.delete(range);
        });
        // docs 생성
        let space = (match[1]) ? match[1] : '';
        let key = ['#>', ` DOCS`];
        if (line.substr(context.range.end.character - key[0].length, key[0].length) === key[0]
            && document.lineAt(i + 1).text.substr(space.length, key[1].length) === key[1]) {
            // docs 생성
            let insert = new Array();
            let j = 1;
            for (const param of skFunc.parameters)
                insert.push(`#> @parm ${param.name} \${${j++}}`);
            if (skFunc.type)
                insert.push(`#> @return \${${j++}}`);
            insert.unshift(` \${${j}:${skFunc.name}}`);
            editor.insertSnippet(new vscode_1.SnippetString(insert.join('\r\n')), context.range, { undoStopAfter: true, undoStopBefore: false });
            // console.log('에딧2');
        }
        else {
            editor.insertSnippet(new vscode_1.SnippetString('\r\n' + '#> '), context.range, { undoStopAfter: true, undoStopBefore: false });
            // console.log('에딧3');
        }
    }
}
function inputRightAngleBraket(context, document) {
    // docs 기호 선입력 확인
    let editor = vscode_1.window.activeTextEditor;
    if (!editor)
        return;
    let anchor = editor.selection.anchor;
    let i = context.range.start.line;
    let line = document.lineAt(i).text;
    if (line.charAt(anchor.character - 1) !== '#')
        return;
    // docs 생성키 추가
    let position = new vscode_1.Position(i, context.range.end.character + 1);
    editor.insertSnippet(new vscode_1.SnippetString(' DOCS'), position, { undoStopAfter: true, undoStopBefore: false });
    editor.selections = [new vscode_1.Selection(position, position)];
}
//# sourceMappingURL=TextDocumentChangeEvent.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findFile = exports.getFileList = exports.onSkriptEnable = exports.Component = void 0;
const vscode_1 = require("vscode");
const fs_1 = require("fs");
const path_1 = require("path");
const SkriptFile_1 = require("./skript/SkriptFile");
const Component_1 = require("./skript/Component");
exports.Component = require("./skript/Component");
const FILE_LIST = new Array();
/** 스크립트 실행 */
function onSkriptEnable() {
    let amtFunc = 0;
    let folders = vscode_1.workspace.workspaceFolders;
    if (folders) {
        for (const iter of folders) {
            let skPath = iter.uri.fsPath;
            for (let fsPath of getSkriptPathArray(skPath)) {
                let skName = fsPath.replace(skPath + '\\', '');
                let skFile = new SkriptFile_1.default(fs_1.readFileSync(fsPath, 'UTF-8'), skPath, skName, vscode_1.EndOfLine.CRLF);
                FILE_LIST.push(skFile);
                amtFunc += skFile.components.filter(comp => comp instanceof Component_1.SkriptFunction).length;
            }
        }
    }
    if (amtFunc > 0)
        vscode_1.window.showInformationMessage(`Loaded ${amtFunc} functions.`);
    if (FILE_LIST.length > 0)
        vscode_1.window.showInformationMessage(`Loaded ${FILE_LIST.length} skript files.`);
}
exports.onSkriptEnable = onSkriptEnable;
/** 모든 SkriptFile 반환 */
function getFileList() {
    return FILE_LIST;
}
exports.getFileList = getFileList;
/** 경로와 같은 SkriptFile이 있으면 반환 */
function findFile(fsPath) {
    for (const file of FILE_LIST)
        if (file.fsPath === fsPath)
            return file;
    return;
}
exports.findFile = findFile;
/** path의 하위경로를 포함한 모든 skript path 받아오기 */
function getSkriptPathArray(path) {
    let skPathArray = new Array();
    fs_1.readdirSync(path, { withFileTypes: true }).forEach((file) => {
        if (file.name.charAt(0) == '-')
            return;
        let dir = path_1.join(path, file.name);
        if (file.isDirectory()) {
            for (const iter of getSkriptPathArray(dir)) {
                skPathArray.push(iter);
            }
        }
        else if (path_1.extname(file.name) == '.sk') {
            skPathArray.push(dir);
        }
    });
    return skPathArray;
}
//# sourceMappingURL=Skript.js.map
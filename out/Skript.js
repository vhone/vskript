"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.find = exports.onSkriptEnable = exports.DOCUMENTS = void 0;
const vscode_1 = require("vscode");
const FileSystem = require("fs");
const Path = require("path");
const SkriptDocument_1 = require("./skript/SkriptDocument");
const WORKSAPCE_FATH = vscode_1.workspace.workspaceFolders;
exports.DOCUMENTS = new Array();
/** 스크립트 실행 */
function onSkriptEnable() {
    return __awaiter(this, void 0, void 0, function* () {
        if (WORKSAPCE_FATH) {
            // let amtFunc: number = 0;
            for (const path of WORKSAPCE_FATH) {
                let rootPath = new SkriptDocument_1.SkriptPath(path.uri.fsPath, '');
                for (let skPath of yield _getSkriptPaths(rootPath)) {
                    let document = FileSystem.readFileSync(skPath.fsPath, { encoding: 'UTF-8' });
                    let skDocument = new SkriptDocument_1.SkriptDocument(skPath, document);
                    exports.DOCUMENTS.push(skDocument);
                }
                ;
            }
            // window.showInformationMessage(`Loaded ${amtFunc} functions.`);
            // window.showInformationMessage(`Loaded ${FILE_LIST.length} skript files.`);
            vscode_1.window.showInformationMessage(`Loaded ${exports.DOCUMENTS.length} skript files.`);
        }
    });
}
exports.onSkriptEnable = onSkriptEnable;
/** 경로와 같은 SkriptFile이 있으면 반환 */
function find(fsPath) {
    for (const document of exports.DOCUMENTS)
        if (document.skPath.fsPath === fsPath) {
            return document;
        }
    return;
}
exports.find = find;
/** 하위경로 받아오기 */
function _getSkriptPaths(loopPath) {
    return __awaiter(this, void 0, void 0, function* () {
        let skPathArray = new Array();
        for (const file of FileSystem.readdirSync(loopPath.fsPath, { encoding: 'UTF-8', withFileTypes: true })) {
            let skPath = new SkriptDocument_1.SkriptPath(loopPath.root, Path.join(loopPath.name, file.name));
            if (file.name.charAt(0) === '-') {
                continue;
            }
            if (file.isDirectory()) {
                skPathArray.push(...yield _getSkriptPaths(skPath));
            }
            else if (Path.extname(file.name) === '.sk') {
                skPathArray.push(skPath);
            }
        }
        ;
        return new Promise((resolve) => {
            resolve(skPathArray);
        });
    });
}
//# sourceMappingURL=Skript.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = require("path");
const vscode_1 = require("vscode");
const Component_1 = require("./Component");
/**
 * 작업영역으로부터 포함된 sk파일을 모두 읽어서 객체를 생성함
 */
class SkriptFile {
    constructor(_document, _skDir, _skName, eol) {
        this._document = _document;
        this._skDir = _skDir;
        this._skName = _skName;
        this._lineIndexs = [];
        this._components = new Array();
        this._fsPath = path_1.join(this._skDir, this._skName);
        this._eol = (eol === vscode_1.EndOfLine.LF) ? '\n' : '\r\n';
        this._updateLineIndexArray();
        this.update(this._document);
    }
    get fsPath() {
        return this._fsPath;
    }
    get skDir() {
        return this._skDir;
    }
    get skName() {
        return this._skName;
    }
    get eol() {
        return this._eol;
    }
    get document() {
        return this._document;
    }
    get components() {
        return this._components;
    }
    update(document) {
        this._document = document;
        this._updateLineIndexArray();
        this._components.length = 0;
        let elements = this._document.match(/^[a-zA-Z].*((\r\n|\r|\n)([^a-zA-Z][^\r\n]*)?)+/igm);
        if (elements)
            for (let element of elements) {
                element = this._trim(element);
                if (this._registerComponent(element, new Component_1.SkriptOptionsBuilder(this)))
                    continue;
                if (this._registerComponent(element, new Component_1.SkriptAliasesBuilder(this)))
                    continue;
                if (this._registerComponent(element, new Component_1.SkriptCommandBuilder(this)))
                    continue;
                if (this._registerComponent(element, new Component_1.SkriptEventBuilder(this)))
                    continue;
                if (this._registerComponent(element, new Component_1.SkriptFunctionBuilder(this)))
                    continue;
            }
    }
    /** Range에 해당하는 문자열 반환 */
    getText(range) {
        if (!range) {
            return this._document;
        }
        else {
            return this._document.substring(this.offsetAt(range.start), this.offsetAt(range.end));
        }
    }
    /** 글자에 해당하는 첫번째 범위 반환 */
    getRange(element) {
        let index = this._document.indexOf(element);
        let start = this.positionAt(index);
        let end = this.positionAt(index + element.length);
        return new vscode_1.Range(start, end);
    }
    /** 글자에 해당하는 모든 범위 반환 */
    getRanges(text) {
        let rages = new Array();
        let position = 0;
        do {
            let index = this._document.indexOf(text, position);
            let start = this.positionAt(index);
            let end = this.positionAt(index + text.length);
            rages.push(new vscode_1.Range(start, end));
            position = index + 1;
        } while (position > 0);
        return rages;
    }
    // /** 위치에 해당하는 패턴 타입 반환 */
    // public getPatternType(pos:Position): PatternType {
    // }
    /** Position을 Offset으로 반환 */
    offsetAt(position) {
        return this._lineIndexs[position.line] + position.character;
    }
    /** offset 값으로 Position을 반환 */
    positionAt(offset) {
        let size = this._lineIndexs.length;
        let length = this._lineIndexs[size - 1];
        let line = 0;
        offset = (offset < 0) ? 0 : (offset > length) ? length : offset;
        for (let i = 0; i < size; i++)
            if (offset < this._lineIndexs[i]) {
                line = i - 1;
                break;
            }
        return new vscode_1.Position(line, offset - this._lineIndexs[line]);
    }
    /** Positon에 맞는 요소를 반환 */
    componentOf(pos) {
        for (let i = 0; i < this._components.length; i++) {
            let comp = this._components[i];
            if (comp.range.contains(pos)) {
                return comp;
            }
            else if (pos.isBeforeOrEqual(comp.range.start)) {
                return;
            }
        }
        return;
    }
    /** 좌, 우 여백 제거 */
    _trim(element) {
        let split = element.split(/\r\n|\r|\n/i);
        for (let i = split.length - 1; i >= 0; i--) {
            if (split[i].match(/^((\t|\s)*(\#.*)?)?$/i))
                split.splice(i, 1);
            else
                break;
        }
        return split.join('\r\n');
    }
    /** 글줄 위치값을 세팅 */
    _updateLineIndexArray() {
        this._lineIndexs.length = 0;
        this._lineIndexs.push(0);
        let index = 0;
        for (let line of this._document.split(this._eol)) {
            index += line.length + this.eol.length;
            this._lineIndexs.push(index);
        }
    }
    /** 컴포넌트 생성 */
    _registerComponent(element, builder) {
        var _a;
        let groups = (_a = element.match(builder.regExp())) === null || _a === void 0 ? void 0 : _a.groups;
        if (!groups)
            return false;
        let range = this.getRange(element);
        let docs = (this._components.length === 0)
            ? this.getText(new vscode_1.Range(this.positionAt(0), range.start)).trim()
            : this.getText(new vscode_1.Range(this._components[this._components.length - 1].range.end, range.start)).trim();
        let skComp = builder.setRange(range).setDocs(docs).setHead(groups.head).setBody(groups.body).build();
        if (skComp) {
            this._components.push(skComp);
        }
        return true;
    }
}
exports.default = SkriptFile;
//# sourceMappingURL=SkriptFile.js.map
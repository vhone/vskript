"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SkriptFunctionBuilder = exports.SkriptFunction = void 0;
const vscode_1 = require("vscode");
const SkriptComponent_1 = require("./SkriptComponent");
/**
 * SkriptFile 생성시 검색된 함수를 객체로 생성함.
 *  - name = 펑션 이름
 *  - parameters = 인수들
 *    - 변수명
 *    - 타입
 *  - type = 반환 타입
 *
 *  - discription = 설명
 *    - 함수 설명
 *    - 파라메터 설명
 */
class SkriptFunction extends SkriptComponent_1.SkriptComponent {
    constructor(_skFile, _range, _docs, _name, _parameters, _type, _body) {
        super(_skFile, _range, _docs, _name);
        this._parameters = _parameters;
        this._type = _type;
        this._body = _body;
    }
    get parameters() {
        return Object.assign(this._parameters, {});
    }
    get type() {
        return this._type;
    }
    get body() {
        return this._body;
    }
    get symbol() {
        return vscode_1.SymbolKind.Function;
    }
    get markdown() {
        if (!this._markdown) {
            let docs = new Array();
            let regex_parm = /(\@parm)\s(\w*)\s(.*)/g;
            let regex_return = /(\@return)\s(.*)/g;
            for (const str of this._docs)
                docs.push(str
                    .replace(regex_parm, '_$1_ ```$2``` ─ $3')
                    .replace(regex_return, '_$1_ ─ $2'));
            this._markdown = new vscode_1.MarkdownString('', true)
                .appendCodeblock('function ' + this.toDeclaration(), 'vskript');
            if (docs.length > 0) {
                docs.unshift('***');
                docs.push('');
                this._markdown.appendMarkdown(docs.join('  \r\n'));
            }
            this._markdown.appendMarkdown(['***', 'from ```' + this._skFile.skName + '```'].join('  \r\n'));
        }
        return this._markdown;
    }
    /** 함수 선언부 */
    toDeclaration() {
        let parms = this._parameters.join();
        if (!this._type)
            return `${this._name}(${parms}):`;
        else
            return `${this._name}(${parms}) :: ${this._type}:`;
    }
}
exports.SkriptFunction = SkriptFunction;
class SkriptFunctionBuilder extends SkriptComponent_1.SkriptComponentBuilder {
    regExp() {
        return /^(?<head>function\s(?:\w+)\((?:.*)\)(?:\s\:\:\s(?:[^:]+))?\:)(.*)(?<body>(?:(?:\r\n|\r|\n)(?:[^a-zA-Z][^\r\n]*)?)+)/i;
    }
    build() {
        var _a, _b;
        let headGroup = (_a = this._head.match(/^function\s(?<name>\w+)\((?<parameter>.*)\)(?:\s\:\:\s(?<type>[^:]+))?\:/i)) === null || _a === void 0 ? void 0 : _a.groups;
        if (headGroup) {
            let parameters = new Array();
            let parmMatch = headGroup.parameter.match(/\b([^,:]+)\:([^,]+)\b/ig);
            if (parmMatch)
                for (const parm of parmMatch) {
                    let parmGroup = (_b = parm.match(/(?<name>[^\:]*)\:(?<type>[^\,\=]*)(?:\=(?<default>[^\,]*))?/i)) === null || _b === void 0 ? void 0 : _b.groups;
                    if (parmGroup) {
                        if (!parmGroup.default)
                            parameters.push(new SkriptFunctionParameter(parmGroup.name.trim(), parmGroup.type.trim()));
                        else
                            parameters.push(new SkriptFunctionParameter(parmGroup.name.trim(), parmGroup.type.trim(), parmGroup.default.trim()));
                    }
                }
            return new SkriptFunction(this._skFile, this._range, this._docs, headGroup.name, parameters, headGroup.type, this._body);
        }
        return undefined;
    }
}
exports.SkriptFunctionBuilder = SkriptFunctionBuilder;
class SkriptFunctionParameter {
    constructor(_name, type, _default) {
        this._name = _name;
        this._type = type;
        this._default = _default;
    }
    get name() {
        return this._name;
    }
    get type() {
        return this._type;
    }
    toString() {
        if (this._default === undefined) {
            return `${this._name}:${this._type}`;
        }
        else {
            return `${this._name}:${this._type}=${this._default}`;
        }
    }
}
//# sourceMappingURL=SkriptFunction.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SkriptComponentBuilder = exports.SkriptComponent = void 0;
/** SkriptComponent 최상위 클래스 */
class SkriptComponent {
    constructor(_skFile, _range, _docs, _name) {
        this._skFile = _skFile;
        this._range = _range;
        this._docs = _docs;
        this._name = _name;
    }
    get range() {
        return this._range;
    }
    get docs() {
        return Object.assign(this._docs, {});
    }
    get name() {
        return this._name;
    }
}
exports.SkriptComponent = SkriptComponent;
class SkriptComponentBuilder {
    constructor(_skFile
    // protected _script: string
    ) {
        this._skFile = _skFile;
    }
    setRange(range) {
        this._range = range;
        return this;
    }
    setDocs(docs) {
        this._docs = new Array();
        for (const line of docs.split(/\r\n|\r|\n/i)) {
            let match = line.match(/(\t|\s)?\#\>\s?(.*)/i);
            if (match)
                this._docs.push(match[2]);
        }
        return this;
    }
    setHead(name) {
        this._head = name;
        return this;
    }
    setBody(body) {
        this._body = body;
        return this;
    }
}
exports.SkriptComponentBuilder = SkriptComponentBuilder;
//# sourceMappingURL=SkriptComponent.js.map
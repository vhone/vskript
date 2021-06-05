"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SkriptEventBuilder = exports.SkriptEvent = void 0;
const vscode_1 = require("vscode");
const SkriptComponent_1 = require("./SkriptComponent");
class SkriptEvent extends SkriptComponent_1.SkriptComponent {
    constructor(_skFile, _range, _docs, _name, _body) {
        super(_skFile, _range, _docs, _name);
        this._body = _body;
    }
    get body() {
        return this._body;
    }
    get symbol() {
        return vscode_1.SymbolKind.Event;
    }
}
exports.SkriptEvent = SkriptEvent;
class SkriptEventBuilder extends SkriptComponent_1.SkriptComponentBuilder {
    regExp() {
        return /^(?<head>on\s([^\:]+))\:(.*)(?<body>((\r\n|\r|\n)([^a-zA-Z][^\r\n]*)?)+)/i;
    }
    build() {
        return new SkriptEvent(this._skFile, this._range, this._docs, this._head, this._body);
    }
}
exports.SkriptEventBuilder = SkriptEventBuilder;
//# sourceMappingURL=SkriptEvent.js.map
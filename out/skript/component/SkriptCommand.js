"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SkriptCommandBuilder = exports.SkriptCommand = void 0;
const vscode_1 = require("vscode");
const SkriptComponent_1 = require("./SkriptComponent");
const SkriptOptions_1 = require("./SkriptOptions");
class SkriptCommand extends SkriptComponent_1.SkriptComponent {
    constructor(skFile, range, docs, name, _body) {
        super(skFile, range, docs, name);
        this._body = _body;
    }
    get body() {
        return this._body;
    }
    get symbol() {
        return vscode_1.SymbolKind.Property;
    }
}
exports.SkriptCommand = SkriptCommand;
class SkriptCommandBuilder extends SkriptComponent_1.SkriptComponentBuilder {
    regExp() {
        return /^(?<head>command\s([^\:]*))\:(.*)(?<body>((\r\n|\r|\n)([^a-zA-Z][^\r\n]*)?)+)/i;
    }
    build() {
        let options = this._skFile.components.filter(comp => comp instanceof SkriptOptions_1.SkriptOptions).reverse();
        // for (const option of this._skFile.components) if (option instanceof SkriptOption) {
        for (const option of options)
            if (option instanceof SkriptOptions_1.SkriptOptions) {
                if (option.range.end.isBefore(this._range.start))
                    for (const key of option.variables.keys()) {
                        this._head = this._head.replace(`{@${key}}`, `${option.variables.get(key)}`);
                    }
            }
        return new SkriptCommand(this._skFile, this._range, this._docs, this._head, this._body);
    }
}
exports.SkriptCommandBuilder = SkriptCommandBuilder;
//# sourceMappingURL=SkriptCommand.js.map
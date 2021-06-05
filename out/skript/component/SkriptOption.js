"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SkriptOptionBuilder = exports.SkriptOption = void 0;
const vscode_1 = require("vscode");
const SkriptComponent_1 = require("./SkriptComponent");
class SkriptOption extends SkriptComponent_1.SkriptComponent {
    constructor(_skFile, _range, _docs, _name, _variables) {
        super(_skFile, _range, _docs, _name);
        this._variables = _variables;
    }
    get variables() {
        return Object.assign(this._variables, {});
    }
    get symbol() {
        return vscode_1.SymbolKind.Constant;
    }
}
exports.SkriptOption = SkriptOption;
class SkriptOptionBuilder extends SkriptComponent_1.SkriptComponentBuilder {
    regExp() {
        return /^(?<head>options:)(.*)(?<body>((\r\n|\r|\n)([^a-zA-Z][^\r\n]*)?)+)/i;
    }
    build() {
        var _a;
        let variables = new Map();
        for (const line of this._body.split(/\r\n|\r|\n/i)) {
            let groups = (_a = line.match(/^(?:\t|\s{4})*(?<key>[^\:]+)\s*\:\s*(?<value>[^\:]*)/i)) === null || _a === void 0 ? void 0 : _a.groups;
            if (groups)
                variables.set(groups.key.trim(), groups.value.trim());
        }
        return new SkriptOption(this._skFile, this._range, this._docs, this._head, variables);
    }
}
exports.SkriptOptionBuilder = SkriptOptionBuilder;
//# sourceMappingURL=SkriptOption.js.map
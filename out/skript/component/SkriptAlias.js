"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SkriptAliasBuilder = exports.SkriptAlias = void 0;
const vscode_1 = require("vscode");
const SkriptComponent_1 = require("./SkriptComponent");
class SkriptAlias extends SkriptComponent_1.SkriptComponent {
    constructor(_skFile, _range, _docs, _name, _itemtypes) {
        super(_skFile, _range, _docs, _name);
        this._itemtypes = _itemtypes;
    }
    get itemtypes() {
        return Object.assign(this._itemtypes, {});
    }
    get symbol() {
        return vscode_1.SymbolKind.Constant;
    }
}
exports.SkriptAlias = SkriptAlias;
class SkriptAliasBuilder extends SkriptComponent_1.SkriptComponentBuilder {
    regExp() {
        return /^(?<head>aliases):(.*)(?<body>((\r\n|\r|\n)([^a-zA-Z][^\r\n]*)?)+)/i;
    }
    build() {
        var _a;
        let itemtypes = new Map();
        for (const line of this._body.split(/\r\n|\r|\n/i)) {
            let groups = (_a = line.match(/^(?:\t|\s{4})*(?<key>[^\=]+)\s*\=\s*(?<values>[^\=]*)/i)) === null || _a === void 0 ? void 0 : _a.groups;
            if (groups) {
                itemtypes.set(groups.key.trim(), groups.values.split(/\s*\,\s*/i));
            }
        }
        return new SkriptAlias(this._skFile, this._range, this._docs, this._head, itemtypes);
    }
}
exports.SkriptAliasBuilder = SkriptAliasBuilder;
//# sourceMappingURL=SkriptAlias.js.map
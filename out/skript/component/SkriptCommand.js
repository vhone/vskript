"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SkriptCommandBuilder = exports.SkriptCommand = void 0;
const vscode_1 = require("vscode");
const SkriptComponent_1 = require("./SkriptComponent");
const SkriptOptions_1 = require("./SkriptOptions");
class SkriptCommand extends SkriptComponent_1.SkriptComponent {
    constructor(skFile, range, docs, _header, _body) {
        super(skFile, range, docs, _header.toString());
        this._header = _header;
        this._body = _body;
    }
    get label() {
        return this._header.label;
    }
    get argument() {
        return this._header.argument;
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
        var _a;
        // 명령어에 사용된 Options 바꾸기
        let options = this._skFile.components.filter(comp => comp instanceof SkriptOptions_1.SkriptOptions).reverse();
        for (const option of options)
            if (option instanceof SkriptOptions_1.SkriptOptions) {
                if (option.range.end.isBefore(this._range.start))
                    for (const key of option.options.keys()) {
                        this._head = this._head.replace(`{@${key}}`, `${option.options.get(key)}`);
                    }
            }
        let header = new SkriptCommandHeader(this._head);
        let optionConfig = {};
        for (const line of this._body.split(/\r\n|\r|\n/i)) {
            let groups = (_a = line.match(/^(\t|\s{4})(?<option>aliases|description|usage|permission message|executable by|permission|cooldown|cooldown message|cooldown bypass|cooldown storage)\:\s*(?<value>.*)/i)) === null || _a === void 0 ? void 0 : _a.groups;
            if (groups) {
                // cmdOptions.set(groups.option, groups.value)
            }
        }
        let skCommandOptions = new SkriptCommandOptions(optionConfig);
        console.log(skCommandOptions);
        /*
         * 명령어 구체적으로 나누기
         * [label]
         * [arguemnts]
         * [command option]
         * [trigger]
         */
        return new SkriptCommand(this._skFile, this._range, this._docs, header, this._body);
    }
}
exports.SkriptCommandBuilder = SkriptCommandBuilder;
class SkriptCommandOptions {
    constructor(_config) {
        this._config = _config;
    }
    get aliases() {
        return this._config.aliases;
    }
}
class SkriptCommandHeader {
    constructor(_head) {
        var _a;
        this._head = _head;
        let groups = (_a = this._head.match(/^command\s\/?(?<label>[^\s\:]+)(\s(?<argument>.*))?/i)) === null || _a === void 0 ? void 0 : _a.groups;
        if (!groups)
            throw new Error("SkriptCommandHeader: unmatch");
        this._label = groups.label;
        this._argument = groups.argument;
    }
    get label() {
        return this._label;
    }
    get argument() {
        return this._argument;
    }
    toString() {
        return `command /${[this._label, this._argument].join(' ')}`;
    }
    ;
}
//# sourceMappingURL=SkriptCommand.js.map
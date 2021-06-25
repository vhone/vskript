"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SkriptCommandOptionTypes = exports.SkriptCommandBuilder = exports.SkriptCommand = void 0;
const vscode_1 = require("vscode");
const SkriptComponent_1 = require("./SkriptComponent");
const SkriptOptions_1 = require("./SkriptOptions");
class SkriptCommand extends SkriptComponent_1.SkriptComponent {
    constructor(skFile, range, docs, _header, _options, _trigger) {
        super(skFile, range, docs, _header.toString());
        this._header = _header;
        this._options = _options;
        this._trigger = _trigger;
    }
    get label() {
        return this._header.label;
    }
    get argument() {
        return this._header.argument;
    }
    get options() {
        return this._options;
    }
    get trigger() {
        return this._trigger;
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
        // 명령어 해드에 사용된 Options 바꾸기
        let options = this._skFile.components.filter(comp => comp instanceof SkriptOptions_1.SkriptOptions).reverse();
        for (const option of options)
            if (option instanceof SkriptOptions_1.SkriptOptions) {
                if (option.range.end.isBefore(this._range.start))
                    for (const key of option.options.keys()) {
                        this._head = this._head.replace(`{@${key}}`, `${option.options.get(key)}`);
                    }
            }
        let header = new SkriptCommandHeader(this._head);
        // 명령어 옵션
        let position = this._range.start;
        let cmdOptions = new SkriptCommandOptions();
        let lines = this._body.split(/\r\n|\r|\n/i);
        let triggerPos = 0;
        let trigger = new Array();
        for (var i = 0; i < lines.length; i++) {
            let line = lines[i];
            let groups = (_a = line.match(/^(?<space>\t|\s{4})(?<option>aliases|description|usage|permission message|executable by|permission|cooldown|cooldown message|cooldown bypass|cooldown storage|trigger)\:\s*(?<value>.*)/i)) === null || _a === void 0 ? void 0 : _a.groups;
            if (groups) {
                let type;
                if (groups.option === 'aliases')
                    type = SkriptCommandOptionType.ALIASES;
                else if (groups.option === 'description')
                    type = SkriptCommandOptionType.DESCRIPTION;
                else if (groups.option === 'usage')
                    type = SkriptCommandOptionType.USAGE;
                else if (groups.option === 'permission')
                    type = SkriptCommandOptionType.PERMISSION;
                else if (groups.option === 'permission message')
                    type = SkriptCommandOptionType.PERMISSION_MESSAGE;
                else if (groups.option === 'executable by')
                    type = SkriptCommandOptionType.EXECUTABLE_BY;
                else if (groups.option === 'cooldown')
                    type = SkriptCommandOptionType.COOLDOWN;
                else if (groups.option === 'cooldown message')
                    type = SkriptCommandOptionType.COOLDOWN_MESSAGE;
                else if (groups.option === 'cooldown bypass')
                    type = SkriptCommandOptionType.COOLDOWN_BYPASS;
                else if (groups.option === 'cooldown storage')
                    type = SkriptCommandOptionType.COOLDOWN_STORAGE;
                else if (groups.option === 'trigger')
                    triggerPos = i;
                if (type) {
                    let range = new vscode_1.Range(new vscode_1.Position(position.line + i, groups.space.length), new vscode_1.Position(position.line + i, line.length));
                    cmdOptions.setOption(type, groups.value, range);
                }
            }
            else if (i === triggerPos + 1) {
                trigger.push(line);
                triggerPos++;
            }
        }
        /*
         * 명령어 구체적으로 나누기
         * [label]
         * [arguemnts]
         * [command option]
         * [trigger]
         */
        console.log(cmdOptions);
        return new SkriptCommand(this._skFile, this._range, this._docs, header, cmdOptions, trigger);
    }
}
exports.SkriptCommandBuilder = SkriptCommandBuilder;
var SkriptCommandOptionType;
(function (SkriptCommandOptionType) {
    SkriptCommandOptionType["ALIASES"] = "aliases";
    SkriptCommandOptionType["DESCRIPTION"] = "description";
    SkriptCommandOptionType["USAGE"] = "usage";
    SkriptCommandOptionType["PERMISSION"] = "permission";
    SkriptCommandOptionType["PERMISSION_MESSAGE"] = "permission message";
    SkriptCommandOptionType["EXECUTABLE_BY"] = "executable by";
    SkriptCommandOptionType["COOLDOWN"] = "cooldown";
    SkriptCommandOptionType["COOLDOWN_MESSAGE"] = "cooldown message";
    SkriptCommandOptionType["COOLDOWN_BYPASS"] = "cooldown bypass";
    SkriptCommandOptionType["COOLDOWN_STORAGE"] = "cooldown storage";
})(SkriptCommandOptionType || (SkriptCommandOptionType = {}));
exports.SkriptCommandOptionTypes = {
    ALIASES: SkriptCommandOptionType.ALIASES,
    DESCRIPTION: SkriptCommandOptionType.DESCRIPTION,
    USAGE: SkriptCommandOptionType.USAGE,
    PERMISSION: SkriptCommandOptionType.PERMISSION,
    PERMISSION_MESSAGE: SkriptCommandOptionType.PERMISSION_MESSAGE,
    EXECUTABLE_BY: SkriptCommandOptionType.EXECUTABLE_BY,
    COOLDOWN: SkriptCommandOptionType.COOLDOWN,
    COOLDOWN_MESSAGE: SkriptCommandOptionType.COOLDOWN_MESSAGE,
    COOLDOWN_BYPASS: SkriptCommandOptionType.COOLDOWN_BYPASS,
    COOLDOWN_STORAGE: SkriptCommandOptionType.COOLDOWN_STORAGE,
    values: () => {
        return [
            SkriptCommandOptionType.ALIASES,
            SkriptCommandOptionType.DESCRIPTION,
            SkriptCommandOptionType.USAGE,
            SkriptCommandOptionType.PERMISSION,
            SkriptCommandOptionType.PERMISSION_MESSAGE,
            SkriptCommandOptionType.EXECUTABLE_BY,
            SkriptCommandOptionType.COOLDOWN,
            SkriptCommandOptionType.COOLDOWN_MESSAGE,
            SkriptCommandOptionType.COOLDOWN_BYPASS,
            SkriptCommandOptionType.COOLDOWN_STORAGE
        ];
    }
};
class SkriptCommandOptions {
    constructor() {
        this._options = new Map();
    }
    setOption(type, value, range) {
        this._options.set(type, { value: value, range: range });
    }
    getOption(type) {
        return this._options.get(type);
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
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SkriptCommandBuilder = exports.SkriptCommand = void 0;
const vscode_1 = require("vscode");
const SkriptComponent_1 = require("./SkriptComponent");
const SkriptOptions_1 = require("./SkriptOptions");
const Context_1 = require("../Context");
class SkriptCommand extends SkriptComponent_1.SkriptComponent {
    constructor(skFile, range, docs, _header, _options, _trigger) {
        super(skFile, range, docs, _header.toString());
        this._header = _header;
        this._options = _options;
        this._trigger = _trigger;
        // this.detail = `/${_header.label}`;
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
        return vscode_1.SymbolKind.Class;
    }
    contextOf(position) {
        for (const option of this._options)
            if (option.range.contains(position)) {
                return option;
            }
        for (const text of this._trigger.texts)
            if (text.range.contains(position)) {
                return text;
            }
        return 'other';
    }
}
exports.SkriptCommand = SkriptCommand;
class SkriptCommandBuilder extends SkriptComponent_1.SkriptComponentBuilder {
    regExp() {
        return /^(?<head>command\s([^\:]*))\:(.*)(?<body>((\r\n|\r|\n)([^a-zA-Z][^\r\n]*)?)+)/i;
    }
    build() {
        var _a;
        // options 맵핑
        let optionMap = new Map();
        let skOptions = this._skFile.components.filter(comp => comp instanceof SkriptOptions_1.SkriptOptions).reverse();
        for (const option of skOptions)
            if (option instanceof SkriptOptions_1.SkriptOptions) {
                if (option.range.end.isBefore(this._range.start))
                    for (const key of option.options.keys()) {
                        optionMap.set(`{@${key}}`, `${option.options.get(key)}`);
                    }
            }
        // 명령어 해드에 사용된 Options 바꾸기
        for (const mapping of optionMap) {
            this._head = this._head.replace(mapping[0], mapping[1]);
        }
        let header = new SkriptCommandHeader(this._head);
        // 명령어 옵션
        let position = this._range.start;
        let lines = this._body.split(/\r\n|\r|\n/i);
        let options = new Array();
        let triggerData = { code: new Array(), line: 0 };
        for (var i = 0; i < lines.length; i++) {
            let line = lines[i];
            let groups = (_a = line.match(/^(?<space>\t|\s{4})(?<option>aliases|description|usage|permission message|executable by|permission|cooldown|cooldown message|cooldown bypass|cooldown storage|trigger)\:\s*(?<value>.*)/i)) === null || _a === void 0 ? void 0 : _a.groups;
            if (groups) {
                if (groups.option === 'trigger') {
                    triggerData.start = new vscode_1.Position(position.line + i, groups.space.length);
                    triggerData.line = i;
                }
                else {
                    for (const mapping of optionMap) {
                        groups.value = groups.value.replace(mapping[0], mapping[1]);
                    }
                    let range = new vscode_1.Range(new vscode_1.Position(position.line + i, groups.space.length), new vscode_1.Position(position.line + i, line.length));
                    options.push(this._createOption(groups.option, groups.value, range));
                }
            }
            else if (i === triggerData.line + 1) {
                triggerData.code.push({ line: position.line + i, code: line });
                triggerData.line++;
            }
        }
        triggerData.end = new vscode_1.Position(position.line + triggerData.line, triggerData.code[triggerData.code.length - 1].code.length);
        // 명령어 트리거
        let trigger = new SkriptCommandTrigger(new vscode_1.Range(triggerData.start, triggerData.end));
        trigger.addCode(...triggerData.code);
        return new SkriptCommand(this._skFile, this._range, this._docs, header, options, trigger);
        ;
    }
    _createOption(option, value, range) {
        if (option === 'aliases')
            return new Context_1.SkriptCommandAliases(range, value);
        else if (option === 'description')
            return new Context_1.SkriptCommandDescription(range, value);
        else if (option === 'usage')
            return new Context_1.SkriptCommandUsage(range, value);
        else if (option === 'permission')
            return new Context_1.SkriptCommandPermission(range, value);
        else if (option === 'permission message')
            return new Context_1.SkriptCommandPermissionMessage(range, value);
        else if (option === 'executable by')
            return new Context_1.SkriptCommandExecutableBy(range, value);
        else if (option === 'cooldown')
            return new Context_1.SkriptCommandCooldown(range, value);
        else if (option === 'cooldown message')
            return new Context_1.SkriptCommandCooldownMessage(range, value);
        else if (option === 'cooldown bypass')
            return new Context_1.SkriptCommandCooldownBypass(range, value);
        else if (option === 'cooldown storage')
            return new Context_1.SkriptCommandCooldownStorage(range, value);
        else
            return;
    }
}
exports.SkriptCommandBuilder = SkriptCommandBuilder;
class SkriptCommandTrigger {
    constructor(_range) {
        this._range = _range;
        this._code = new Array();
        this._texts = new Array();
        this._variables = new Array();
        this._functions = new Array();
    }
    addCode(...codelines) {
        this._code.push(...codelines);
        for (const codeline of codelines) {
            let variables = this._createVariables(codeline);
            if (variables)
                this._variables.push(...variables);
            let texts = this._createText(codeline);
            if (texts)
                this._texts.push(...texts);
            let functions = this._createFunction(codeline);
            if (functions)
                this._functions.push(...functions);
            if (variables && texts) {
                for (const text of texts)
                    for (const variable of variables) {
                        if (text.range.contains(variable.range)) {
                            text.addChildren(variable);
                        }
                    }
            }
        }
    }
    _createFunction(codeline) {
        let code = codeline.code;
        let functionMap = new Map();
        let i = 0;
        let search;
        while (search = code.match(/(?<name>[a-zA-Z0-9_]*)\((?<parameter>[^()]*)\)/i)) {
            let groups = search.groups;
            if (!groups)
                break;
            // function 치환
            let key = '$[' + i + ']';
            code = code.replace(search[0], key);
            // 치환값 복원
            let replace;
            while (replace = search[0].match(/\$\[\d\]/)) {
                search[0] = search[0].replace(replace[0], functionMap.get(replace[0]).code);
            }
            // function 생성
            let index = codeline.code.indexOf(search[0]);
            if (index < 0)
                break;
            let func = new Context_1.SkriptExprFunction(new vscode_1.Range(new vscode_1.Position(codeline.line, index), new vscode_1.Position(codeline.line, index + search[0].length + 1)), search[0], groups.name);
            // parameter(child) 세팅
            let parameter;
            let paramSearch;
            if (paramSearch = groups.parameter.match(/[^,]+/ig)) {
                parameter = new Array();
                param: for (let param of paramSearch) {
                    param = param.trim();
                    let func = functionMap.get(param);
                    if (func) {
                        parameter.push(func);
                        continue;
                    }
                    else {
                        for (const text of this._texts)
                            if (text.range.start.line === codeline.line && text.code === param) {
                                parameter.push(text);
                                continue param;
                            }
                        for (const variable of this._variables)
                            if (variable.range.start.line === codeline.line && variable.code === param) {
                                parameter.push(variable);
                                continue param;
                            }
                    }
                }
            }
            // parent, child
            if (parameter)
                for (const param of parameter) {
                    func.addChildren(param);
                    param.setParent(func);
                }
            functionMap.set(key, func);
            i++;
        }
        ;
        return [...functionMap.values()];
    }
    _createText(codeline) {
        let code = codeline.code;
        let texts = new Array();
        let search;
        if (search = code.match(/\"[^\"]*\"/ig)) {
            let i = 0;
            for (const text of search) {
                let index = code.indexOf(text, i);
                if (index < 0)
                    break;
                texts.push(new Context_1.SkriptExprText(new vscode_1.Range(new vscode_1.Position(codeline.line, index), new vscode_1.Position(codeline.line, index + text.length + 1)), text));
                i = index + text.length + 1;
            }
        }
        if (texts.length > 0)
            return texts;
        else
            return;
    }
    _createVariables(codeline) {
        let code = codeline.code;
        let variables = new Array();
        let variableMap = new Map();
        let i = 0;
        let search;
        while (search = code.match(/\{[^{}]*\}/i)) {
            code = code.replace(search[0], '$[' + i + ']');
            let replace;
            while (replace = search[0].match(/\$\[\d\]/)) {
                search[0] = search[0].replace(replace[0], variableMap.get(replace[0]));
                variableMap.delete(replace[0]);
            }
            variableMap.set('$[' + i + ']', search[0]);
            i++;
        }
        for (const value of variableMap) {
            let index = codeline.code.indexOf(value[1]);
            if (index < 0)
                continue;
            variables.push(new Context_1.SkriptExprVariable(new vscode_1.Range(new vscode_1.Position(codeline.line, index), new vscode_1.Position(codeline.line, index + value[1].length + 1)), value[1]));
        }
        if (variables.length > 0)
            return variables;
        else
            return;
    }
    get texts() {
        return this._texts;
    }
    get variables() {
        return this._variables;
    }
    get functions() {
        return this._functions;
    }
    get name() {
        return 'trigger:';
    }
    get symbol() {
        return vscode_1.SymbolKind.Module;
    }
    get range() {
        return this._range;
    }
}
class SkriptCommandHeader {
    constructor(head) {
        var _a;
        let groups = (_a = head.match(/^command\s\/?(?<label>[^\s\:]+)(\s(?<argument>.*))?/i)) === null || _a === void 0 ? void 0 : _a.groups;
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
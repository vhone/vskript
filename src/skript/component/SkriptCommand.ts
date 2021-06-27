import { ParameterInformation, Position, Range, SymbolKind } from "vscode";
import SkriptFile from "../SkriptFile";
import { SkriptComponent, SkriptComponentBuilder } from "./SkriptComponent";
import { SkriptOptions } from "./SkriptOptions";
import {
    SkriptContext,
    
    SkriptExpression,
    SkriptExprFunction,
    SkriptExprText,
    SkriptExprVariable,

    SkriptCommandOption,
    SkriptCommandAliases,
    SkriptCommandCooldown,
    SkriptCommandCooldownBypass,
    SkriptCommandCooldownMessage,
    SkriptCommandCooldownStorage,
    SkriptCommandDescription,
    SkriptCommandExecutableBy,
    SkriptCommandPermission,
    SkriptCommandPermissionMessage,
    SkriptCommandUsage
} from "../Context";

export class SkriptCommand extends SkriptComponent {

    constructor(skFile:SkriptFile, range: Range, docs: string[],
        private readonly _header: SkriptCommandHeader,
        private readonly _options: Array<SkriptCommandOption>,
        private readonly _trigger: SkriptCommandTrigger
    ) {
        super(skFile, range, docs, _header.toString());
        // this.detail = `/${_header.label}`;
    }

    public get label(): string {
        return this._header.label;
    }
    public get argument(): string | undefined {
        return this._header.argument;
    }
    public get options(): SkriptCommandOption[] {
        return this._options;
    }
    public get trigger(): SkriptCommandTrigger {
        return this._trigger;
    }
    public get symbol(): SymbolKind {
        return SymbolKind.Class;
    }
    public contextOf(position: Position): string | SkriptContext {
        for (const option of this._options) if (option.range.contains(position)) {
            return option;
        }
        for (const text of this._trigger.texts) if (text.range.contains(position)) {
            return text;
        }
        return 'other'
    }
    
}

export class SkriptCommandBuilder extends SkriptComponentBuilder<SkriptCommand> {
    public regExp(): RegExp {
        return /^(?<head>command\s([^\:]*))\:(.*)(?<body>((\r\n|\r|\n)([^a-zA-Z][^\r\n]*)?)+)/i;
    }
    public build(): SkriptCommand | undefined {
        
        // options 맵핑
        let optionMap = new Map<string, string>();
        let skOptions = this._skFile.components.filter(comp => comp instanceof SkriptOptions).reverse();
        for (const option of skOptions) if (option instanceof SkriptOptions) {
            if (option.range.end.isBefore(this._range.start)) for (const key of option.options.keys()){
                optionMap.set(`{@${key}}`, `${option.options.get(key)}`)
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
        let options = new Array<SkriptCommandOption>();

        let triggerData: {code: {line:number, code:string}[], line: number, start?: Position, end?: Position}
            = {code: new Array<{line:number, code:string}>(), line: 0};
        for (var i=0; i<lines.length; i++) {
            
            let line = lines[i];
            let groups = line.match(/^(?<space>\t|\s{4})(?<option>aliases|description|usage|permission message|executable by|permission|cooldown|cooldown message|cooldown bypass|cooldown storage|trigger)\:\s*(?<value>.*)/i)?.groups;
            if  (groups) {
                if (groups.option === 'trigger') {
                    triggerData.start = new Position(position.line + i, groups.space.length );
                    triggerData.line = i;
                } else {
                    for (const mapping of optionMap) {
                        groups.value = groups.value.replace(mapping[0], mapping[1]);
                    }
                    let range = new Range(
                        new Position(position.line + i, groups.space.length ),
                        new Position(position.line + i, line.length )
                        );
                    options.push(this._createOption(groups.option, groups.value, range)!);
                }
            } else if (i === triggerData.line + 1) {
                triggerData.code.push({line: position.line + i, code: line});
                triggerData.line++;
            }
        }
        triggerData.end = new Position(position.line + triggerData.line, triggerData.code[triggerData.code.length - 1].code.length);

        // 명령어 트리거
        let trigger = new SkriptCommandTrigger(new Range(triggerData.start!, triggerData.end));
        trigger.addCode(...triggerData.code);

        return new SkriptCommand(this._skFile, this._range, this._docs, header, options, trigger);;
    }
    
    private _createOption(option: string, value: string, range: Range): SkriptCommandOption | undefined {
        if (option === 'aliases') return new SkriptCommandAliases(range, value);
        else if (option === 'description') return new SkriptCommandDescription(range, value);
        else if (option === 'usage') return new SkriptCommandUsage(range, value);
        else if (option === 'permission') return new SkriptCommandPermission(range, value);
        else if (option === 'permission message') return new SkriptCommandPermissionMessage(range, value);
        else if (option === 'executable by') return new SkriptCommandExecutableBy(range, value);
        else if (option === 'cooldown') return new SkriptCommandCooldown(range, value);
        else if (option === 'cooldown message') return new SkriptCommandCooldownMessage(range, value);
        else if (option === 'cooldown bypass') return new SkriptCommandCooldownBypass(range, value);
        else if (option === 'cooldown storage') return new SkriptCommandCooldownStorage(range, value);
        else return;
    }
}






class SkriptCommandTrigger {

    private _code = new Array<{line:number, code:string}>();
    private _texts = new Array<SkriptExprText>();
    private _variables = new Array<SkriptExprVariable>();
    private _functions = new Array<SkriptExprFunction>();

    constructor(
        private readonly _range: Range
    ) {}

    public addCode(...codelines:{line:number, code:string}[]) {
        this._code.push(...codelines);

        for(const codeline of codelines) {
            
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
                for (const text of texts) for (const variable of variables) {
                    if (text.range.contains(variable.range)) {
                        text.addChildren(variable);
                    }
                }
            }


        }
    }

    private _createFunction(codeline:{line:number, code:string}): SkriptExprFunction[] | undefined {
        let code = codeline.code;
        let functionMap = new Map<string, SkriptExprFunction> ();
        let i = 0;
        let search;
        while (search = code.match(/(?<name>[a-zA-Z0-9_]*)\((?<parameter>[^()]*)\)/i)) {
    
            let groups = search.groups;
            if (!groups) break;
    
            // function 치환
            let key = '$['+i+']';
            code = code.replace(search[0], key);
    
            // 치환값 복원
            let replace;
            while (replace = search[0].match(/\$\[\d\]/)) {
                search[0] = search[0].replace(replace[0], functionMap.get(replace[0])!.code);
            }
    
            // function 생성
            let index = codeline.code.indexOf(search[0]);
            if (index < 0) break;
            let func = new SkriptExprFunction(
                new Range(new Position(codeline.line, index), new Position(codeline.line, index + search[0].length + 1)),
                search[0],
                groups.name
            );

            // parameter(child) 세팅
            let parameter: SkriptExpression[] | undefined
            let paramSearch;
            if (paramSearch = groups.parameter.match(/[^,]+/ig)) {
                parameter = new Array<SkriptExpression>();
                param: for (let param of paramSearch) {
                    param = param.trim();
                    let func = functionMap.get(param);
                    if (func) {
                        parameter.push(func);
                        continue;
                    } else {
                        for (const text of this._texts) if (text.range.start.line === codeline.line && text.code === param) {
                            parameter.push(text);
                            continue param;
                        }
                        for (const variable of this._variables) if (variable.range.start.line === codeline.line && variable.code === param) {
                            parameter.push(variable);
                            continue param;
                        }
                    }
                }
            }

            // parent, child
            if (parameter) for (const param of parameter) {
                func.addChildren(param);
                param.setParent(func);
            }

            functionMap.set(key, func);
            
            i++;
        };
        return [...functionMap.values()];
    }

    private _createText(codeline:{line:number, code:string}): SkriptExprText[] | undefined {
        let code = codeline.code;
        let texts = new Array<SkriptExprText>();
        let search;
        if (search = code.match(/\"[^\"]*\"/ig)) {
            let i = 0;
            for (const text of search) {
                let index = code.indexOf(text, i);
                if (index < 0) break;
                texts.push(
                    new SkriptExprText(
                        new Range(new Position(codeline.line, index), new Position(codeline.line, index + text.length + 1)),
                        text
                    )
                )
                i = index + text.length + 1;
            }
        }
        if (texts.length > 0)
            return texts;
        else
            return;
    }
    private _createVariables(codeline:{line:number, code:string}): SkriptExprVariable[] | undefined{
        let code = codeline.code;
        let variables = new Array<SkriptExprVariable>();
        let variableMap = new Map<string, string>();
        let i = 0;
        let search;
        while (search = code.match(/\{[^{}]*\}/i)) {
            code = code.replace(search[0], '$['+i+']');
            let replace;
            while (replace = search[0].match(/\$\[\d\]/)) {
                search[0] = search[0].replace(replace[0], variableMap.get(replace[0])!);
                variableMap.delete(replace[0]);
            }
            variableMap.set('$['+i+']', search[0]);
            i++;
        }
        for (const value of variableMap) {
            let index = codeline.code.indexOf(value[1]);
            if (index < 0) continue;
            variables.push(
                new SkriptExprVariable(
                    new Range(new Position(codeline.line, index), new Position(codeline.line, index + value[1].length + 1)),
                    value[1]
                )
            );
        }
        if (variables.length > 0)
            return variables;
        else
            return;
    }

    public get texts() {
        return this._texts;
    }
    public get variables() {
        return this._variables;
    }
    public get functions() {
        return this._functions;
    }
    public get name() {
        return 'trigger:'
    }
    public get symbol() {
        return SymbolKind.Module;
    }
    public get range() {
        return this._range;
    }

}



class SkriptCommandHeader {

    private readonly _label: string;
    private readonly _argument: string | undefined;

    constructor(head: string) {
        let groups = head.match(/^command\s\/?(?<label>[^\s\:]+)(\s(?<argument>.*))?/i)?.groups;
        if (!groups)
            throw new Error("SkriptCommandHeader: unmatch");
        this._label = groups.label;
        this._argument = groups.argument; 
    }

    public get label(): string {
        return this._label
    }
    public get argument(): string | undefined {
        return this._argument
    }
    public toString(): string {
        return `command /${[this._label, this._argument].join(' ')}`
    };

}







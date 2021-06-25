import { group } from "node:console";
import { Position, Range, SymbolKind } from "vscode";
import SkriptFile from "../SkriptFile";
import { SkriptComponent, SkriptComponentBuilder } from "./SkriptComponent";
import { SkriptOptions } from "./SkriptOptions";

export class SkriptCommand extends SkriptComponent {

    constructor(skFile:SkriptFile, range: Range, docs: string[],
        private readonly _header: SkriptCommandHeader,
        private readonly _options: SkriptCommandOptions,
        private readonly _trigger: string[]
    ) {
        super(skFile, range, docs, _header.toString());
    }

    public get label(): string {
        return this._header.label;
    }
    public get argument(): string | undefined {
        return this._header.argument;
    }
    public get options(): SkriptCommandOptions {
        return this._options;
    }
    public get trigger(): string[] {
        return this._trigger;
    }
    public get symbol(): SymbolKind {
        return SymbolKind.Property;
    }
    
}

export class SkriptCommandBuilder extends SkriptComponentBuilder<SkriptCommand> {
    public regExp(): RegExp {
        return /^(?<head>command\s([^\:]*))\:(.*)(?<body>((\r\n|\r|\n)([^a-zA-Z][^\r\n]*)?)+)/i;
    }
    public build(): SkriptCommand | undefined {
        
        // 명령어 해드에 사용된 Options 바꾸기
        let options = this._skFile.components.filter(comp => comp instanceof SkriptOptions).reverse();
        for (const option of options) if (option instanceof SkriptOptions) {
            if (option.range.end.isBefore(this._range.start)) for (const key of option.options.keys()){
                this._head = this._head.replace(`{@${key}}`, `${option.options.get(key)}`);
            }
        }
        let header = new SkriptCommandHeader(this._head);

        // 명령어 옵션
        let position = this._range.start;

        let cmdOptions = new SkriptCommandOptions();
        let lines = this._body.split(/\r\n|\r|\n/i);
        let triggerPos = 0;
        let trigger = new Array<string>();
        for (var i=0; i<lines.length; i++) {
            let line = lines[i];
            let groups = line.match(/^(?<space>\t|\s{4})(?<option>aliases|description|usage|permission message|executable by|permission|cooldown|cooldown message|cooldown bypass|cooldown storage|trigger)\:\s*(?<value>.*)/i)?.groups;
            if  (groups) {
                let type: SkriptCommandOptionType | undefined;
                if (groups.option === 'aliases') type = SkriptCommandOptionType.ALIASES;
                else if (groups.option === 'description') type = SkriptCommandOptionType.DESCRIPTION;
                else if (groups.option === 'usage') type = SkriptCommandOptionType.USAGE;
                else if (groups.option === 'permission') type = SkriptCommandOptionType.PERMISSION;
                else if (groups.option === 'permission message') type = SkriptCommandOptionType.PERMISSION_MESSAGE;
                else if (groups.option === 'executable by') type = SkriptCommandOptionType.EXECUTABLE_BY;
                else if (groups.option === 'cooldown') type = SkriptCommandOptionType.COOLDOWN;
                else if (groups.option === 'cooldown message') type = SkriptCommandOptionType.COOLDOWN_MESSAGE;
                else if (groups.option === 'cooldown bypass') type = SkriptCommandOptionType.COOLDOWN_BYPASS;
                else if (groups.option === 'cooldown storage') type = SkriptCommandOptionType.COOLDOWN_STORAGE;
                else if (groups.option === 'trigger') triggerPos = i;
                if (type) {
                    let range = new Range(
                        new Position(position.line + i, groups.space.length ),
                        new Position(position.line + i, line.length )
                        ); 
                    cmdOptions.setOption(type, groups.value, range)
                }
            } else if (i === triggerPos + 1) {
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

enum SkriptCommandOptionType {
    ALIASES = 'aliases',
    DESCRIPTION = 'description',
    USAGE = 'usage',
    PERMISSION = 'permission',
    PERMISSION_MESSAGE = 'permission message',
    EXECUTABLE_BY = 'executable by',
    COOLDOWN = 'cooldown',
    COOLDOWN_MESSAGE = 'cooldown message',
    COOLDOWN_BYPASS = 'cooldown bypass',
    COOLDOWN_STORAGE = 'cooldown storage'
}
export const SkriptCommandOptionTypes = {
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
        ]
    }
}


interface SkriptCommandOptionContext {
    type: SkriptCommandOptionType;
    value?: string;
    range: Range;
}

class SkriptCommandOptions {

    private _options = new Map<SkriptCommandOptionType, {value:string, range:Range}>();

    constructor() {
    }

    public setOption(type:SkriptCommandOptionType, value:string, range:Range) {
        this._options.set(type, {value:value, range:range});
    }
    public getOption(type:SkriptCommandOptionType) {
        return this._options.get(type);
    }

}

class SkriptCommandHeader {

    private readonly _label: string;
    private readonly _argument: string | undefined;

    constructor(
        private readonly _head: string
    ) {
        let groups = this._head.match(/^command\s\/?(?<label>[^\s\:]+)(\s(?<argument>.*))?/i)?.groups;
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
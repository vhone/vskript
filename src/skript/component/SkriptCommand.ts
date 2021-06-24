import { Range, SymbolKind } from "vscode";
import SkriptFile from "../SkriptFile";
import { SkriptComponent, SkriptComponentBuilder } from "./SkriptComponent";
import { SkriptOptions } from "./SkriptOptions";

export class SkriptCommand extends SkriptComponent {

    constructor(skFile:SkriptFile, range: Range, docs: string[],
        private readonly _header: SkriptCommandHeader,
        private readonly _body: string
    ) {
        super(skFile, range, docs, _header.toString());
    }

    public get label(): string {
        return this._header.label;
    }
    public get argument(): string | undefined {
        return this._header.argument;
    }
    public get body(): string {
        return this._body;
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
        
        // 명령어에 사용된 Options 바꾸기
        let options = this._skFile.components.filter(comp => comp instanceof SkriptOptions).reverse();
        for (const option of options) if (option instanceof SkriptOptions) {
            if (option.range.end.isBefore(this._range.start)) for (const key of option.options.keys()){
                this._head = this._head.replace(`{@${key}}`, `${option.options.get(key)}`);
            }
        }

        let header = new SkriptCommandHeader(this._head);
        let optionConfig: SkriptCommandOptionConfig = {};
        for (const line of this._body.split(/\r\n|\r|\n/i)) {
            let groups = line.match(/^(\t|\s{4})(?<option>aliases|description|usage|permission message|executable by|permission|cooldown|cooldown message|cooldown bypass|cooldown storage)\:\s*(?<value>.*)/i)?.groups;
            if  (groups) {
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

interface SkriptCommandOptionConfig {
    aliases?: string;
    description?: string;
    usage?: string;
    permission?: string;
    permissionMessage?: string;
    executableBy?: string;
    cooldown?: string;
    cooldownMessage?: string;
    cooldownBypass?: string;
    cooldownStorage?: string;
}

class SkriptCommandOptions {
    
    constructor(
        private readonly _config: SkriptCommandOptionConfig) {
    }

    public get aliases() {
        return this._config.aliases;
    }
    /*
    public get description() {
        return this._options.get('description')
    }
    public get usage() {
        return this._options.get('usage')
    }
    public get permission() {
        return this._options.get('permission')
    }
    public get permissionMessage() {
        return this._options.get('permission message')
    }
    public get executableBy() {
        return this._options.get('executable by')
    }
    public get cooldown() {
        return this._options.get('cooldown')
    }
    public get cooldownMessage() {
        return this._options.get('cooldown message')
    }
    public get cooldownBypass() {
        return this._options.get('cooldown bypass')
    }
    public get cooldownStorage() {
        return this._options.get('cooldown storage')
    }
    */

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
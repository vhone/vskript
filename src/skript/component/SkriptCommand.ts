import { Range, SymbolKind } from "vscode";
import SkriptFile from "../SkriptFile";
import { SkriptComponent, SkriptComponentBuilder } from "./SkriptComponent";
import { SkriptOptions } from "./SkriptOptions";

export class SkriptCommand extends SkriptComponent {

    constructor(skFile:SkriptFile, range: Range, docs: string[], name: string,
        private readonly _body: string
    ) {
        super(skFile, range, docs, name);
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

        // /^command\s(\/?[^\s]+)((?:\s+?[^\s\:]+)*)\s*?\:/i
        let groups = this._head.match(/^command\s\/?(?<label>[^\s]+)(?<arguments>[^\:]*)/i)?.groups;
        console.log(groups);

        /* 
         * 명령어 구체적으로 나누기
         * [label]
         * [arguemnts]
         * [command option]
         * [trigger]
         */

        return new SkriptCommand(this._skFile, this._range, this._docs, this._head, this._body);
    }
}
import { Position, Range, SymbolKind } from "vscode";
import SkriptFile from "../SkriptFile";
import { SkriptComponent, SkriptComponentBuilder } from "./SkriptComponent";

export class SkriptAliases extends SkriptComponent {

    constructor(skFile: SkriptFile, range: Range, docs: string[], name: string,
        protected readonly _aliases: Map<string,string[]>
    ) {
        super(skFile, range, docs, name);
    }

    public get aliases(): Map<string,string[]> {
        return Object.assign(this._aliases, {});
    }
    public get symbol(): SymbolKind {
        return SymbolKind.Constant;
    }
    public contextOf(_position: Position): string {
        return 'aliases'
    }
    
}

export class SkriptAliasesBuilder extends SkriptComponentBuilder<SkriptAliases> {
    public regExp(): RegExp {
        return /^(?<head>aliases):(.*)(?<body>((\r\n|\r|\n)([^a-zA-Z][^\r\n]*)?)+)/i
    }
    public build(): SkriptAliases | undefined {
        let aliases = new Map<string,string[]>();
        for (const line of this._body.split(/\r\n|\r|\n/i)) {
            let groups = line.match(/^(?:\t|\s{4})*(?<key>[^\=]+)\s*\=\s*(?<values>[^\=]*)/i)?.groups;
            if (groups) {
                aliases.set(groups.key.trim(), groups.values.split(/\s*\,\s*/i));
            }
        }
        return new SkriptAliases(this._skFile, this._range, this._docs, this._head, aliases);
    }
}
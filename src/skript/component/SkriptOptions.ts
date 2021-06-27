import { Position, Range, SymbolKind } from "vscode";
import SkriptFile from "../SkriptFile";
import { SkriptComponent, SkriptComponentBuilder } from "./SkriptComponent";

export class SkriptOptions extends SkriptComponent {

    constructor(_skFile:SkriptFile, _range: Range, _docs: string[], _name:string,
        protected readonly _options: Map<string,string>
    ) {
        super(_skFile, _range, _docs, _name);
    }

    public get options(): Map<string,string> {
        return Object.assign(this._options, {});
    }
    public get symbol(): SymbolKind {
        return SymbolKind.Constant;
    }
    public contextOf(_position: Position): string {
        return 'options'
    }
    
}

export class SkriptOptionsBuilder extends SkriptComponentBuilder<SkriptOptions> {
    public regExp(): RegExp {
        return /^(?<head>options:)(.*)(?<body>((\r\n|\r|\n)([^a-zA-Z][^\r\n]*)?)+)/i;
    }
    public build(): SkriptOptions | undefined {
        let options = new Map<string,string>();
        for (const line of this._body.split(/\r\n|\r|\n/i)) {
            let groups = line.match(/^(?:\t|\s{4})*(?<key>[^\:]+)\s*\:\s*(?<value>[^\:]*)/i)?.groups;
            if (groups)
                options.set(groups.key.trim(), groups.value.trim());
        }
        return new SkriptOptions(this._skFile, this._range, this._docs, this._head, options);
    }
}
import { Range, SymbolKind } from "vscode";
import SkriptFile from "../SkriptFile";
import { SkriptComponent, SkriptComponentBuilder } from "./SkriptComponent";

export class SkriptOptions extends SkriptComponent {

    constructor(_skFile:SkriptFile, _range: Range, _docs: string[], _name:string,
        protected readonly _variables: Map<string,string>
    ) {
        super(_skFile, _range, _docs, _name);
    }

    public get variables(): Map<string,string> {
        return Object.assign(this._variables, {});
    }
    public get symbol(): SymbolKind {
        return SymbolKind.Constant;
    }
    
}

export class SkriptOptionsBuilder extends SkriptComponentBuilder<SkriptOptions> {
    public regExp(): RegExp {
        return /^(?<head>options:)(.*)(?<body>((\r\n|\r|\n)([^a-zA-Z][^\r\n]*)?)+)/i;
    }
    public build(): SkriptOptions | undefined {
        let variables = new Map<string,string>();
        for (const line of this._body.split(/\r\n|\r|\n/i)) {
            let groups = line.match(/^(?:\t|\s{4})*(?<key>[^\:]+)\s*\:\s*(?<value>[^\:]*)/i)?.groups;
            if (groups)
                variables.set(groups.key.trim(), groups.value.trim());
        }
        return new SkriptOptions(this._skFile, this._range, this._docs, this._head, variables);
    }
}
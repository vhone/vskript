import { Range, SymbolKind } from "vscode";
import SkriptFile from "../SkriptFile";
import { SkriptComponent, SkriptComponentBuilder } from "./SkriptComponent";
import { SkriptOption } from "./SkriptOption";

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
        
        let options = this._skFile.components.filter(comp => comp instanceof SkriptOption).reverse();
        // for (const option of this._skFile.components) if (option instanceof SkriptOption) {
        for (const option of options) if (option instanceof SkriptOption) {
            if (option.range.end.isBefore(this._range.start)) for (const key of option.variables.keys()){
                this._head = this._head.replace(`{@${key}}`, `${option.variables.get(key)}`);
            }
        }
        return new SkriptCommand(this._skFile, this._range, this._docs, this._head, this._body);
    }
}
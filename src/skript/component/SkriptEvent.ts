import { Range, SymbolKind } from "vscode";
import SkriptFile from "../SkriptFile";
import { SkriptComponent, SkriptComponentBuilder } from "./SkriptComponent";

export class SkriptEvent extends SkriptComponent {
    
    constructor(_skFile:SkriptFile, _range: Range, _docs: string[], _name: string,
        protected readonly _body: string
    ) {
        super(_skFile, _range, _docs, _name);
    }

    public get body(): string {
        return this._body;
    }
    public get symbol(): SymbolKind {
        return SymbolKind.Event;
    }

}

export class SkriptEventBuilder extends SkriptComponentBuilder<SkriptEvent> {
    public regExp(): RegExp {
        return /^(?<head>on\s([^\:]+))\:(.*)(?<body>((\r\n|\r|\n)([^a-zA-Z][^\r\n]*)?)+)/i
    }
    public build(): SkriptEvent | undefined {
        return new SkriptEvent(this._skFile, this._range, this._docs, this._head, this._body);
    }

}
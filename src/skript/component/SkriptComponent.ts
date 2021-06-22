import { MarkdownString, Range, SymbolKind } from "vscode";
import { SkriptCodeContainer } from "../SkriptCodeCOntainer";
import SkriptFile from "../SkriptFile";

/** SkriptComponent 최상위 클래스 */
export abstract class SkriptComponent {
    
    protected _markdown!: MarkdownString;
    constructor(
        protected readonly _skFile: SkriptFile,
        protected readonly _range: Range,
        protected readonly _docs: string[],
        protected readonly _name: string
    ) {}

    public get range(): Range {
        return this._range;
    }
    public get docs(): string[] {
        return Object.assign(this._docs, {});
    }
    public get name(): string {
        return this._name;
    }
    abstract get symbol(): SymbolKind;

}

export abstract class SkriptComponentBuilder<T> {

    protected _range!: Range;
    protected _docs!: string[];
    protected _head!: string;
    protected _body!: string;

    constructor(
        protected _skFile: SkriptFile
        // protected _script: string
    ) {}

    public setRange(range:Range): SkriptComponentBuilder<T> {
        this._range = range;
        return this;
    }
    public setDocs(docs:string): SkriptComponentBuilder<T> {
		this._docs = new Array<string>();
		for (const line of docs.split(/\r\n|\r|\n/i)) {
			let match = line.match(/(\t|\s)?\#\>\s?(.*)/i);
			if (match) 
                this._docs.push(match[2]);
		}
        return this;
    }
    public setHead(name:string): SkriptComponentBuilder<T> {
        this._head = name;
        return this;
    }
    public setBody(body:string): SkriptComponentBuilder<T> {
        this._body = body;
        return this;
    }
    abstract regExp(): RegExp;
    abstract build(): T | undefined;

}
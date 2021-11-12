import { AsyncLocalStorage } from "node:async_hooks";
import { Range } from "vscode";
import { SkriptLangType } from "../language/SkriptLangType";
import { SkriptType } from "./SkriptType";



export abstract class SkriptExpression {

    protected readonly _range: Range;
    protected readonly _text: string;

    constructor(range: Range, text: string) {
        this._range = range;
        this._text = text;
    }

    public get range(): Range {
        return this._range;
    }
    public get text(): string {
        return this._text;
    }


    public static create(type:SkriptLangType, text:string) {
        console.log(type, text);
        // if (type is )
    }

}

class SkriptExprText extends SkriptExpression {

    

}

export class SkriptExprVariable extends SkriptExpression {

    private readonly _raw: string;
    private readonly _type: number;
    private readonly _isList: boolean;
    
    private _parent?: SkriptExprVariable;
    private _child?: SkriptExprVariable[];

    constructor(range: Range, text: string, raw: string) {
        super(range, text);
        this._raw = raw

        if (raw.match(/^\{\_/)) {
            this._type = 1;
        } else if (raw.match(/^\{\@/)) {
            this._type = 2;
        } else if (raw.match(/^\{\-/)) {
            this._type = 3;
        } else {
            this._type = 0;
        }
        
        if (raw.match(/\*\}$/)) {
            this._isList = true;
        } else {
            this._isList = false;
        }
        
    }

    public get raw(): string {
        return this._raw;
    }

    public get isGlobal(): boolean {
        return this._type === 0;
    }
    public get isLocal(): boolean {
        return this._type === 1;
    }
    public get isOption(): boolean {
        return this._type === 2;
    }
    public get isRuntime(): boolean {
        return this._type === 3;
    }

    public get isList(): boolean {
        return this._isList;
    }
    
    public get parent(): SkriptExprVariable | undefined {
        return this._parent;
    }
    public get child(): SkriptExprVariable[] {
        if (!this._child)
            this._child = new Array<SkriptExprVariable>();
        return this._child;
    }

}
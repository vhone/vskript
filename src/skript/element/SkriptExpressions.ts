import { AsyncLocalStorage } from "node:async_hooks";
import { Range } from "vscode";



export abstract class SkriptExpression {

    protected readonly _range: Range;
    protected readonly _expr: string;

    constructor(range: Range, expr: string) {
        this._range = range;
        this._expr = expr;
    }

    public get range(): Range {
        return this._range;
    }
    public get expr(): string {
        return this._expr;
    }

}

export class SkriptVariable extends SkriptExpression {

    private readonly _raw: string;
    private readonly _type: number;
    private readonly _isList: boolean;
    
    private _parent?: SkriptVariable;
    private _child?: SkriptVariable[];

    constructor(range: Range, expr: string, raw: string) {
        super(range, expr);
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
    
    public get parent(): SkriptVariable | undefined {
        return this._parent;
    }
    public get child(): SkriptVariable[] {
        if (!this._child)
            this._child = new Array<SkriptVariable>();
        return this._child;
    }

}
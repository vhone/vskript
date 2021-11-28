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


export enum SkriptVariableKind {
    GLOVAL,
    LOCAL,
    RUNTIME,
    OPTION
}

export enum SkriptVariableType {
    NORMAL,
    LIST
}

export class SkriptVariable extends SkriptExpression {

    private readonly _raw: string;
    private readonly _kind: SkriptVariableKind;
    private readonly _type: SkriptVariableType;
    
    private _parent?: SkriptVariable;
    private _child?: SkriptVariable[];

    /**
     * 
     * @param range 범위
     * @param expr 적혀 있는 그대로
     * @param raw 실제 사용되는
     */
    constructor(range: Range, expr: string, raw: string) {
        super(range, expr);
        this._raw = raw
        if (raw.match(/^\{\_/)) {
            this._kind = SkriptVariableKind.LOCAL;
        } else if (raw.match(/^\{\@/)) {
            this._kind = SkriptVariableKind.OPTION;
        } else if (raw.match(/^\{\-/)) {
            this._kind = SkriptVariableKind.RUNTIME;
        } else {
            this._kind = SkriptVariableKind.GLOVAL;
        }
        if (raw.match(/\*\}$/)) {
            this._type = SkriptVariableType.LIST;
        } else {
            this._type = SkriptVariableType.NORMAL;
        }
    }

    public get raw(): string {
        return this._raw;
    }
    public get kind(): SkriptVariableKind {
        return this._kind;
    }
    public get type(): SkriptVariableType {
        return this._type;
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
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

    private readonly _rawExpr: string;
    private readonly _kind: SkriptVariableKind;
    private readonly _type: SkriptVariableType;

    constructor(range: Range, expr: string, rawExpr: string) {
        super(range, expr);
        this._rawExpr = rawExpr
        if (rawExpr.match(/^\{\_/)) {
            this._kind = SkriptVariableKind.LOCAL;
        } else if (rawExpr.match(/^\{\@/)) {
            this._kind = SkriptVariableKind.OPTION;
        } else if (rawExpr.match(/^\{\-/)) {
            this._kind = SkriptVariableKind.RUNTIME;
        } else {
            this._kind = SkriptVariableKind.GLOVAL;
        }
        if (rawExpr.match(/\*\}$/)) {
            this._type = SkriptVariableType.LIST;
        } else {
            this._type = SkriptVariableType.NORMAL;
        }
    }

    public get raw(): string {
        return this._rawExpr;
    }
    public get kind(): SkriptVariableKind {
        return this._kind;
    }
    public get type(): SkriptVariableType {
        return this._type;
    }

}
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


export enum SkriptVariableType {
    GLOVAL,
    LOCAL,
    RUNTIME,
    OPTION
}

export class SkriptVariable extends SkriptExpression {

    private readonly _rawExpr: string;
    private readonly _type: SkriptVariableType;

    constructor(range: Range, expr: string, rawExpr: string) {
        super(range, expr);
        this._rawExpr = rawExpr
        if (rawExpr.match(/^\{\_/)) {
            this._type = SkriptVariableType.LOCAL
        } else if (rawExpr.match(/^\{\@/)) {
            this._type = SkriptVariableType.OPTION
        } else if (rawExpr.match(/^\{\-/)) {
            this._type = SkriptVariableType.RUNTIME
        } else {
            this._type = SkriptVariableType.GLOVAL
        }
    }

    public get raw(): string {
        return this._rawExpr;
    }

    public get type(): SkriptVariableType {
        return this._type;
    }

}
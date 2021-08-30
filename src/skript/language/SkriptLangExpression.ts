import { SkriptType } from "../element/SkriptType";
import { SkriptLangType } from "./SkriptLangType";


export abstract class SkriptLangExpression {

    protected readonly _legacy: string;

    constructor(legacy: string) {
        this._legacy = legacy;
    }

    public get legacy(): string {
        return this._legacy;
    }

    abstract get skType(): SkriptType;

}

export class SkriptLangVariable extends SkriptLangExpression {

    private readonly _expr: string;
    private readonly _type: number;
    private readonly _isList: boolean;

    constructor(legacy: string, expr: string) {
        super(legacy);
        this._expr = expr

        if (expr.match(/^\{\_/)) {
            this._type = 1;
        } else if (expr.match(/^\{\@/)) {
            this._type = 2;
        } else if (expr.match(/^\{\-/)) {
            this._type = 3;
        } else {
            this._type = 0;
        }
        
        if (expr.match(/\*\}$/)) {
            this._isList = true;
        } else {
            this._isList = false;
        }
        
    }

    public get expr(): string {
        return this._expr;
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

    public get skType(): SkriptType {
        return SkriptType.value(SkriptLangType.OBJECT, this._isList);
    }

}
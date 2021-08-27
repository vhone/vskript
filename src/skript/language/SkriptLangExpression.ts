import { SkriptType } from "../element/SkriptType";


export abstract class SkriptLangExpression {

    protected readonly _expr: string;

    constructor(expr: string) {
        this._expr = expr;
    }

    public get expr(): string {
        return this._expr;
    }

    abstract get skType(): SkriptType;

}

export class SkriptLangVariable extends SkriptLangExpression {

    private readonly _raw: string;
    private readonly _type: number;
    private readonly _isList: boolean;

    constructor(expr: string, raw: string) {
        super(expr);
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

    public get skType(): SkriptType {
        
    }

}
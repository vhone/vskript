import { SkriptPattern } from "./SkriptPattern";
import { SkriptType } from "../element/SkriptType";
import { SkriptLangType } from "./SkriptLangType";


export class SkriptLangExpression {



    protected readonly _name: string;
    protected readonly _pattern: SkriptPattern;
    protected readonly _type: SkriptLangType

    constructor(name: string, type: SkriptLangType, pattern: SkriptPattern) {
        this._name = name;
        this._pattern = pattern;
        this._type = type
    }

    public get name(): string {
        return this._name;
    }
    public get pattern(): SkriptPattern {
        return this._pattern;
    }
    public get type(): SkriptLangType {
        return this._type;
    }
    // public abstract get type(): SkriptType;



    public static VARIABLE = new SkriptLangExpression('variable', SkriptLangType.OBJECT, SkriptPattern.getPattern('variable')!);
    public static TEXT = new SkriptLangExpression('text', SkriptLangType.TEXT, SkriptPattern.getPattern('text')!);
    // public static EVENT_ENTITY = new SkriptLangExpression('player', SkriptLangType.PLAYER, new SkriptPattern('player', "player"))



}

export class SkriptLangVariable extends SkriptLangExpression {

    private readonly _expr: string;
    private readonly _isList: boolean;

    constructor(expr: string) {
        super(
            expr,
            SkriptLangType.OBJECT,
            SkriptPattern.getPattern('variable')!
            );
        this._expr = expr;

        // if (expr.match(/^\{\_/)) {
        //     this._type = 1;
        // } else if (expr.match(/^\{\@/)) {
        //     this._type = 2;
        // } else if (expr.match(/^\{\-/)) {
        //     this._type = 3;
        // } else {
        //     this._type = 0;
        // }
        
        if (expr.match(/\*\}$/)) {
            this._isList = true;
        } else {
            this._isList = false;
        }
        
    }

    public get expr(): string {
        return this._expr;
    }

    // public get isGlobal(): boolean {
    //     return this._type === 0;
    // }
    // public get isLocal(): boolean {
    //     return this._type === 1;
    // }
    // public get isOption(): boolean {
    //     return this._type === 2;
    // }
    // public get isRuntime(): boolean {
    //     return this._type === 3;
    // }

    public get isList(): boolean {
        return this._isList;
    }

}
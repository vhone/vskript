import { SkriptLangType } from "../language/SkriptLangType";

export class SkriptType {

    private static UNDEFIEND = new SkriptType(SkriptLangType.UNDEFINED, false);
    private static types = (() => {
        // let map = new Map<{type:string, isList:boolean}, SkriptType>();
        let types = new Array<SkriptType>();
        for (const type of SkriptLangType.values()) {
            types.push( new SkriptType(type, true) );
            types.push( new SkriptType(type, false) );
        }
        return types;
    })()

    public static value(type:string): SkriptType;
    public static value(type:SkriptLangType, isList:boolean): SkriptType;
    public static value(arg1:any, arg2?:any): SkriptType {
        let skLangType: SkriptLangType | undefined,
            isList: boolean = false;

        if (typeof arg1 === 'string') {
            skLangType = SkriptLangType.value(arg1);
            isList = arg1.charAt(arg1.length-1) === 's';

        } else if (arg1 instanceof SkriptLangType && typeof arg2 === 'boolean') {
            skLangType = arg1;
            isList = arg2;
        }
        if (skLangType) for (const type of SkriptType.types) {
            if (type.type === skLangType && isList === type._isList) {
                return type
            }
        }

        return SkriptType.UNDEFIEND;
    }
    
    private readonly _type: SkriptLangType;
    private readonly _isList: boolean;

    private constructor(skLangType:SkriptLangType)
    private constructor(skLangType:SkriptLangType, isList:boolean)
    private constructor(skLangType:SkriptLangType, isList?:boolean) {
        this._type = skLangType;
        this._isList = (isList) ? isList : false;
    }

    public get type(): SkriptLangType {
        return this._type;
    }
    public get isList(): boolean {
        return this._isList;
    }
    public get name(): string {
        let name = this._type.name;
        if (this._isList) {
            name = name.replace(/y$/i, 'ie');
            name += 's';
        }
        return name;
    }

}
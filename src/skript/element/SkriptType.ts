import { SkriptLangType } from "../language/SkriptLangType";

export class SkriptType {

    private static types = (() => {
        // let map = new Map<{type:string, isList:boolean}, SkriptType>();
        let map = new Map<string, SkriptType>();
        for (const type of SkriptLangType.values()) {
            map.set(type.name, new SkriptType(type, true));
            // map.set({type:type.name, isList: true}, new SkriptType(type, true));
            // map.set({type:type.name, isList: false}, new SkriptType(type, false));
        }
        console.log(map)
        return map;
    })()

    public static value(type:string): SkriptType {
        let skLangType = SkriptLangType.value(type)
        let isList = (type.charAt(type.length-1) === 's') ? true : false;
        // let skType = this.types.get( {type:skLangType.name, isList:isList} )
        // if (!skType) skType = this.types.get( {type:SkriptLangType.UNDEFINED.name, isList:false} )!
        let skType = this.types.get( skLangType.name )!
        console.log(skType, type, skLangType);
        return skType;
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
    public get text(): string {
        let name = this._type.name;
        if (this._isList) {
            name = name.replace(/y$/i, 'ie');
            name += 's';
        }
        return name;
    }

}
import { Class, JavaObject } from '../../../Java';
import * as StringUtils from '../../util/StringUtils';


export class LegacyType {

	private static TYPES = new Set<LegacyType>();

	private readonly _name: string;
	private readonly _regexp: RegExp | undefined;
	private readonly _parent: string | undefined;

	private constructor(name: string)
	private constructor(name: string, regexp: RegExp)
	private constructor(name: string, regexp: RegExp, parent: string)
	private constructor(name: string, regexp?: RegExp, parent?: string) {
		this._name = name;
		this._regexp = regexp;
		this._parent = parent;
		LegacyType.TYPES.add(this);
	}

	public get name() : string {
		return this._name
	}
	public get skName(): string {
		return this._name.replace('_', ' ').toLowerCase()
	}
	public match(string: string) : boolean {
		return this._regexp && this._regexp.exec(string) ? true : false;
	}

	public static ATTRIBUTE_TYPE 		= new LegacyType('ATTRIBUTE_TYPE', /^attribute\s?types?/i);
    public static BIOME 				= new LegacyType('BIOME', /^biomes?/i);
    public static BLOCK 				= new LegacyType('BLOCK', /^blocks?/i);
    public static BLOCK_DATA 			= new LegacyType('BLOCK_DATA', /^block\s?datas?/i);
    public static BOOLEAN 				= new LegacyType('BOOLEAN', /^booleans?/i);
    public static CAT_TYPE 				= new LegacyType('CAT_TYPE', /^cat\s?types?/i);
    public static CHUNK 				= new LegacyType('CHUNK', /^chunks?/i);
    public static CLICK_TYPE 			= new LegacyType('CLICK_TYPE', /^click\s?types?/i);
    public static COLOUR 				= new LegacyType('COLOUR', /^colou?rs?/i);
    public static COMMAND_SENDER 		= new LegacyType('COMMAND_SENDER', /^(?:command\\s?)?senders?/i);
    public static DAMAGE_CAUSE 			= new LegacyType('DAMAGE_CAUSE', /^damage\scauses?/i);
    public static DATE 					= new LegacyType('DATE', /^dates?/i);
    public static DIFFICULTY 			= new LegacyType('DIFFICULTY', /^difficult(?:y|ys|ies)$/i);
    public static DIRECTION 			= new LegacyType('DIRECTION', /^directions?/i);
    public static ENCHANTMENT 			= new LegacyType('ENCHANTMENT', /^enchantments?/i);
    public static ENCHANTMENT_TYPE 		= new LegacyType('ENCHANTMENT_TYPE', /^enchantment\s?types?/i);
    public static ENTITY 				= new LegacyType('ENTITY', /^entit(?:y|ys|ies)$/i);
    public static ENTITY_TYPE 			= new LegacyType('ENTITY_TYPE', /^entity\s?types?/i);
    public static EXPERIENCE 			= new LegacyType('EXPERIENCE', /^experiences?/i);
    public static FIREWORK_EFFECT 		= new LegacyType('FIREWORK_EFFECT', /^firework\s?effects?/i);
    public static FIREWORK_TYPE 		= new LegacyType('FIREWORK_TYPE', /^firework\s?types?/i);
    public static GAME_MODE 			= new LegacyType('GAME_MODE', /^game\s?modes?/i);
    public static GAMERULE 				= new LegacyType('GAMERULE', /^gamerules?/i);
    public static GAMERULE_VALUE 		= new LegacyType('GAMERULE_VALUE', /^gamerule\s?values?/i);
    public static GENE 					= new LegacyType('GENE', /^gene$/i);
    public static HEAL_REASON 			= new LegacyType('HEAL_REASON', /^heal\s?reasons?/i);
    public static INVENTORY 			= new LegacyType('INVENTORY', /^inventor(?:y|ys|ies)$/i);
    public static INVENTORY_ACTION 		= new LegacyType('INVENTORY_ACTION', /^inventory\s?actions?/i);
    public static INVENTORY_SLOT 		= new LegacyType('INVENTORY_SLOT', /^inventory\s?slots?/i);
    public static INVENTORY_TYPE 		= new LegacyType('INVENTORY_TYPE', /^inventory\s?types?/i);
    public static ITEM 					= new LegacyType('ITEM', /^items?/i);
    public static ITEM_TYPE 			= new LegacyType('ITEM_TYPE', /^item\s?types?/i);
    public static LIVING_ENTITY 		= new LegacyType('LIVING_ENTITY', /^living\s?entit(?:y|ys|ies)$/i);
    public static LOCATION 				= new LegacyType('LOCATION', /^locations?/i);
    public static METADATA_HOLDER 		= new LegacyType('METADATA_HOLDER', /^metadata\s?holders?/i);
    public static MONEY 				= new LegacyType('MONEY', /^mone(?:y|ys|ies)$/i);
    public static NUMBER 				= new LegacyType('NUMBER', /^numbers?/i);
    public static OBJECT 				= new LegacyType('OBJECT', /^objects?/i);
    public static OFFLINE_PLAYER 		= new LegacyType('OFFLINE_PLAYER', /^offline\s?players?/i);
    public static PLAYER 				= new LegacyType('PLAYER', /^players?/i);
    public static POTION_EFFECT 		= new LegacyType('POTION_EFFECT', /^potion\s?effects?/i);
    public static POTION_EFFECT_TYPE 	= new LegacyType('POTION_EFFECT_TYPE', /^potion\s?effect\s?types?/i);
    public static PROJECTILE 			= new LegacyType('PROJECTILE', /^projectiles?/i);
    public static REGION 				= new LegacyType('REGION', /^regions?/i);
    public static RESOURCE_PACK_STATE 	= new LegacyType('RESOURCE_PACK_STATE', /^resource\s?pack\s?states?/i);
    public static SERVER_ICON 			= new LegacyType('SERVER_ICON', /^server\s?icons?/i);
    public static SOUND_CATEGORY 		= new LegacyType('SOUND_CATEGORY', /^sound\s?categor(?:y|ys|ies)$/i);
    public static SPAWN_REASON 			= new LegacyType('SPAWN_REASON', /^spawn\s?reasons?/i);
    public static TELEPORT_CAUSE 		= new LegacyType('TELEPORT_CAUSE', /^teleport\s?causes?/i);
    public static TEXT 					= new LegacyType('TEXT', /^texts?/i);
    public static TIME 					= new LegacyType('TIME', /^times?/i);
    public static TIMEPERIOD 			= new LegacyType('TIMEPERIOD', /^timeperiods?/i);
    public static TIMESPAN 				= new LegacyType('TIMESPAN', /^timespans?/i);
    public static TREE_TYPE 			= new LegacyType('TREE_TYPE', /^tree\s?types?/i);
    public static TYPE 					= new LegacyType('TYPE', /^types?/i);
    public static VECTOR 				= new LegacyType('VECTOR', /^vectors?/i);

	public static NONE = new LegacyType('<none>');

	public static values(): LegacyType[] {
		return Array.from(LegacyType.TYPES)
	}
	
	public static value(string: string) : LegacyType {
		for (const type of LegacyType.values()) {
			if (type.match(string))
				return type;
		}
		return LegacyType.NONE;
	}
		
}





/**
 * 구문 분석에 사용되는 타입
 */
export class SkriptType {

	private readonly _type: LegacyType;
	private readonly _isSingle: boolean;

	constructor(type: LegacyType, isSingle: boolean) {
		this._type = type;
		this._isSingle = isSingle;
	}

	public get type() : LegacyType {
		return this._type;
	}
	
	public get isSingle() : boolean {
		return this._isSingle;
	}

	public get name(): string {
		let name = this._type.skName;
		if (this._isSingle) {
			return name;
		} else {
			if (name.match(/y$/i))
				if (!name.match(/(a|e|o|u|i)y$/i))
					return name.substring(0, name.length - 1) + 'ies';
			if (name.match(/(f|fe)$/i))
				return name.substring(0, name.length - 1) + 'ves';
			if (name.match(/(s|ss|ch|sh|x)$/i))
				return name + 'es';
			return name + 's';
			Object
		}
	}
	
}


export class Type<T> extends JavaObject {

	private readonly _typeClass: Class<T>;
	private readonly _baseName: string;
	private readonly _pluralForms: string[];
	private readonly _literalParser: Function<string, T>;
	private readonly _toStringFunction: Function<Object, string> | undefined;
	private readonly _defaultCharger: Changer<T> | undefined;
	private readonly _arithmetic: Arithmetic<T, any> | undefined;

	constructor(typeClass: Class<T>, baseName: string, pattern: string)
	constructor(typeClass: Class<T>, baseName: string, pattern: string,
		literalParser: Function<String, T>)
	constructor(typeClass: Class<T>, baseName: string, pattern: string,
		literalParser: Function<String, T>,
		toStringFunction:Function<T, string>)
	constructor(typeClass: Class<T>, baseName: string, pattern: string,
		literalParser?: Function<String, T>,
		toStringFunction?:Function<T, string>,
		defaultCharger?: Changer<T>)
	constructor(typeClass: Class<T>, baseName: string, pattern: string,
		literalParser?: Function<String, T>,
		toStringFunction?:Function<T, string>,
		defaultCharger?: Changer<T>,
		arithmetic? : Arithmetic<T, any>) {
			super();
			this._typeClass = typeClass;
			this._baseName = baseName;
			this._pluralForms = StringUtils.getForms(pattern.trim());
			this._literalParser = literalParser ? literalParser : (o:any): string => { return `${o}`}
			this._toStringFunction = toStringFunction ? toStringFunction : undefined;
			this._defaultCharger = defaultCharger ? defaultCharger : undefined;
			this._arithmetic = arithmetic ? arithmetic : undefined; 
		}

	public get typeClass(): Class<T> {
		return this._typeClass;
	}
	public get baseName(): string {
		return this._baseName;
	}
	public get pluralForms(): string[] {
		return this._pluralForms;
	}
	public get toStringFunction(): Function<Object, string> | undefined {
		return this._toStringFunction;
	}
	public get literalParser(): Function<string, T> | undefined {
		return this._literalParser;
	}
	public get defaultChanger(): Changer<T> | undefined {
		return this._defaultCharger;
	}
	public get arithmetic(): Arithmetic<T, any> | undefined {
		return this._arithmetic;
	}

	public withIndefiniteArticle(plural: boolean): string {
		return StringUtils.withIndefiniteArticle(this._pluralForms[plural ? 1 : 0], plural);
	}

	public toString(): string {
		return this._pluralForms[0];
	}

}



interface Function<T, R> {
	apply(t: T): R;
}

interface Changer<T> {
	acceptsChange(mode: ChangeMode): Class<any>[];
	change(thChange: T[], changeWith: any[], mode: ChangeMode): void;
}

enum ChangeMode{
	SET,
	ADD,
	REMOVE,
	DELETE,
	RESET,
	REMOVE_ALL
}

interface Arithmetic<A, R> {
	difference(first: A, second: A): R;
	add(value: A, defference: R): A;
	subtract(value: A, difference: R): A;
	getRelativeType(): Class<R>;
}



export class PatternType<T> extends JavaObject {
	
	private readonly _type: Type<T>;
	private readonly _single: boolean;

	constructor(type: Type<T>, single: boolean) {
		super();
		this._type = type;
		this._single = single;
	}

	public get type(): Type<T> {
		return this.type
	}
	public get isSingle(): boolean {
		return this._single;
	}

	public equals(obj: any): boolean {
		if (super.equals(obj)) {
			return true;
		}
		if (!(obj instanceof PatternType)) {
			return false;
		} else {
			return this._type.equals(obj._type) && this._single === obj._single;
		}
	}

	public toString(): string {
		return this._type.pluralForms[this._single ? 0 : 1];
	}
	
}
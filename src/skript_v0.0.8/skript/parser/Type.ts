import { Class } from '../../../Java';
import * as StringUtils from '../Util/StringUtils';


export class Type {

	private static TYPES = new Set<Type>();

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
		Type.TYPES.add(this);
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

	public static ATTRIBUTE_TYPE 		= new Type('ATTRIBUTE_TYPE', /^attribute\s?types?/i);
    public static BIOME 				= new Type('BIOME', /^biomes?/i);
    public static BLOCK 				= new Type('BLOCK', /^blocks?/i);
    public static BLOCK_DATA 			= new Type('BLOCK_DATA', /^block\s?datas?/i);
    public static BOOLEAN 				= new Type('BOOLEAN', /^booleans?/i);
    public static CAT_TYPE 				= new Type('CAT_TYPE', /^cat\s?types?/i);
    public static CHUNK 				= new Type('CHUNK', /^chunks?/i);
    public static CLICK_TYPE 			= new Type('CLICK_TYPE', /^click\s?types?/i);
    public static COLOUR 				= new Type('COLOUR', /^colou?rs?/i);
    public static COMMAND_SENDER 		= new Type('COMMAND_SENDER', /^(?:command\\s?)?senders?/i);
    public static DAMAGE_CAUSE 			= new Type('DAMAGE_CAUSE', /^damage\scauses?/i);
    public static DATE 					= new Type('DATE', /^dates?/i);
    public static DIFFICULTY 			= new Type('DIFFICULTY', /^difficult(?:y|ys|ies)$/i);
    public static DIRECTION 			= new Type('DIRECTION', /^directions?/i);
    public static ENCHANTMENT 			= new Type('ENCHANTMENT', /^enchantments?/i);
    public static ENCHANTMENT_TYPE 		= new Type('ENCHANTMENT_TYPE', /^enchantment\s?types?/i);
    public static ENTITY 				= new Type('ENTITY', /^entit(?:y|ys|ies)$/i);
    public static ENTITY_TYPE 			= new Type('ENTITY_TYPE', /^entity\s?types?/i);
    public static EXPERIENCE 			= new Type('EXPERIENCE', /^experiences?/i);
    public static FIREWORK_EFFECT 		= new Type('FIREWORK_EFFECT', /^firework\s?effects?/i);
    public static FIREWORK_TYPE 		= new Type('FIREWORK_TYPE', /^firework\s?types?/i);
    public static GAME_MODE 			= new Type('GAME_MODE', /^game\s?modes?/i);
    public static GAMERULE 				= new Type('GAMERULE', /^gamerules?/i);
    public static GAMERULE_VALUE 		= new Type('GAMERULE_VALUE', /^gamerule\s?values?/i);
    public static GENE 					= new Type('GENE', /^gene$/i);
    public static HEAL_REASON 			= new Type('HEAL_REASON', /^heal\s?reasons?/i);
    public static INVENTORY 			= new Type('INVENTORY', /^inventor(?:y|ys|ies)$/i);
    public static INVENTORY_ACTION 		= new Type('INVENTORY_ACTION', /^inventory\s?actions?/i);
    public static INVENTORY_SLOT 		= new Type('INVENTORY_SLOT', /^inventory\s?slots?/i);
    public static INVENTORY_TYPE 		= new Type('INVENTORY_TYPE', /^inventory\s?types?/i);
    public static ITEM 					= new Type('ITEM', /^items?/i);
    public static ITEM_TYPE 			= new Type('ITEM_TYPE', /^item\s?types?/i);
    public static LIVING_ENTITY 		= new Type('LIVING_ENTITY', /^living\s?entit(?:y|ys|ies)$/i);
    public static LOCATION 				= new Type('LOCATION', /^locations?/i);
    public static METADATA_HOLDER 		= new Type('METADATA_HOLDER', /^metadata\s?holders?/i);
    public static MONEY 				= new Type('MONEY', /^mone(?:y|ys|ies)$/i);
    public static NUMBER 				= new Type('NUMBER', /^numbers?/i);
    public static OBJECT 				= new Type('OBJECT', /^objects?/i);
    public static OFFLINE_PLAYER 		= new Type('OFFLINE_PLAYER', /^offline\s?players?/i);
    public static PLAYER 				= new Type('PLAYER', /^players?/i);
    public static POTION_EFFECT 		= new Type('POTION_EFFECT', /^potion\s?effects?/i);
    public static POTION_EFFECT_TYPE 	= new Type('POTION_EFFECT_TYPE', /^potion\s?effect\s?types?/i);
    public static PROJECTILE 			= new Type('PROJECTILE', /^projectiles?/i);
    public static REGION 				= new Type('REGION', /^regions?/i);
    public static RESOURCE_PACK_STATE 	= new Type('RESOURCE_PACK_STATE', /^resource\s?pack\s?states?/i);
    public static SERVER_ICON 			= new Type('SERVER_ICON', /^server\s?icons?/i);
    public static SOUND_CATEGORY 		= new Type('SOUND_CATEGORY', /^sound\s?categor(?:y|ys|ies)$/i);
    public static SPAWN_REASON 			= new Type('SPAWN_REASON', /^spawn\s?reasons?/i);
    public static TELEPORT_CAUSE 		= new Type('TELEPORT_CAUSE', /^teleport\s?causes?/i);
    public static TEXT 					= new Type('TEXT', /^texts?/i);
    public static TIME 					= new Type('TIME', /^times?/i);
    public static TIMEPERIOD 			= new Type('TIMEPERIOD', /^timeperiods?/i);
    public static TIMESPAN 				= new Type('TIMESPAN', /^timespans?/i);
    public static TREE_TYPE 			= new Type('TREE_TYPE', /^tree\s?types?/i);
    public static TYPE 					= new Type('TYPE', /^types?/i);
    public static VECTOR 				= new Type('VECTOR', /^vectors?/i);

	public static NONE = new Type('<none>');

	public static values(): Type[] {
		return Array.from(Type.TYPES)
	}
	
	public static value(string: string) : Type {
		for (const type of Type.values()) {
			if (type.match(string))
				return type;
		}
		return Type.NONE;
	}
		
}





/**
 * 구문 분석에 사용되는 타입
 */
export class SkriptType {

	private readonly _type: Type;
	private readonly _isSingle: boolean;

	constructor(type: Type, isSingle: boolean) {
		this._type = type;
		this._isSingle = isSingle;
	}

	public get type() : Type {
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


class TypeN<T> {

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
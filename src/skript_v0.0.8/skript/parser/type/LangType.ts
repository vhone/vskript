

export enum Type {
    ATTRIBUTE_TYPE = "attribute type",
    BIOME = "biome",
    BLOCK = "block",
    BLOCK_DATA = "block data",
    BOOLEAN = "boolean",
    CAT_TYPE = "cat type",
    CHUNK = "chunk",
    CLICK_TYPE = "click type",
    COLOUR = "colour",
    COMMAND_SENDER = "command sender",
    DAMAGE_CAUSE = "damage cause",
    DATE = "date",
    DIFFICULTY = "difficulty",
    DIRECTION = "direction",
    ENCHANTMENT = "enchantment",
    // ENCHANTMENT_OFFER,
    ENCHANTMENT_TYPE = "enchantment type",
    ENTITY = "entity",
    ENTITY_TYPE = "entity type",
    // ENTITY_TYPE_WITH_AMOUNT,
    EXPERIENCE = "experience",
    FIREWORK_EFFECT = "firework effect",
    FIREWORK_TYPE = "firework type",
    GAME_MODE = "game mode",
    GAMERULE = "gamerule",
    GAMERULE_VALUE = "gamerule value",
    GENE = "gene",
    HEAL_REASON = "heal reason",
    INVENTORY = "inventory",
    INVENTORY_ACTION = "inventory action",
    INVENTORY_SLOT = "inventory slot",
    INVENTORY_TYPE = "inventory type",
    ITEM = "item",
    ITEM_TYPE = "item type",
    LIVING_ENTITY = "living entity",
    LOCATION = "location",
    METADATA_HOLDER = "metadata holder",
    MONEY = "money",
    NUMBER = "number",
    OBJECT = "object",
    OFFLINE_PLAYER = "offline player",
    PLAYER = "player",
    POTION_EFFECT = "potion effect",
    POTION_EFFECT_TYPE = "potion effect type",
    PROJECTILE = "projectile",
    REGION = "region",
    RESOURCE_PACK_STATE = "resource pack state",
    SERVER_ICON = "server icon",
    SOUND_CATEGORY = "sound category",
    SPAWN_REASON = "spawn reason",
    TELEPORT_CAUSE = "teleport cause",
    TEXT = "text",
    TIME = "time",
    TIMEPERIOD = "timeperiod",
    TIMESPAN = "timespan",
    TREE_TYPE = "tree type",
    TYPE = "type",
    VECTOR = "vector",

	NONE = '<none>'
}


/**
 * enum Type이 가지고 있어야할 값들...
 */
class TypeData {
	
	private readonly _type: Type;
	private readonly _pattern: RegExp | undefined;

	constructor(type: Type)
	constructor(type: Type, pattern: RegExp)
	constructor(type: Type, pattern?: RegExp) {
		this._type = type;
		this._pattern = pattern;
	}

	public get type(): Type {
		return this._type;
	}

	public match(string: string) : boolean {
		return this._pattern && this._pattern.exec(string) ? true : false;
	}

}



/**
 * Type을 찾을 때
 */
export class TypeManager {
	
	public static NONE = new TypeData(Type.NONE);

	private static TYPES = [
		new TypeData(Type.ATTRIBUTE_TYPE, 		/^attribute\s?types?/i),
		new TypeData(Type.BIOME, 				/^biomes?/i),
		new TypeData(Type.BLOCK, 				/^blocks?/i),
		new TypeData(Type.BLOCK_DATA, 			/^block\s?datas?/i),
		new TypeData(Type.BOOLEAN, 				/^booleans?/i),
		new TypeData(Type.CAT_TYPE, 			/^cat\s?types?/i),
		new TypeData(Type.CHUNK, 				/^chunks?/i),
		new TypeData(Type.CLICK_TYPE, 			/^click\s?types?/i),
		new TypeData(Type.COLOUR, 				/^colou?rs?/i),
		new TypeData(Type.COMMAND_SENDER, 		/^(?:command\\s?)?senders?/i),
		new TypeData(Type.DAMAGE_CAUSE, 		/^damage\scauses?/i),
		new TypeData(Type.DATE, 				/^dates?/i),
		new TypeData(Type.DIFFICULTY, 			/^difficult(?:y|ys|ies)$/i),
		new TypeData(Type.DIRECTION, 			/^directions?/i),
		new TypeData(Type.ENCHANTMENT, 			/^enchantments?/i),
		new TypeData(Type.ENCHANTMENT_TYPE, 	/^enchantment\s?types?/i),
		new TypeData(Type.ENTITY, 				/^entit(?:y|ys|ies)$/i),
		new TypeData(Type.ENTITY_TYPE, 			/^entity\s?types?/i),
		new TypeData(Type.EXPERIENCE, 			/^experiences?/i),
		new TypeData(Type.FIREWORK_EFFECT, 		/^firework\s?effects?/i),
		new TypeData(Type.FIREWORK_TYPE, 		/^firework\s?types?/i),
		new TypeData(Type.GAME_MODE, 			/^game\s?modes?/i),
		new TypeData(Type.GAMERULE, 			/^gamerules?/i),
		new TypeData(Type.GAMERULE_VALUE, 		/^gamerule\s?values?/i),
		new TypeData(Type.GENE, 				/^gene$/i),
		new TypeData(Type.HEAL_REASON, 			/^heal\s?reasons?/i),
		new TypeData(Type.INVENTORY, 			/^inventor(?:y|ys|ies)$/i),
		new TypeData(Type.INVENTORY_ACTION, 	/^inventory\s?actions?/i),
		new TypeData(Type.INVENTORY_SLOT, 		/^inventory\s?slots?/i),
		new TypeData(Type.INVENTORY_TYPE, 		/^inventory\s?types?/i),
		new TypeData(Type.ITEM, 				/^items?/i),
		new TypeData(Type.ITEM_TYPE, 			/^item\s?types?/i),
		new TypeData(Type.LIVING_ENTITY, 		/^living\s?entit(?:y|ys|ies)$/i),
		new TypeData(Type.LOCATION, 			/^locations?/i),
		new TypeData(Type.METADATA_HOLDER, 		/^metadata\s?holders?/i),
		new TypeData(Type.MONEY, 				/^mone(?:y|ys|ies)$/i),
		new TypeData(Type.NUMBER, 				/^numbers?/i),
		new TypeData(Type.OBJECT, 				/^objects?/i),
		new TypeData(Type.OFFLINE_PLAYER, 		/^offline\s?players?/i),
		new TypeData(Type.PLAYER, 				/^players?/i),
		new TypeData(Type.POTION_EFFECT, 		/^potion\s?effects?/i),
		new TypeData(Type.POTION_EFFECT_TYPE, 	/^potion\s?effect\s?types?/i),
		new TypeData(Type.PROJECTILE, 			/^projectiles?/i),
		new TypeData(Type.REGION, 				/^regions?/i),
		new TypeData(Type.RESOURCE_PACK_STATE, 	/^resource\s?pack\s?states?/i),
		new TypeData(Type.SERVER_ICON, 			/^server\s?icons?/i),
		new TypeData(Type.SOUND_CATEGORY, 		/^sound\s?categor(?:y|ys|ies)$/i),
		new TypeData(Type.SPAWN_REASON, 		/^spawn\s?reasons?/i),
		new TypeData(Type.TELEPORT_CAUSE, 		/^teleport\s?causes?/i),
		new TypeData(Type.TEXT, 				/^texts?/i),
		new TypeData(Type.TIME, 				/^times?/i),
		new TypeData(Type.TIMEPERIOD, 			/^timeperiods?/i),
		new TypeData(Type.TIMESPAN, 			/^timespans?/i),
		new TypeData(Type.TREE_TYPE, 			/^tree\s?types?/i),
		new TypeData(Type.TYPE, 				/^types?/i),
		new TypeData(Type.VECTOR, 				/^vectors?/i)
	];


	public static get(string: string) : Type {
		for (const type of TypeManager.TYPES) {
			if (type.match(string))
				return type.type
		}
		return Type.NONE;
	}


}





/**
 * 구문 분석에 사용되는 타입
 */
export class PatternType {

		
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
		let name = this._type.toString();
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
		}
	}
	
}
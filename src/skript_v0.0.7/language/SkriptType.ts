export enum SkriptLanguageType {
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
    
    UNDEFINED = "undefined"
}

const TYPE_REGEXP: Map<RegExp, SkriptLanguageType> = (() => {
    let map = new Map<RegExp, SkriptLanguageType>();
    map.set(/^attribute\s?types?$/i, SkriptLanguageType.ATTRIBUTE_TYPE);
    map.set(/^biomes?$/i, SkriptLanguageType.BIOME);
    map.set(/^blocks?$/i, SkriptLanguageType.BLOCK);
    map.set(/^block\s?datas?$/i, SkriptLanguageType.BLOCK_DATA);
    map.set(/^booleans?$/i, SkriptLanguageType.BOOLEAN);
    map.set(/^cat\s?types?$/i, SkriptLanguageType.CAT_TYPE);
    map.set(/^chunks?$/i, SkriptLanguageType.CHUNK);
    map.set(/^click\s?types?$/i, SkriptLanguageType.CLICK_TYPE);
    map.set(/^colou?rs?$/i, SkriptLanguageType.COLOUR);
    map.set(/^(?:command\\s?)?senders?$/i, SkriptLanguageType.COMMAND_SENDER);
    map.set(/^damage\scauses?$/i, SkriptLanguageType.DAMAGE_CAUSE);
    map.set(/^dates?$/i, SkriptLanguageType.DATE);
    map.set(/^difficult(?:y|ys|ies)$/i, SkriptLanguageType.DIFFICULTY);
    map.set(/^directions?$/i, SkriptLanguageType.DIRECTION);
    map.set(/^enchantments?$/i, SkriptLanguageType.ENCHANTMENT);
    // map.set(/^enchantment\s?offers?$/i);
    map.set(/^enchantment\s?types?$/i, SkriptLanguageType.ENCHANTMENT_TYPE);
    map.set(/^entit(?:y|ys|ies)$/i, SkriptLanguageType.ENTITY);
    map.set(/^entity\s?types?$/i, SkriptLanguageType.ENTITY_TYPE);
    // map.set(/ /i);
    map.set(/^experiences?$/i, SkriptLanguageType.EXPERIENCE);
    map.set(/^firework\s?effects?$/i, SkriptLanguageType.FIREWORK_EFFECT);
    map.set(/^firework\s?types?$/i, SkriptLanguageType.FIREWORK_TYPE);
    map.set(/^game\s?modes?$/i, SkriptLanguageType.GAME_MODE);
    map.set(/^gamerules?$/i, SkriptLanguageType.GAMERULE);
    map.set(/^gamerule\s?values?$/i, SkriptLanguageType.GAMERULE_VALUE);
    map.set(/^gene$/i, SkriptLanguageType.GENE);
    map.set(/^heal\s?reasons?$/i, SkriptLanguageType.HEAL_REASON);
    map.set(/^inventor(?:y|ys|ies)$/i, SkriptLanguageType.INVENTORY);
    map.set(/^inventory\s?actions?$/i, SkriptLanguageType.INVENTORY_ACTION);
    map.set(/^inventory\s?slots?$/i, SkriptLanguageType.INVENTORY_SLOT);
    map.set(/^inventory\s?types?$/i, SkriptLanguageType.INVENTORY_TYPE);
    map.set(/^items?$/i, SkriptLanguageType.ITEM);
    map.set(/^item\s?types?$/i, SkriptLanguageType.ITEM_TYPE);
    map.set(/^living\s?entit(?:y|ys|ies)$/i, SkriptLanguageType.LIVING_ENTITY);
    map.set(/^locations?$/i, SkriptLanguageType.LOCATION);
    map.set(/^metadata\s?holders?$/i, SkriptLanguageType.METADATA_HOLDER);
    map.set(/^mone(?:y|ys|ies)$/i, SkriptLanguageType.MONEY);
    map.set(/^numbers?$/i, SkriptLanguageType.NUMBER);
    map.set(/^objects?$/i, SkriptLanguageType.OBJECT);
    map.set(/^offline\s?players?$/i, SkriptLanguageType.OFFLINE_PLAYER);
    map.set(/^players?$/i, SkriptLanguageType.PLAYER);
    map.set(/^potion\s?effects?$/i, SkriptLanguageType.POTION_EFFECT);
    map.set(/^potion\s?effect\s?types?$/i, SkriptLanguageType.POTION_EFFECT_TYPE);
    map.set(/^projectiles?$/i, SkriptLanguageType.PROJECTILE);
    map.set(/^regions?$/i, SkriptLanguageType.REGION);
    map.set(/^resource\s?pack\s?states?$/i, SkriptLanguageType.RESOURCE_PACK_STATE);
    map.set(/^server\s?icons?$/i, SkriptLanguageType.SERVER_ICON);
    map.set(/^sound\s?categor(?:y|ys|ies)$/i, SkriptLanguageType.SOUND_CATEGORY);
    map.set(/^spawn\s?reasons?$/i, SkriptLanguageType.SPAWN_REASON);
    map.set(/^teleport\s?causes?$/i, SkriptLanguageType.TELEPORT_CAUSE);
    map.set(/^texts?$/i, SkriptLanguageType.TEXT);
    map.set(/^times?$/i, SkriptLanguageType.TIME);
    map.set(/^timeperiods?$/i, SkriptLanguageType.TIMEPERIOD);
    map.set(/^timespans?$/i, SkriptLanguageType.TIMESPAN);
    map.set(/^tree\s?types?$/i, SkriptLanguageType.TREE_TYPE);
    map.set(/^types?$/i, SkriptLanguageType.TYPE);
    map.set(/^vectors?$/i, SkriptLanguageType.VECTOR);
    return map
})()

export class SkriptType {

    public static create(type:string): SkriptType {
        for(const regex of TYPE_REGEXP.keys()) {
            if (type.match(regex)) {
                let skLangType = TYPE_REGEXP.get(regex)!;
                let isList = (type.charAt(type.length-1) === 's') ? true : false;
                return new SkriptType(skLangType, isList);
            }
        }
        return new SkriptType(SkriptLanguageType.UNDEFINED);
    }
    
    private readonly _type: SkriptLanguageType;
    private readonly _isList: boolean;

    constructor(skLangType:SkriptLanguageType)
    constructor(skLangType:SkriptLanguageType, isList:boolean)
    constructor(skLangType:SkriptLanguageType, isList?:boolean) {
        if (!isList) isList = false;
        this._type = skLangType;
        this._isList = isList;
    }

    get type(): SkriptLanguageType {
        return this._type;
    }
    get isList(): boolean {
        return this._isList;
    }
    get text(): string {
        let name = this._type.toString();
        if (this._isList) {
            name = name.replace(/y$/i, 'ie');
            name += 's';
        }
        return name;
    }

}
export enum SkriptLanguageType {
    ATTRIBUTE_TYPE,
    BIOME,
    BLOCK,
    BLOCK_DATA,
    BOOLEAN,
    CAT_TYPE,
    CHUNK,
    CLICK_TYPE,
    COLOUR,
    COMMAND_SENDER,
    DAMAGE_CAUSE,
    DATE,
    DIFFICULTY,
    DIRECTION,
    ENCHANTMENT,
    // ENCHANTMENT_OFFER,
    ENCHANTMENT_TYPE,
    ENTITY,
    ENTITY_TYPE,
    // ENTITY_TYPE_WITH_AMOUNT,
    EXPERIENCE,
    FIREWORK_EFFECT,
    FIREWORK_TYPE,
    GAME_MODE,
    GAMERULE,
    GAMERULE_VALUE,
    GENE,
    HEAL_REASON,
    INVENTORY,
    INVENTORY_ACTION,
    INVENTORY_SLOT,
    INVENTORY_TYPE,
    ITEM,
    ITEM_TYPE,
    LIVING_ENTITY,
    LOCATION,
    METADATA_HOLDER,
    MONEY,
    NUMBER,
    OBJECT,
    OFFLINE_PLAYER,
    PLAYER,
    POTION_EFFECT,
    POTION_EFFECT_TYPE,
    PROJECTILE,
    REGION,
    RESOURCE_PACK_STATE,
    SERVER_ICON,
    SOUND_CATEGORY,
    SPAWN_REASON,
    TELEPORT_CAUSE,
    TEXT,
    TIME,
    TIMEPERIOD,
    TIMESPAN,
    TREE_TYPE,
    TYPE,
    VECTOR,

    ADDON_OBJECT
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
        return new SkriptType(SkriptLanguageType.ADDON_OBJECT, false);
    }
    
    private readonly _type: SkriptLanguageType;
    private readonly _isList: boolean;

    constructor(skLangType:SkriptLanguageType, isList:boolean) {
        this._type = skLangType;
        this._isList = isList;
    }

    get type(): SkriptLanguageType {
        return this._type;
    }
    get isList(): boolean {
        return this._isList;
    }

}
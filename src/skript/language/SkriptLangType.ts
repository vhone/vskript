
export class SkriptLangType {

    public static ATTRIBUTE_TYPE        = new SkriptLangType("attribute type",    /^attribute\s?types?$/i);
    public static BIOME                 = new SkriptLangType("biome",             /^biomes?$/i);
    public static BLOCK                 = new SkriptLangType("block",             /^blocks?$/i);
    public static BLOCK_DATA            = new SkriptLangType("block data",        /^block\s?datas?$/i);
    public static BOOLEAN               = new SkriptLangType("boolean",           /^booleans?$/i);
    public static CAT_TYPE              = new SkriptLangType("cat type",          /^cat\s?types?$/i);
    public static CHUNK                 = new SkriptLangType("chunk",             /^chunks?$/i);
    public static CLICK_TYPE            = new SkriptLangType("click type",        /^click\s?types?$/i);
    public static COLOUR                = new SkriptLangType("colour",            /^colou?rs?$/i);
    public static COMMAND_SENDER        = new SkriptLangType("command sender",    /^(?:command\\s?)?senders?$/i);
    public static DAMAGE_CAUSE          = new SkriptLangType("damage cause",      /^damage\scauses?$/i);
    public static DATE                  = new SkriptLangType("date",              /^dates?$/i);
    public static DIFFICULTY            = new SkriptLangType("difficulty",        /^difficult(?:y|ys|ies)$/i);
    public static DIRECTION             = new SkriptLangType("direction",         /^directions?$/i);
    public static ENCHANTMENT           = new SkriptLangType("enchantment",       /^enchantments?$/i);
    // public static ENCHANTMENT_OFFER;
    public static ENCHANTMENT_TYPE      = new SkriptLangType("enchantment type",  /^enchantment\s?types?$/i);
    public static ENTITY                = new SkriptLangType("entity",            /^entit(?:y|ys|ies)$/i);
    public static ENTITY_TYPE           = new SkriptLangType("entity type",       /^entity\s?types?$/i);
    // public static ENTITY_TYPE_WITH_AMOUNT;
    public static EXPERIENCE            = new SkriptLangType("experience",        /^experiences?$/i);
    public static FIREWORK_EFFECT       = new SkriptLangType("firework effect",   /^firework\s?effects?$/i);
    public static FIREWORK_TYPE         = new SkriptLangType("firework type",     /^firework\s?types?$/i);
    public static GAME_MODE             = new SkriptLangType("game mode",         /^game\s?modes?$/i);
    public static GAMERULE              = new SkriptLangType("gamerule",          /^gamerules?$/i);
    public static GAMERULE_VALUE        = new SkriptLangType("gamerule value",    /^gamerule\s?values?$/i);
    public static GENE                  = new SkriptLangType("gene",              /^gene$/i);
    public static HEAL_REASON           = new SkriptLangType("heal reason",       /^heal\s?reasons?$/i);
    public static INVENTORY             = new SkriptLangType("inventory",         /^inventor(?:y|ys|ies)$/i);
    public static INVENTORY_ACTION      = new SkriptLangType("inventory action",  /^inventory\s?actions?$/i);
    public static INVENTORY_SLOT        = new SkriptLangType("inventory slot",    /^inventory\s?slots?$/i);
    public static INVENTORY_TYPE        = new SkriptLangType("inventory type",    /^inventory\s?types?$/i);
    public static ITEM                  = new SkriptLangType("item",              /^items?$/i);
    public static ITEM_TYPE             = new SkriptLangType("item type",         /^item\s?types?$/i);
    public static LIVING_ENTITY         = new SkriptLangType("living entity",     /^living\s?entit(?:y|ys|ies)$/i);
    public static LOCATION              = new SkriptLangType("location",          /^locations?$/i);
    public static METADATA_HOLDER       = new SkriptLangType("metadata holder",   /^metadata\s?holders?$/i);
    public static MONEY                 = new SkriptLangType("money",             /^mone(?:y|ys|ies)$/i);
    public static NUMBER                = new SkriptLangType("number",            /^numbers?$/i);
    public static OBJECT                = new SkriptLangType("object",            /^objects?$/i);
    public static OFFLINE_PLAYER        = new SkriptLangType("offline player",    /^offline\s?players?$/i);
    public static PLAYER                = new SkriptLangType("player",            /^players?$/i);
    public static POTION_EFFECT         = new SkriptLangType("potion effect",     /^potion\s?effects?$/i);
    public static POTION_EFFECT_TYPE    = new SkriptLangType("potion effect type",/^potion\s?effect\s?types?$/i);
    public static PROJECTILE            = new SkriptLangType("projectile",        /^projectiles?$/i);
    public static REGION                = new SkriptLangType("region",            /^regions?$/i);
    public static RESOURCE_PACK_STATE   = new SkriptLangType("resource pack state",/^resource\s?pack\s?states?$/i);
    public static SERVER_ICON           = new SkriptLangType("server icon",       /^server\s?icons?$/i);
    public static SOUND_CATEGORY        = new SkriptLangType("sound category",    /^sound\s?categor(?:y|ys|ies)$/i);
    public static SPAWN_REASON          = new SkriptLangType("spawn reason",      /^spawn\s?reasons?$/i);
    public static TELEPORT_CAUSE        = new SkriptLangType("teleport cause",    /^teleport\s?causes?$/i);
    public static TEXT                  = new SkriptLangType("text",              /^texts?$/i);
    public static TIME                  = new SkriptLangType("time",              /^times?$/i);
    public static TIMEPERIOD            = new SkriptLangType("timeperiod",        /^timeperiods?$/i);
    public static TIMESPAN              = new SkriptLangType("timespan",          /^timespans?$/i);
    public static TREE_TYPE             = new SkriptLangType("tree type",         /^tree\s?types?$/i);
    public static TYPE                  = new SkriptLangType("type",              /^types?$/i);
    public static VECTOR                = new SkriptLangType("vector",            /^vectors?$/i);
    public static UNDEFINED             = new SkriptLangType("undefined");

    private readonly _name: string;
    private readonly _pattern: RegExp | undefined;
    private readonly _parent: string | undefined;
    private readonly _child: string[] | undefined;

    private constructor(type:string, pattern?: RegExp, inheritance?:{parent?:string, child?:string[]}) {
        this._name = type;
        this._pattern = pattern;
        this._parent = inheritance?.parent;
        this._child = inheritance?.child;
    }

    public get name(): string {
        return this._name;
    }
    public get pattern(): RegExp | undefined {
        return this._pattern;
    }

    public static value(name:string) {
        for (const value of this.values()) if (value._pattern) {
            if (value._pattern.exec(name)) {
                return value
            }
        }
        return this.UNDEFINED
    }

    public static values() {
        return [
            this.ATTRIBUTE_TYPE,
            this.BIOME,
            this.BLOCK,
            this.BLOCK_DATA,
            this.BOOLEAN,
            this.CAT_TYPE,
            this.CHUNK,
            this.CLICK_TYPE,
            this.COLOUR,
            this.COMMAND_SENDER,
            this.DAMAGE_CAUSE,
            this.DATE,
            this.DIFFICULTY,
            this.DIRECTION,
            this.ENCHANTMENT,
            //this.ENCHANTMENT_OFFER,
            this.ENCHANTMENT_TYPE,
            this.ENTITY,
            this.ENTITY_TYPE,
            //this.ENTITY_TYPE_WITH_AMOUNT,
            this.EXPERIENCE,
            this.FIREWORK_EFFECT,
            this.FIREWORK_TYPE,
            this.GAME_MODE,
            this.GAMERULE,
            this.GAMERULE_VALUE,
            this.GENE,
            this.HEAL_REASON,
            this.INVENTORY,
            this.INVENTORY_ACTION,
            this.INVENTORY_SLOT,
            this.INVENTORY_TYPE,
            this.ITEM,
            this.ITEM_TYPE,
            this.LIVING_ENTITY,
            this.LOCATION,
            this.METADATA_HOLDER,
            this.MONEY,
            this.NUMBER,
            this.OBJECT,
            this.OFFLINE_PLAYER,
            this.PLAYER,
            this.POTION_EFFECT,
            this.POTION_EFFECT_TYPE,
            this.PROJECTILE,
            this.REGION,
            this.RESOURCE_PACK_STATE,
            this.SERVER_ICON,
            this.SOUND_CATEGORY,
            this.SPAWN_REASON,
            this.TELEPORT_CAUSE,
            this.TEXT,
            this.TIME,
            this.TIMEPERIOD,
            this.TIMESPAN,
            this.TREE_TYPE,
            this.TYPE,
            this.VECTOR
            // this.UNDEFINED
        ]
    }
}
import { Range, SymbolKind } from "vscode";
import { SkriptContext } from "./SkriptContext";




export abstract class SkriptCommandOption extends SkriptContext {
    constructor(range:Range,
        private readonly _value:string
    ) {
        super(range)
    }

    abstract get name(): string;
    public get value() {
        return this._value;
    }
    public get symbol() {
        return SymbolKind.Property;
    }

}

// string
export class SkriptCommandAliases extends SkriptCommandOption {
    public get name() {
        return 'alaises'
    }
}

// string
export class SkriptCommandDescription extends SkriptCommandOption {
    public get name() {
        return 'description'
    }
}

// string
export class SkriptCommandUsage extends SkriptCommandOption {
    public get name() {
        return 'usage'
    }
}

// string
export class SkriptCommandPermission extends SkriptCommandOption {
    public get name() {
        return 'permission'
    }
}

// string
export class SkriptCommandPermissionMessage extends SkriptCommandOption {
    public get name() {
        return 'permission message'
    }
}

// [player, conosole, player and console]
export class SkriptCommandExecutableBy extends SkriptCommandOption {
    public get name() {
        return 'executable by'
    }
}

// timespawn
export class SkriptCommandCooldown extends SkriptCommandOption {
    public get name() {
        return 'cooldown'
    }
}

// string
export class SkriptCommandCooldownMessage extends SkriptCommandOption {
    public get name() {
        return 'cooldown message'
    }
}

// string
export class SkriptCommandCooldownBypass extends SkriptCommandOption {
    public get name() {
        return 'cooldown bypass'
    }
}

// string
export class SkriptCommandCooldownStorage extends SkriptCommandOption {
    public get name() {
        return 'cooldown storage'
    }
}
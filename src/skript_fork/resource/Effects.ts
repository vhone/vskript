
class NamespacedKey {

    private readonly _namespace:string;
    private readonly _key;

    constructor(namespace:string, key:string) {
        this._namespace = namespace;
        this._key = key;
    }

    get namespace(): string {
        return this._namespace;
    }
    get key(): string {
        return this._key;
    }
    public toString(): string {
        return this._namespace + ':' + this._key
    }
}

/**
 * 1. 띄어쓰기로 어절 자르기
 * 2. %익스프레션%
 * 2. %~나열형 익스프레션%
 * 3. [생략옵션]
 * 4. (선택옵션)
 * 5. 
 */
// class SkriptLanguagePattern {

//     private readonly _legacy: string;
//     private readonly _components: string;

//     constructor(legacyPattern:string) {
//         this._legacy = legacyPattern;
//         let map = 
//     }

// }

class SkriptLanguageEffect {

    private readonly _namespacedKey: NamespacedKey;
    private readonly _patterns: string[];
    
    constructor(namespacedKey:NamespacedKey, ...patterns:string[]) {
        this._namespacedKey = namespacedKey;
        this._patterns = patterns;
    }

    get key(): NamespacedKey {
        return this._namespacedKey;
    }
    get patterns(): string[] {
        return this._patterns;
    }

    public next(_code:string): string {
        for (const pattern of this._patterns) {
            
        }
        return 'a';
    }

}


export const EFFECTS: SkriptLanguageEffect[] = [
    // send - [the] - action bar - [with text] - %text% - to - %text%
    new SkriptLanguageEffect(new NamespacedKey('skript', 'EffActionBar'),
        'send [the] action bar [with text] %text% to %players%'
    ),
    new SkriptLanguageEffect(new NamespacedKey('skript', 'EffBan'),
        'ban %texts/offline players% [(by reason of|because [of]|on account of|due to) %text%] [for %time span%]',
        'unban %texts/offline players%',
        'ban %players% by IP [(by reason of|because [of]|on account of|due to) %text%] [for %time span%]',
        'unban %players% by IP',
        'IP(-| )ban %players% [(by reason of|because [of]|on account of|due to) %text%] [for %time span%]',
        '(IP(-| )unban|un[-]IP[-]ban) %players%'
    ),
    new SkriptLanguageEffect(new NamespacedKey('skript', 'EffBreakNaturally'),
        'break %blocks% [naturally] [using %item type%]'
    ),
    new SkriptLanguageEffect(new NamespacedKey('skript', 'EffBroadcast'),
        'broadcast %objects% [(to|in) %worlds%]'
    ),
    new SkriptLanguageEffect(new NamespacedKey('skript', 'EffCancelCooldown'),
        '(cancel|ignore) [the] [current] [command] cooldown',
        'un(cancel|ignore) [the] [current] [command] cooldown'
    ),
    new SkriptLanguageEffect(new NamespacedKey('skript', 'EffCancelDrops'),
        '(cancel|clear|delete) [the] drops [of (items|[e]xp[erience][s])]',
        '(cancel|clear|delete) [the] (item|[e]xp[erience]) drops'
    ),
    new SkriptLanguageEffect(new NamespacedKey('skript', 'EffCancelEvent'),
        'cancel [the] event',
        'uncancel [the] event'
    ),
    new SkriptLanguageEffect(new NamespacedKey('skript', 'EffChange'),
        '(add|give) %objects% to %~objects%',
        'increase %~objects% by %objects%',
        'give %~objects% %objects%',
        'set %~objects% to %objects%',
        'remove (all|every) %objects% from %~objects%',
        '(remove|subtract) %objects% from %~objects%',
        'reduce %~objects% by %objects%',
        '(delete|clear) %~objects%',
        'reset %~objects%'
    ),
    
];
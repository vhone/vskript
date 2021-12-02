import { SkriptType } from './Type';

// https://github.com/SkriptLang/skript-parser/blob/8a5e504b9bee37b7954b22468b9790f2e0ac5787/src/main/java/io/github/syst3ms/skriptparser/pattern/PatternParser.java
// PatternParser가 Docs Pattern 분석함

export class SkriptExpression {

	private readonly _type: SkriptType;

	constructor(type: SkriptType) {
		this._type = type;
	}

	public get type(): SkriptType {
		return this._type;
	}

}















// interface PatternResult {
//     pattern_name: string,
//     index: number,
//     text: string
// }

// export abstract class Pattern {

//     protected readonly _name: string;
//     protected readonly _include = new Set<string>();

//     protected constructor(name:string) {
//         this._name = name;
//     }

//     get name(): string {
//         return this._name;
//     }

//     public addInclude(...names: string[]): Pattern {
//         for(const name of names) {
//             this._include.add(name);
//         }
//         return this;
//     }

//     abstract exec(text: string): PatternResult | undefined
//     abstract getLastIndex(): number;
//     abstract setLastIndex(i: number): void;



//     private static readonly _repository = new Map<string,Pattern>();
    
//     public static create(name:string, opener:string, closer:string, escape?:string[]): Pattern;
//     public static create(name:string, rexexp:string): Pattern;
//     public static create(name:any, arg1:string, arg2?:string, arg3?:string[]): Pattern {
//         if (!arg2) {
//             return new PatternRegexp(name, arg1);
//         } else {
//             return new SkriptPatternBracket(name, arg1, arg2, arg3);
//         }
//     }

//     public static register(...patterns:Pattern[]) {
//         for (const pattern of patterns) {
//             Pattern._repository.set(pattern.name, pattern);
//         }
//     }

//     public static find(name:string): Pattern | undefined
//     public static find(arg:any): Pattern | undefined {
//         if (typeof arg === 'string')
//             return this._repository.get(arg);
//         else
//             return
//     }   

// }



// /**
//  * 하나의 정규식으로 일치하는 글자를 찾는 패턴
//  */
// class PatternRegexp extends Pattern {
    
//     private readonly _regexp;

//     constructor(name: string, regexp: string) {
//         super(name)
//         this._regexp = new RegExp(regexp, 'g');
//     }
    
//     public getLastIndex(): number {
//         return this._regexp.lastIndex;
//     }
//     public setLastIndex(i: number) {
//         this._regexp.lastIndex = i;
//     }
    
//     public exec(text: string): PatternResult | undefined {
//         let match = this._regexp.exec(text);
//         return ( match ) ? { pattern_name:this._name, index: match.index, text: match[0] } : undefined;
//     }

// }



// /**
//  * 여는/닫는 브라켓으로 일치하는 글자를 찾는 패턴
//  */
// class SkriptPatternBracket extends Pattern {

//     private readonly _opener: RegExp;
//     private readonly _closer: RegExp;
//     private readonly _escape: RegExp[] | undefined;

//     private _lastIndex: number = 0;

//     constructor(name: string, opener:string, closer:string, escape?:string[]) {
//         super(name)
//         this._opener = new RegExp(opener, 'g');
//         this._closer = new RegExp(closer, 'g');
//         if (escape) {
//             let array = new Array<RegExp>();
//             for (const e of escape) {
//                 array.push(new RegExp(e, 'g'))
//             }
//             if (array.length > 0) {
//                 this._escape = array;
//             }
//         }
//     }

//     public getLastIndex(): number {
//         return this._lastIndex;
//     }
//     public setLastIndex(i:number) {
//         this._lastIndex = i;
//     }

//     public exec(text: string, index?:number): PatternResult | undefined {
//         let start = (index) ? index : this._lastIndex;
//         let end = start;

//         // Opener
//         this._opener.lastIndex = start;
//         let matchOpener = this._opener.exec(text);
//         if (!matchOpener) {
//             return
//         } else {
//             start = matchOpener.index;
//             end = this._opener.lastIndex;
//         }

//         // Closer
//         this._closer.lastIndex = end;
//         let matchCloser = this._closer.exec(text);
//         if (!matchCloser) {
//             return
//         } else {
//             end = this._closer.lastIndex;
//         }
        
//         let subStart = start + 1;
//         let existEscape = true
//         let existInclude = true;
//         while (existEscape || existInclude) {
            
//             // Escape
//             existEscape = false;
//             if (this._escape) for (const escape of this._escape) {
//                 escape.lastIndex = subStart;
//                 let matchEscape
//                 while(matchEscape = escape.exec(text)) {

//                     if (matchEscape.index >= this._closer.lastIndex) {
//                         break;
//                     }

//                     subStart = escape.lastIndex;
                    
//                     this._closer.lastIndex = subStart;
//                     let matchCloser = this._closer.exec(text);
//                     if (!matchCloser) {
//                         return;
//                     } else {
//                         end = this._closer.lastIndex;
//                         existEscape = true;
//                     }
//                 }
//             }
    
//             // Include
//             existInclude = false;
//             for (const name of this._include) {
//                 let include = Pattern.find(name);
//                 if (!include) continue
                
//                 if (include instanceof PatternRegexp) {
//                     include.setLastIndex(subStart);

//                 } else if (include instanceof SkriptPatternBracket) {
    
//                     // Include Opener
//                     include._opener.lastIndex = subStart;
//                     let matchIncludeOpener
//                     while (matchIncludeOpener = include._opener.exec(text)) {

//                         if (matchIncludeOpener.index >= this._closer.lastIndex) {
//                             break;
//                         }

//                         include._lastIndex = matchIncludeOpener.index;
//                         let search = include.exec(text);
//                         subStart = include._lastIndex;

//                         // This Closer
//                         this._closer.lastIndex = subStart;
//                         let matchCloser = this._closer.exec(text);
//                         if (!matchCloser) {
//                             return;
//                         } else {
//                             end = this._closer.lastIndex;
//                             existInclude = true;
//                         }
                        
//                         // Include Opener
//                         include._opener.lastIndex = subStart;
    
//                     } 
//                 }
//             }
//         }

//         this._lastIndex = end;
//         return { pattern_name:this._name, index: start, text: text.substring(start, end) };

//     }


// }

// class SkriptPatternExpression extends Pattern {
    
//     private _lastIndex = 0;

//     constructor(name: string, _patterns:string[]) {
//         super(name)
//     }

//     public getLastIndex(): number {
//         return this._lastIndex;
//     }
//     public setLastIndex(i: number): void {
//         this._lastIndex = i;
//     }

//     public exec(_text: string): PatternResult | undefined {
//         throw new Error("Method not implemented.");
//     }

// }


// const text = Pattern.create('expr.text', '"', '"', ['""', '%%'])
//     .addInclude('expr.nested_expression');

// const variable = Pattern.create('expr.variable', '{', '}')
//     .addInclude('expr.nested_expression');

// const nested = Pattern.create('expr.nested_expression', '%', '%')
//     .addInclude('expr.text')
//     .addInclude('expr.variable');
    
// // const exprEntity = SkriptPattern.create('expr.entity',
// //     new SkriptParser('[event-]entity'));

// Pattern.register(text, variable, nested);
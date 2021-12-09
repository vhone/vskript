import { Class } from "../../../Java";
import { Pair } from "../Util/Pair";
import { CodeSection, Statement, SyntaxElement, TriggerContext } from "./lang";
import { PatternElement } from "./Pattern";


// export class MatchContext {

// 	private readonly originalPattern: string;
// 	private readonly originalElement: PatternElement;
// 	// private readonly parserState: ParserState;
// 	private readonly source: MatchContext;
// 	// private readonly parsedExpressions: Expression<?>[] = [];
// 	// private readonly regexMatches: MatchResult[] = [];
// 	private readonly marks: string[] = [];
// 	private patternIndex:number = 0;

// 	constructor(element: PatternElement/*, parserState: ParserState*/)
// 	constructor(element: PatternElement/*, parserState: ParserState*/, source: MatchContext)
// 	constructor(element: PatternElement/*, parserState: ParserState*/, source?: MatchContext) {
// 		this.originalPattern = element
// 	}

// }



/**
 * An object that stores data about how an object was parsed.
 * By opposition to {@link MatchContext}, this object is immutable, and generated after matching is complete.
 * @see Expression#init(Expression[], int, ParseContext)
 */
export class ParseContext {

	private readonly _parserState: ParserState;
	private readonly _element: PatternElement;
	private readonly _expressionString: string;
	private readonly _matches: RegExpMatchArray[];
	private readonly _marks: string[];

	constructor(parserState: ParserState, element: PatternElement, matches: RegExpMatchArray[], marks: string[], expressionString: string) {
		this._parserState = parserState;
		this._element = element;
		this._expressionString = expressionString;
		this._matches = matches;
		this._marks = marks;
	}

	public get matches(): RegExpMatchArray[] {
		return this._matches;
	}
	public get element(): PatternElement {
		return this._element;
	}
	public get marks(): string[] {
		return this._marks;
	}
	public get numericMark(): number {
		let numeric = 0;
		for (const mark of this._marks) {
			try {
				if (mark.startsWith('0b')) {0
					numeric ^= Number.parseInt(mark.substring('0b'.length), 2);
				} else if (mark.startsWith('0x')) {
					numeric ^= Number.parseInt(mark.substring('0x'.length), 16);
				} else {
					numeric ^= Number.parseInt(mark);
				}
			} catch (error) {}
		}
		return numeric;
	}
	public hasMark(parseMark: string): boolean {
		return this._marks.includes(parseMark);
	}
	public get expressionString(): string {
		return this._expressionString;
	}
	public get parserState(): ParserState {
		return this._parserState;
	}

}



/**
 * An object that stores data about the current parsing, on the scale of the entire trigger.
 */
export class ParserState {

	private _currentContexts = new Set<Class<TriggerContext>>();
	private readonly _currentSections = new Array<CodeSection>();
	private readonly _currentStatements = new Array<Array<Statement>>();
	private readonly _restrictions = new Array<Pair<Set<Class<SyntaxElement>>, boolean>>();

	constructor() {
		this._currentStatements.push(new Array<Statement>());
		this._restrictions.push(new Pair<Set<Class<SyntaxElement>>, boolean>(
			new Set<Class<SyntaxElement>>(), false
		));
	}
	
}
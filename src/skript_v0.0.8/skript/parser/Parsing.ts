import { Class } from "../../../Java";
import { Pair } from "../Util/Pair";
import { RecentElementList } from "../Util/RecentElementList";
import { FileSection } from "./File";
import { CodeSection, Expression, Statement, SyntaxElement, Trigger, TriggerContext } from "./lang";
import { PatternElement } from "./Pattern";
import { SkriptEventInfo, SyntaxManager } from "./Registration";


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


// https://github.com/SkriptLang/skript-parser/blob/master/src/main/java/io/github/syst3ms/skriptparser/parsing/SyntaxParser.java
/**
 * Contains the logic for parsing and interpreting single statements, sections and expressions inside of a script.
 */
export class SyntaxParser {

	private static readonly _recentEvents: RecentElementList<SkriptEventInfo<any>> = new RecentElementList<SkriptEventInfo<any>>();

	public static parseTrigger(section: FileSection): UnloadedTrigger | undefined {
		if (section.content.length === 0) {
			return;
		}
		for (let recentEvent of this._recentEvents.mergeWith(SyntaxManager.getEvents())) {
			let trigger = _matchEventInfo(section. recentEvent);
			if (trigger) {
				this._recentEvents.acknowledge(recentEvent);
				return trigger;
			}
		}

		console.log("No trigger matching '" + section.getLineContent() + "' was found");
		return;

	}

}

function _matchEventInfo(section: FileSection, info: SkriptEventInfo<any>): UnloadedTrigger {
	let patterns = info.patterns;
	for (var i = 0; i < patterns.length; i++) {
		let element = patterns[i];
		let parserState = new ParserState();
		let parser = new MatchContext(element, parserState);
		if (element.match(section.content, 0, parser) != -1) {
			try {
				let sec = new info.syntaxClass;
				if (sec)
			}
		}
	}
}



class UnloadedTrigger {

	private readonly _trigger: Trigger;
	private readonly _section: FileSection;
	private readonly _line: number;
	private readonly _eventinfo: SkriptEventInfo<any>;
	private readonly _parserState: ParserState;

	constructor(trigger: Trigger, section: FileSection, line: number, eventInfo:SkriptEventInfo<any>, parserState: ParserState) {
		this._trigger = trigger;
		this._section = section;
		this._line = line;
		this._eventinfo = eventInfo;
		this._parserState = parserState;
	}

	
	public get trigger() : Trigger {
		return this._trigger;
	}
	public get section() : FileSection {
		return this._section;
	}
	public get line() : number {
		return this._line;
	}
	public get eventInfo() : SkriptEventInfo<any> {
		return this._eventinfo;
	}
	public get parserState() : ParserState {
		return this._parserState;
	}
	

}



// https://github.com/SkriptLang/skript-parser/blob/master/src/main/java/io/github/syst3ms/skriptparser/parsing/MatchContext.java
/**
 * An object that provides contextual information during syntax matching.
 */
export class MatchContext {

	private readonly _originalPattern: string;
	private readonly _originalElement: PatternElement;
	private readonly _parserState: ParserState;
	private readonly _source: MatchContext | undefined ;
	private readonly _parsedExpressions: Expression<any>[] = [];
	private readonly _regexMatches: RegExpMatchArray[]= [];
	private _patternIndex: number = 0;
	private readonly _marks: string[] = [];

	constructor(e: PatternElement, parserState: ParserState)
	constructor(e: PatternElement, parserState: ParserState, source: MatchContext)
	constructor(e: PatternElement, parserState: ParserState, source?: MatchContext) {
		this._originalPattern = e.toString();
		this._originalElement = e;
		this._parserState = parserState;
		this._source = source;
	}

	public get originalPattern() : string {
		return this._originalPattern;
	}
	public get originalElement(): PatternElement {
		return this._originalElement;
	}
	public get patternIndex() : number {
		return this._patternIndex;
	}
	public get parsedExpression(): Expression<any>[] {
		return this._parsedExpressions;
	}
	public get regexMatch(): RegExpMatchArray[] {
		return this._regexMatches;
	}
	public get marks(): string[] {
		return this._marks;
	}
	public get parserState(): ParserState {
		return this._parserState;
	}
	
	public branch(e: PatternElement): MatchContext {
		return new MatchContext(e, this._parserState, this);
	}

	public merge(branch: MatchContext) {
		this._parsedExpressions.push(...branch._parsedExpressions);
		this._regexMatches.push(...branch._regexMatches);
		this._marks.push(...branch._marks);
	}

	public toParseResult(): ParseContext {
		return new ParseContext(
			this._parserState,
			this._originalElement,
			this._regexMatches,
			this._marks,
			this._originalPattern
		);
	}
	
}
import { Uri } from "vscode";
import { Class } from "../../../Java";
import { MultiMap } from "../../util/MultyMap";
import { Pair } from "../../util/Pair";
import { RecentElementList } from "../../util/RecentElementList";
import { FileElement, FileParser, FileSection, VoidElement } from "./File";
import { CodeSection, Expression, SkriptEvent, Statement, SyntaxElement, Trigger, TriggerContext, UnloadedTrigger } from "./lang";
import { PatternElement } from "./Pattern";
import { SkriptEventInfo, SyntaxManager } from "./Registration";
import { FileUtils } from '../../util/FileUtils';
import * as Path from 'path'; 
import { LogEntry, SkriptLogger } from "./Log";



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



// https://github.com/SkriptLang/skript-parser/blob/master/src/main/java/io/github/syst3ms/skriptparser/parsing/ParserState.java
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
	
	/**
	 * @return the {@link TriggerContext}s handled by the currently parsed event
	 */
	public getCurrentContexts(): Set<Class<TriggerContext>> {
		return this._currentContexts;
	}

	/**
	 * Sets the {@link TriggerContext}s handled by the currently parsed event
	 * @param currentContexts the handled {@link TriggerContext}s
	 */
	public setCurrentContexts(currentContexts: Set<Class<TriggerContext>>) {
		this._currentContexts = currentContexts;
	}

	/**
	 * @return a list of all enclosing {@linkplain CodeSection}s, with the closest one first
	 */
	public getCurrentSections(): CodeSection[] {
		return new Array(...this._currentSections);
	}

	/**
	 * Adds a new enclosing {@link CodeSection} to the hierarchy
	 * @param section the enclosing {@link CodeSection}
	 */
	public addCurrentSection(section: CodeSection) {
		this._currentSections.unshift(section);
	}

	/**
     * Removes the current section from the hierarchy, after all parsing inside it has been completed.
     */
	public removeCurrentSection() {
		this._currentSections.shift();
	}

    /**
     * Returns a list of all consecutive, successfully parsed {@linkplain Statement}s
     * in the enclosing section.
     * This is essentially a list with all previously parsed items of this section.
     * @return a list of all {@linkplain Statement}s in the enclosing section.
     */
	 public getCurrentStatements(): Statement[] {
        return this._currentStatements[this._currentStatements.length - 1];
    }

    /**
     * Adds a new {@link Statement} to the items of the enclosing section.
     * @param statement the enclosing {@link Statement}
     */
    public addCurrentStatement(statement: Statement) {
        this._currentStatements[this._currentStatements.length - 1].push(statement);
    }

    /**
     * Uses recursion to allow items of a new enclosing section to be added, preserving
     * the current items to be used when the {@linkplain #callbackCurrentStatements() callback}
     * has been invoked.
     */
    public recurseCurrentStatements() {
        this._currentStatements.push(new Array<Statement>());
    }

    /**
     * Clears all stored items of this enclosing section,
     * after all parsing inside it has been completed.
     */
    public callbackCurrentStatements() {
        this._currentStatements.pop();
    }

    /**
     * Define the syntax restrictions enforced by the current section
     * @param allowedSyntaxes all allowed syntaxes
     * @param restrictingExpressions whether expressions are also restricted
     */
    public setSyntaxRestrictions(allowedSyntaxes: Set<Class<SyntaxElement>>, restrictingExpressions: boolean) {
        this._restrictions.push(new Pair<Set<Class<SyntaxElement>>, boolean>(allowedSyntaxes, restrictingExpressions));
    }

    /**
     * Clears the previously enforced syntax restrictions
     */
    public clearSyntaxRestrictions() {
        this._restrictions.pop();
    }

    /**
     * @param c the class of the syntax
     * @return whether the current syntax restrictions forbid a given syntax or not
     */
    public forbidsSyntax(c: Class<SyntaxElement>): boolean {
        var allowedSyntaxes = this._restrictions[this._restrictions.length - 1].first;
        return allowedSyntaxes.size > 0 && ![...allowedSyntaxes.values()].includes(c);
    }

    /**
     * @return whether the current syntax restrictions also apply to expressions
     */
    public isRestrictingExpressions(): boolean {
        return this._restrictions[this._restrictions.length - 1].second;
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
			let trigger = _matchEventInfo(section, recentEvent);
			if (trigger) {
				this._recentEvents.acknowledge(recentEvent);
				return trigger;
			}
		}
		console.log("No trigger matching '" + section.content + "' was found");
		return;
	}

}

function _matchEventInfo(section: FileSection, info: SkriptEventInfo<any>): UnloadedTrigger | undefined {
	let patterns = info.patterns;
	for (var i = 0; i < patterns.length; i++) {
		let element = patterns[i];
		let parserState = new ParserState();
		let parser = new MatchContext(element, parserState);
		if (element.match(section.content, 0, parser) != -1) {
			try {
				let event = new info.syntaxClass;
				if (event instanceof SkriptEvent
					&& event.init(parser.parsedExpression, i, parser.toParseResult())) {
					continue;
				}
				let trig = new Trigger(event);
				parserState.setCurrentContexts(info.contexts);
				/*
				* We don't actually load the trigger here, that will be left to the loading priority system
				*/
				var line = 0;
				return new UnloadedTrigger(trig, section, line, info, parserState);
			} catch (error) {
				console.log("Couldn't instantiate class " + info.syntaxClass);
			}
		}
	}
	return;
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



// https://github.com/SkriptLang/skript-parser/blob/master/src/main/java/io/github/syst3ms/skriptparser/parsing/ScriptLoader.java
/**
 * Contains the logic for loading, parsing and interpreting entire script files
 */
export class ScriptLoader {

	private static readonly triggerMap = new  MultiMap<string, Trigger>();

    /**
     * Parses and loads the provided script in memory
     * @param scriptPath the script file to load
     * @param debug whether debug is enabled
     */
	public static loadScript(scriptPath: Uri, debug: boolean): LogEntry[] {
		let logger = new SkriptLogger(debug);
		let elements: FileElement[];
		let scriptName: string;
		try{ 
			let lines = FileUtils.readAllLines(scriptPath.fsPath);
			scriptName = Path.basename(scriptPath.fsPath).replace(/(.+)\..+/, "$1");
			elements = FileParser.parseFileLines(scriptName, lines, 0 , 1);
			logger.finalizeLogs();
		} catch (error) {
			console.log(error);
			return [];
		}
		logger.setFileInfo(Path.basename(scriptPath.fsPath), elements);
		let unloadedTriggers: UnloadedTrigger[] = [];
		for (const element of elements) {
			logger.finalizeLogs();
			logger.nextLine();
			if (element instanceof VoidElement) {
				continue;
			} else if (element instanceof FileSection) {
				let trig = SyntaxParser.parseTrigger(element);
				if (trig) {
					logger.setLine(logger.getLine() + element.length);
					unloadedTriggers.push(trig);
				}
			} else {
				console.log(
					"Can't have code outside of a trigger",
					// ErrorType.STRUCTURE_ERROR,
					"Code always starts with a trigger (or event). Refer to the documentation to see which event you need, or indent this line so it is part of a trigger"
				);
			}
		}
		unloadedTriggers.sort((a, b) => b.trigger.event.getLoadingPriority() - a.trigger.event.getLoadingPriority())
		for (const uloaded of unloadedTriggers) {
			
		}
		return [];
	}

    /**
     * Parses all items inside of a given section.
     * @param section the section
     * @param logger the logger
     * @return a list of {@linkplain Statement effects} inside of the section
     */
	public static loadItems(section: FileSection, parserState: ParserState): Statement[] {
		return [];
	}

}
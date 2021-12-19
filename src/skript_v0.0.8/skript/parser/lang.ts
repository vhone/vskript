import { Class } from "../../../Java";
import { FileSection } from "./File";
import { SkriptLogger } from "./Log";
import { ParseContext, ParserState, ScriptLoader } from "./Parsing";
import { SkriptEventInfo } from "./Registration";


export abstract class SyntaxElement {

	abstract init(expressions: Expression<any>[], matchedPattern: number, parseContext: ParseContext): boolean;

	abstract toString(ctx: TriggerContext, debug: boolean): string;

	public static checkIsSection(parseContext: ParseContext, _isStrict: boolean, ..._requiredSections: Class<CodeSection>[]): boolean {
		let currentSections = parseContext.parserState
		return true;
	}

}



// https://github.com/SkriptLang/skript-parser/blob/master/src/main/java/io/github/syst3ms/skriptparser/lang/SkriptEvent.java
/**
 * The entry point for all code in Skript. Once an event triggers, all of the code inside it may be run.
 *
 * Skript-parser's event system is composed of three interacting parts : {@link Trigger}, {@link SkriptEvent} and {@link TriggerContext}.
 * This is directly parallel to Skript's event system, with Bukkit's own Event class replacing TriggerContext.
 *
 * Let's explain how this system works using a simple analogy : skript-parser is like a giant kitchen :
 * <ul>
 *   <li>The goal is to prepare food (write code).</li>
 *   <li>There are many different types of food to prepare ({@link TriggerContext}s).</li>
 *   <li>There are different means of actually preparing the food (different {@link SkriptEvent}s), each one being specific to one or more types of food</li>
 *   <li>Finally, in order to make the recipe come together, one needs the physical, tangible tools to achieve that ({@link Trigger}s)</li>
 * </ul>
 */
export abstract class SkriptEvent implements SyntaxElement {

    /**
     * Whether this event should trigger, given the {@link TriggerContext}
     * @param ctx the TriggerContext to check
     * @return whether the event should trigger
     */
	public abstract check(ctx: TriggerContext): boolean;

	public loadSection(section: FileSection, parserState: ParserState) {
		return ScriptLoader.loadItems(section, parserState);
	}

	/**
     * For virtually all programming and scripting languages, the need exists to have functions in order to not repeat
     * code too often. Skript is no exception, however, by default, every trigger is loaded in the order it appears in the file,
     * This is undesirable if we don't want the restriction of having to declare functions before using them. This is especially
     * counter-productive if we're dealing with multiple scripts.
     *
     * To solve this problem, {@link Trigger triggers} with with a higher loading priority number will be loaded first.
     *
     * @return the loading priority number. 0 by default
     */
	public getLoadingPriority(): number {
		return 0;
	}

	abstract init(expressions: Expression<any>[], matchedPattern: number, parseContext: any): boolean;
	abstract toString(ctx: TriggerContext, debug: boolean): string;
	abstract checkIsSection(parseContext: any, isStrict: boolean, ...requiredSections: any): boolean;

}





export interface Expression<T> extends SyntaxElement {

    /**
     * Retrieves all values of this Expression, accounting for possible modifiers.
     * This means that if this is an {@linkplain #isAndList() or-list}, it will choose
     * a random value to return.
     * @param ctx the event
     * @return an array of the values
     * @see #getArray(TriggerContext)
     */
	getValues(ctx: TriggerContext): T[];

    /**
     * Retrieves all values of this Expressions, without accounting for possible modifiers.
     * This means that if this is an {@linkplain #isAndList() or-list}, it will still
     * return all possible values.
     * @param ctx the event
     * @return an array of the raw values
     */
	// getArray(ctx: TriggerContext): T[] {
	// 	return this.getValues(ctx);
	// }


}


/**
 * A context under which a trigger may be run.
 * A parallel to Bukkit's own Event class.
 */
export interface TriggerContext {

	//DUMMY: TriggerContext = () => 'dummy';

	getName(): string;

}





/**
 * The base class for any runnable line of code inside of a script.
 * @see CodeSection
 * @see Effect
 */
 export abstract class Statement implements SyntaxElement {

	protected _parent: CodeSection | undefined;
	protected _next: Statement | undefined;

	public abstract init(expressions: Expression<any>[], matchedPattern: number, parseContext: any): boolean;
	public abstract toString(ctx: TriggerContext, debug: boolean): string;
	// public abstract checkIsInSection(parseContext: any, isStrict: boolean, ...requiredSections: any): boolean;

	abstract run(ctx: TriggerContext): boolean;

	public setParent(section: CodeSection): Statement {
		this._parent = section;
		return this;
	}

	public getNext(): Statement | undefined {
		if (this._next) {
			return this._next;
		} else if (this._parent) {
			return this._parent.getNext()
		} else {
			return;
		}
	}

	public setNext(next: Statement): Statement {
		this._next = next;
		return this;
	}

	public walk(ctx: TriggerContext): Statement | undefined {
		let proceed = this.run(ctx);
		if (proceed) {
			return this.getNext();
		} else if (this._parent) {
			return this._parent.getNext();
		} else {
			return;
		}
	}

	public static runAll(start: Statement, context: TriggerContext): boolean {
		let item: Statement | undefined = start;
		try {
			while (item) {
				item = item.walk(context);
			}
			return true;
		} catch (error) {
			return false;
		}
	}

}


// https://github.com/SkriptLang/skript-parser/blob/master/src/main/java/io/github/syst3ms/skriptparser/lang/CodeSection.java
/**
 * Represents a section of runnable code.
 * @see SecConditional
 * @see SecLoop
 * @see SecWhile
 * @see ConditionalExpression
 */
export abstract class CodeSection extends Statement {

	protected _items: Statement[];
	protected _first: Statement | undefined;
	protected _last: Statement | undefined;

    /**
     * This methods determines the logic of what is being done to the elements inside of this section.
     * By default, this simply parses all items inside it, but this can be overridden.
     * In case an extending class just needs to do some additional operations on top of what the default implementation
     * already does, then call {@code super.loadSection(section)} before any such operations.
     * @param section the {@link FileSection} representing this {@linkplain CodeSection}
     * @param logger the logger
     * @return {@code true} if the items inside of the section were loaded properly, {@code false} if there was a
     *         problem
     */
	public loadSection(section: FileSection, parserState:ParserState, logger: SkriptLogger): boolean {
		parserState.setSyntaxRestrictions(this.getAllowedSyntaxes(), this.isRestrictingExpressions());
		parserState.addCurrentSection(this);
		this.setItem(ScriptLoader.loadItems(section, parserState, logger));
		parserState.removeCurrentSection();
		parserState.clearSyntaxRestrictions();
		return true;
	}

	public run(_ctx: TriggerContext): boolean {
		throw new Error("UnsupportedOperationException");
		
	}

	public abstract walk(ctx: TriggerContext): Statement | undefined;

    /**
     * Sets the items inside this lists, and also modifies other fields, reflected through the outputs of {@link #getFirst()},
     * {@link #getLast()} and {@link Statement#getParent()}.
     * @param items the items to set
     */
	public setItem(items: Statement[]) {
		this._items = items;
		for (const item of items) {
			item.setParent(this);
		}
		this._first = items ? items[0] : undefined;
		this._last = items ? items[items.length - 1] : undefined;
	}

    /**
     * The items returned by this method are not representative of the execution of the code, meaning that all items
     * in the list may not be all executed. The list should rather be considered as a flat view of all the lines inside
     * the section. Prefer {@link Statement#runAll(Statement, TriggerContext)} to run the contents of this section
     * @return all items inside this section
     */
	public getItem(): Statement[] {
		return this._items;
	}

    /**
     * @return the first item of this section, or the item after the section if it's empty, or {@code null} if there is
     * no item after this section, in the latter case
     */
	public getFirst(): Statement | undefined {
		return this._first ? this._first : this.getNext();
	}

    /**
     * @return the last item of this section, or the item after the section if it's empty, or {@code null} if there is
     * no item after this section, in the latter case
     */
	protected getLast(): Statement | undefined {
		return this._last ? this._last : this.getNext();
	}

    /**
     * A list of the classes of every syntax that is allowed to be used inside of this CodeSection. The default behavior
     * is to return an empty list, which equates to no restrictions. If overridden, this allows the creation of specialized,
     * DSL-like sections in which only select {@linkplain Statement statements} and other {@linkplain CodeSection sections}
     * (and potentially, but not necessarily, expressions).
     * @return a list of the classes of each syntax allowed inside this CodeSection
     * @see #isRestrictingExpressions()
     */
	protected getAllowedSyntaxes(): Set<Class<SyntaxElement>> {
		return new Set<Class<SyntaxElement>>();
	}

    /**
     * Whether the syntax restrictions outlined in {@link #getAllowedSyntaxes()} should also apply to expressions.
     * This is usually undesirable, so it is false by default.
     *
     * This should return true <b>if and only if</b> {@link #getAllowedSyntaxes()} contains an {@linkplain Expression} class.
     * @return whether the use of expressions is also restricted by {@link #getAllowedSyntaxes()}. False by default.
     */
	protected isRestrictingExpressions(): boolean {
		return false;
	}



}



// https://github.com/SkriptLang/skript-parser/blob/master/src/main/java/io/github/syst3ms/skriptparser/lang/Trigger.java
/**
 * A top-level section, that is not contained in code.
 * Usually declares an event.
 */
export class Trigger extends CodeSection {
	private readonly _event: SkriptEvent;

	constructor(event: SkriptEvent) {
		super();
		this._event = event;
	}

	public init(_expressions: Expression<any>[], _matchedPattern: number, _parseContext: any): boolean {
		return true;
	}

	public walk(_ctx: TriggerContext): Statement | undefined {
		return this.getFirst()
	}
	public toString(ctx: TriggerContext, debug: boolean): string {
		throw this._event.toString(ctx, debug);
	}

	public get event(): SkriptEvent {
		return this._event;
	}


	
	
}


export abstract class Effect extends Statement {

	protected abstract execute(ctx: TriggerContext): void;

	public run(ctx: TriggerContext): boolean {
		this.execute(ctx);
		return true;
	}

}






// https://github.com/SkriptLang/skript-parser/blob/master/src/main/java/io/github/syst3ms/skriptparser/lang/UnloadedTrigger.java
/**
 * A {@link Trigger trigger}-to-be whose contents haven't been loaded yet. It will be loaded based on its event's
 * {@link SkriptEvent#getLoadingPriority() loading priority}.
 */
export class UnloadedTrigger {

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
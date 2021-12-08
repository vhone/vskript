import { Class } from "../../../extension";
import { FileSection } from "./File";
import { ParseContext, ParserState } from "./Parsing";


export abstract class SyntaxElement {

	abstract init(expressions: Expression<any>[], matchedPattern: number, parseContext: ParseContext): boolean;

	abstract toString(ctx: TriggerContext, debug: boolean): string;

	public static checkIsSection(parseContext: ParseContext, isStrict: boolean, ...requiredSections: Class<CodeSection>[]): boolean {
		let currentSections = parseContext.parserState
		return true;
	}

}

export abstract class SkriptEvent implements SyntaxElement {

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



/**
 * Represents a section of runnable code.
 * @see SecConditional
 * @see SecLoop
 * @see SecWhile
 * @see ConditionalExpression
 */
export abstract class CodeSection extends Statement {

	protected _items!: Statement[];
	protected _first: Statement | undefined;
	protected _last: Statement | undefined;

	public loadSection(section: FileSection, parserState:ParserState) {
		
	}

	public run(ctx: TriggerContext): boolean {
		throw new Error("UnsupportedOperationException");
		
	}

	public abstract walk(ctx: TriggerContext): Statement | undefined;

	public setItem(items: Statement[]) {
		this._items = items;
		for (const item of items) {
			item.setParent(this);
		}
		this._first = items ? items[0] : undefined;
		this._last = items ? items[items.length - 1] : undefined;
	}

	public getItem(): Statement[] {
		return this._items;
	}

	public getFirst(): Statement | undefined {
		return this._first ? this._first : this.getNext();
	}

	protected getLast(): Statement | undefined {
		return this._last ? this._last : this.getNext();
	}

	protected getAllowedSyntaxes(): Set<Class<SyntaxElement>> | undefined {
		return new Set<Class<SyntaxElement>>();
	}

	protected isRestrictingExpressions(): boolean {
		return false;
	}



}



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

	public walk(ctx: TriggerContext): Statement | undefined {
		return this.getFirst()
	}
	public toString(ctx: TriggerContext, debug: boolean): string {
		throw this._event.toString(ctx, debug);
	}

	public getEvent(): SkriptEvent {
		return this._event;
	}


	
	
}

interface Predicate<T> {
	test(t: T) : boolean;
}
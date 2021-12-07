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

	abstract init(expressions: Expression<any>[], matchedPattern: number, parseContext: any): boolean;
	abstract toString(ctx: TriggerContext, debug: boolean): string;
	abstract checkIsSection(parseContext: any, isStrict: boolean, ...requiredSections: any): boolean;

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

	protected items: Statement[];
	protected first: Statement;
	protected last: Statement;

	public loadSection(section: FileSection, parserState:ParserState) {
		
	}

}
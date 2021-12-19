
// https://github.com/SkriptLang/skript-parser/tree/master/src/main/java/io/github/syst3ms/skriptparser/registration

import { Class, Comparator, JavaObject, StringBuilder } from "../../../Java";
import { MultiMap } from "../../util/MultyMap";
import { CodeSection, Effect, SkriptEvent, Trigger, TriggerContext } from "./lang";
import { ParserState } from "./Parsing";
import { PatternElement } from "./Pattern";
import { PatternType, Type } from "./Type";

class DefaultRegistration {

	private static readonly INTEGER_PATTERN = /-?[0-9]+/;
	private static readonly DECIMAL_PATTERN = /-?[0-9]+\.[0-9]+/;

	public static register() {
		// SkriptRegistration registration = Parser
	}

}



// https://github.com/SkriptLang/skript-parser/blob/master/src/main/java/io/github/syst3ms/skriptparser/registration/SkriptAddon.java
/**
 * The base for all addons, modules that hook into the API to register syntax and handle triggers.
 */
 export abstract class SkriptAddon {

	private static readonly addons = new Array<SkriptAddon>();

	// private name: string;
	private readonly _handledEvents = new Array<Class<SkriptEvent>>();

	constructor() {
		SkriptAddon.addons.push(this);
	}

	public static getAddons(): SkriptAddon[] {
		return this.addons;
	}

	/**
     * When a {@linkplain Trigger} is successfully parsed, it is "broadcast" to all addons through this method,
     * in the hopes that one of them will be able to handle it.
     * @param trigger the trigger to be handled
     * @see #canHandleEvent(SkriptEvent)
     */
	public abstract handleTrigger(trigger: Trigger): void;
	
    /**
     * Is called when a script has finished loading. Optionally overridable.
     */
	public fishingedLoading(): void {}

    /**
     * Checks to see whether the given event has been registered by this SkriptAddon ; a basic way to filter out
     * triggers you aren't able to deal with in {@link SkriptAddon#handleTrigger(Trigger)}.
     * A simple example of application can be found in {@link Skript#handleTrigger(Trigger)}.
     * @param event the event to check
     * @return whether the event can be handled by the addon or not
     * @see Skript#handleTrigger(Trigger)
     */
	public canHandleEvent(event: SkriptEvent): boolean {
		return this._handledEvents.includes(event.constructor()) ;
	}

	addHandledEvent(event: Class<SkriptEvent>) {
		this._handledEvents.push(event);
	}
}



interface SkriptLogger {

}

// class SkriptRegistration {

// 	private readonly registerer: SkriptAddon;
// 	private readonly logger: SkriptLogger;
// 	private readonly expression = new Map<Class<Object>,Expression<Object, Object>>

// }





export class SyntaxInfo<C> extends JavaObject {

    private readonly _c: Class<C>;
    private readonly _patterns: PatternElement[];
    private readonly _priority: number;
    private readonly _registerer: SkriptAddon;
    protected readonly _data: Map<string, any> | undefined;

	constructor(registerer: SkriptAddon, c: Class<C>, priority: number, patterns: PatternElement[])
	constructor(registerer: SkriptAddon, c: Class<C>, priority: number, patterns: PatternElement[], data: Map<string, any>)
	constructor(registerer: SkriptAddon, c: Class<C>, priority: number, patterns: PatternElement[], data?: Map<string, any>) {
		super();
		this._c = c;
		this._patterns = patterns;
		this._priority = priority;
		this._registerer = registerer;
		if (data) this._data = data;
	}

	
	public get registerer() : SkriptAddon {
		return this._registerer;
	}
	public get syntaxClass() : Class<C> {
		return this._c;
	}
	public get priority() : number {
		return this._priority;
	}
	public get patterns() : PatternElement[] {
		return this._patterns;
	}
	
	public getData<T> (identifier: string): T {
		return this._data?.get(identifier);
	}

}



// https://github.com/SkriptLang/skript-parser/blob/master/src/main/java/io/github/syst3ms/skriptparser/registration/SkriptEventInfo.java
/**
 * A class containing info about an {@link SkriptEvent event} syntax
 * @param <E> the {@link SkriptEvent} class
 */
export class SkriptEventInfo<E extends SkriptEvent> extends SyntaxInfo<E> {

	private readonly _contexts: Set<Class<TriggerContext>>;

	constructor(register: SkriptAddon, c: Class<E>, handledContexts: Set<Class<TriggerContext>>, priority: number, patterns: PatternElement[], data: Map<string, any>) {
		super(register, c, priority, patterns, data);
		this._contexts = handledContexts;
	}

	public get contexts(): Set<Class<TriggerContext>> {
		return this._contexts;
	}

}



// https://github.com/SkriptLang/skript-parser/blob/master/src/main/java/io/github/syst3ms/skriptparser/registration/ExpressionInfo.java
/**
 * A class containing info about an {@link Expression} syntax
 * @param <C> the {@link Expression} class
 * @param <T> the return type of the {@link Expression}
 */
class ExpressionInfo<C, T> extends SyntaxInfo<C> {

	private readonly _returnType: PatternType<T>;

	constructor(registerer: SkriptAddon, c: Class<C>, isSingle: boolean, returnType: Type<T>, priority: number, patterns: PatternElement[], data: Map<string, any>) {
		super(registerer, c, priority, patterns, data);
		this._returnType = new PatternType<T>(returnType, isSingle);
	}

	public get returnType(): PatternType<T> {
		return this._returnType;
	}
}



export class SyntaxManager {

    /**
     * The ordering describing the order in which syntaxes should be tested during parsing
     */
	public static readonly INFO_COMPARATOR: Comparator<SyntaxInfo<any>> = {
		compare: (o1, o2) => {
			if (o1.priority !== o2.priority) {
				return o2.priority - o1.priority;
			} else {
				return o2.patterns.length - o1.patterns.length;
			}
		}
	};

	private static readonly expressions = new MultiMap<Class<any>, ExpressionInfo<any, any>>();
	private static readonly effects = new Array<SyntaxInfo<Effect>>();
	private static readonly sections = new Array<SyntaxInfo<CodeSection>>();
	private static readonly triggers = new Array<SkriptEventInfo<any>>();

	// static reigister(reg: SkriptRegistration) {
		
	// }

	public static getEvents(): SkriptEventInfo<any>[] {
		return SyntaxManager.triggers;
	}
}

// https://github.com/SkriptLang/skript-parser/tree/master/src/main/java/io/github/syst3ms/skriptparser/registration

import { Class } from "../../../Java";
import { SkriptEvent } from "./lang";
import { PatternElement } from "./Pattern";

class DefaultRegistration {

	private static readonly INTEGER_PATTERN = /-?[0-9]+/;
	private static readonly DECIMAL_PATTERN = /-?[0-9]+\.[0-9]+/;

	public static register() {
		// SkriptRegistration registration = Parser
	}

}


interface SkriptAddon {

}

interface SkriptLogger {

}

// class SkriptRegistration {

// 	private readonly registerer: SkriptAddon;
// 	private readonly logger: SkriptLogger;
// 	private readonly expression = new Map<Class<Object>,Expression<Object, Object>>

// }





export class SyntaxInfo<C> {

    private readonly _c: Class<C>;
    private readonly _patterns: PatternElement[];
    private readonly _priority: number;
    private readonly _registerer: SkriptAddon;
    protected readonly _data: Map<string, any> | undefined;

	constructor(registerer: SkriptAddon, c: Class<C>, priority: number, patterns: PatternElement[])
	constructor(registerer: SkriptAddon, c: Class<C>, priority: number, patterns: PatternElement[], data?: Map<string, any>) {
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




export class SkriptEventInfo<E extends SkriptEvent> extends SyntaxInfo<E> {

}
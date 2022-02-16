

export type Class<T> = { new (...args: any[]): T };



/**
 * equals가 없는게 말이 되냐!
 */
export class JavaObject {

	public equals(obj: any): boolean {
		if (this === obj) {
			return true;
		}
		if (Object.keys(this).length !== Object.keys(obj).length) {
			return false;
		}
		for (let field in this) {
			if (!obj[field]) {
				return false
			} else if (this[field] !== obj[field]) {
				return false;
			}
		}
		return true;
	}

	public toString() {
		let array: string[] = [];
		for (const field in this) {
			let value = typeof this[field] === 'string' ? `"${this[field]}"` : this[field]
			array.push(`${field}=${value}`);
		}
		return `${this.constructor.name}[${array.join(', ')}]`;
	}

};


export class StringBuilder {

	private readonly _chars = new Array<string>();

	constructor()
	constructor(string?: string) {
		if (string)
			this.append(string);
	}

	public get length(): number {
		return this._chars.length;
	}

	public append(string: string): StringBuilder
	public append(string: string, start: number, length: number): StringBuilder
	public append(string: string, start?: number, length?: number): StringBuilder {
		if (start && length)
			string = string.substr(start, length);
		this._chars.push(...string.split(''))
		return this;
	}

	public setLength(length: number) {
		this._chars.length = length;
	}

	public toString(): string {
		return this._chars.join('');
	}

}


export interface Comparator<T> {
	compare(o1: T, o2: T): number;
}


export class Stream<T> extends JavaObject {
	
	protected readonly _values: T[];

	constructor(values: T[]) {
		super();
		this._values = values;
	}

	public get values(): T[] {
		return this._values;
	}

	public filter(predicate: (value: T, index: number, array: T[]) => boolean): Stream<T>;
	public filter(predicate: (value: T, index: number, array: T[]) => boolean, thisArg: Stream<T>): Stream<T>;
	public filter(predicate: any, thisArg?: any): Stream<T> {
		if (!thisArg) {
			thisArg = this;
		}
		for(let i = 0; i < this._values.length; i++) {
			if (!predicate.call(thisArg, this._values[i])) {
				this._values.splice(i--, 1);
			}
		}
		return this;
	}

	public map<R>(mapper: (value: T) => R): Stream<R>
	public map<R>(mapper: (value: T) => R, thisArg: Stream<T>): Stream<R>
	public map<R>(mapper: any, thisArg?: any): Stream<R> {
		if (!thisArg) {
			thisArg = this;
		}
		let result: R[] = [];
		for(let i = 0; i < this._values.length; i++) {
			try{
				result.push(mapper.call(thisArg, this._values[i]));
			} catch (error) {}
		}
		return new Stream<R>(result)
	}

	public peek(action: (value: T) => void): Stream<T>
	public peek(action: (value: T) => void, thisArg: Stream<T>): Stream<T>
	public peek(action: any, thisArg?: any): Stream<T> {
		if (!thisArg) {
			thisArg = this;
		}
		for(let i = 0; i < this._values.length; i++) {
			try {
				action.call(thisArg, this._values[i])
			} catch (error) {}
		}
		return this;
	}

	

	public comparate(comparator: (value1: T, value2: T) => number): ComparableStream<T> {
		return new ComparableStream<T>(this, comparator);
	}

}



export class ComparableStream<T> extends Stream<T>{

	protected _comparator: ((v1: T, v2: T) => number);

	constructor(stream: Stream<T>, comparator: (v1: T, v2: T) => number) {
		super(stream.values);
		this._comparator = comparator;
	}

	public min(): T | undefined {
		let result = this._values[0];
		for (let i = 1; i < this._values.length; i++) {
			let v = this._values[i];
			try{
				if (this._comparator.call(this, result, v) > 0) {
					result = v;
				}
			} catch (error) {
				return;
			}
		}
		return result;
	}

	public max(): T | undefined {
		let result = this._values[0];
		for (let i = 1; i < this._values.length; i++) {
			let v = this._values[i];
			try{
				if (this._comparator.call(this, result, v) < 0) {
					result = v;
				}
			} catch (error) {
				return;
			}
		}
		return result;
	}

	public sort(): ComparableStream<T> {
		this._values.sort(this._comparator)
		return this;
	}

}
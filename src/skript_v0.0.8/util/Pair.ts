export class Pair<T, U> {

	private readonly _first: T;
	private readonly _second: U;

	constructor(first: T, second: U) {
		this._first = first;
		this._second = second;
	}

	public get first(): T {
		return this._first;
	} 
	public get second(): U {
		return this._second;
	}

}
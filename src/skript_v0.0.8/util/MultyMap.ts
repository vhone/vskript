

// https://github.com/SkriptLang/skript-parser/blob/master/src/main/java/io/github/syst3ms/skriptparser/util/MultiMap.java


/**
 * A simple implementation of a Multimap, emulating Guava's. This implementation allows duplicate elements in the
 * values.
 */
export class MultiMap<K, V> extends Map<K, V[]> {

    /**
     * Looks for a list that is mapped to the given key. If there is one, then the given value is added to that list.
     * If there isn't, then a new entry is created and has the value added to it.
     *
     * @param key the key
     * @param value the value
     */
	public putOne(key: K, value: V) {
		if ([...this.keys()].includes(key)) {
			this.get(key)!.push(value);
		} else {
			let values: V[] = [];
			values.push(value);
			this.set(key, values);
		}
	}

    /**
     * @return all values of all keys of this MultiMap
     */
	public getAllValues(): V[] {
		let values: V[] = [];
		for (let v of this.values()) {
			for (let value of v) {
				values.push(value);
			}
		}
		return values;
	}

}
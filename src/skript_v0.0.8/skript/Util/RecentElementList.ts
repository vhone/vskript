import { JavaObject } from "../../../Java";
import * as ArrayUtils from './ArrayUtils'


// https://github.com/SkriptLang/skript-parser/blob/master/src/main/java/io/github/syst3ms/skriptparser/util/RecentElementList.java


export class RecentElementList<T extends JavaObject> implements Iterable<T> {

    /**
     * Suppose you use a bunch of different syntaxes in your script: they all get sorted properly in the frequency
     * hierarchy, and the "recent syntaxes" check works fine. But if there are many syntaxes in that list, then if one
     * wants to use a syntax one hasn't used before, it would take a lot of time to actually match the pattern against
     * it, since there's all the previously used syntaxes to check beforehand.
     *
     * Hence, the maximum number of recent elements is capped.
     */
    // Ideally this would be properly configurable. I'll let it be a constant for now.
    public static readonly MAX_LIST_SIZE = 10;

    private static readonly ENTRY_COMPARATOR = (o1: [any, number], o2: [any, number]) => o1[1] - o2[1]; 

    private readonly backing = new Map<T, number>();
    private readonly occurrences = new Array<T>();

    public RecentElementList() {}

    /**
     * Updates a given syntax's position inside of the frequency hierarchy. This is used to acknowledge that a given{@link SyntaxInfo}
     * has been successfully parsed, and should as such be part of the "recent syntaxes" check.
     * @param element the element to update
     */
    public acknowledge(element: T) {
        if (!this.occurrences.includes(element)) {
            if (this.occurrences.length >= RecentElementList.MAX_LIST_SIZE) {
                return;
            } else {
                this.occurrences.push(element);
                this.backing.set(element, 1);
            }
        } else {
            for (const freq of this.backing.entries()) {
                if (freq[0].equals(element)) {
                    this.backing.set(freq[0], freq[1] + 1 );
                }
            }
        }
    }

    /**
     * Merges the elements of this list and the elements of the other list into a new set.
     * The elements of this list have priority over the other elements. There will be
     * no duplicate elements in the returned collection.
     * @param other the other list
     * @return a merged set with the elements of both lists
     */
    public mergeWith(other: T[]): T[] {
        let merged = [...this.occurrences];
        ArrayUtils.removeAll(other, this.occurrences);
        merged.push(...other);
        return merged;
    }

    /**
     * Removes the elements of this {@link RecentElementList} from another {@link List}, in-place.
     * @param list the list to remove from
     */
     public removeFrom(array:T[]) {
        ArrayUtils.removeAll(array, this.occurrences);
    }

    /**
     * Custom iterator sorted by frequency of use
     * @return an iterator where syntaxes appear in decreasing order of frequency of use
     */
    [Symbol.iterator](): Iterator<T> {
        let entries = [...this.backing.entries()]
        entries.sort(RecentElementList.ENTRY_COMPARATOR);
        
        /*
         * Anonymous class because usual Iterator implementations check for concurrent modification, which we don't really
         * care about here. This shouldn't cause issues even if parallel parsing is implemented, because any reasonable
         * implementation would not use one RecentElementList across multiple threads. At least I hope so...
         */        
        let i = 0;
        return {
            next: () => {
                return {
                    value: entries[i++][0],
                    done: i > entries.length
                }
            }
        }
    }

}



interface Comparable<T> {
    compareTo(o: T): number;
}


interface Comparator<T> {
    compare(o1: T, o2: T): number;
}

// https://github.com/SkriptLang/skript-parser/blob/8a5e504b9bee37b7954b22468b9790f2e0ac5787/src/main/java/io/github/syst3ms/skriptparser/util/RecentElementList.java

export class RecentElementList<T> implements Iterable<T> {

    /**
     * Suppose you use a bunch of different syntaxes in your script: they all get sorted properly in the frequency
     * hierarchy, and the "recent syntaxes" check works fine. But if there are many syntaxes in that list, then if one
     * wants to use a syntax one hasn't used before, it would take a lot of time to actually match the pattern against
     * it, since there's all the previously used syntaxes to check beforehand.
     *
     * Hence, the maximum number of recent elements is capped.
     */
    // Ideally this would be properly configurable. I'll let it be a constant for now.
    public static readonly MAX_LIST_SIZEL: number = 10;

    // private static readonly ENTRY_COMPARATOR: Comparator


    [Symbol.iterator](): Iterator<T, any, undefined> {
        throw new Error("Method not implemented.");
    }
    
}
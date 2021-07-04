

export class SkriptLine {
    
    constructor(
        public readonly offset: number,
        public readonly text: string,
        public readonly feed: string
    ) {}

    public static split(paragraph:string): SkriptLine[] {
        let lines = new Array<SkriptLine>();
        let copy = paragraph;
        let offset = 0;
        let search
        while (search = copy.match(/\r\n|\r|\n|$/)) {
            let line = new SkriptLine(offset, copy.substring(0, search.index!), search[0]);

            lines.push(line);

            offset += line.text.length + line.feed.length;
            copy = copy.substring(search.index! + line.feed.length);
            if (copy.length <= 0) break;
            
        }
        return lines;
    }

}
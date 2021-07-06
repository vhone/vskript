import { create } from 'node:domain';
import { Hover, HoverProvider, MarkdownString, Position, Range, TextDocument, Uri } from 'vscode'
import * as Skript from "../Skript"
import { SkriptFunction, SkriptOptions } from '../skript_fork/SkriptParagraph';

export class SkriptHoverProvider implements HoverProvider {

    provideHover(document: TextDocument, position: Position /*token: CancellationToken*/) {

        let lineText = document.lineAt(position.line).text;
        
        for(const skDocument of Skript.DOCUMENTS) {

            let docThis = skDocument.skPath.fsPath === document.uri.fsPath;
            for (const paragraph of skDocument.paragraphs) {

                let hover = null;

                // Function
                if (paragraph instanceof SkriptFunction) {
                    let markdown = (paragraph.tooltip) ? paragraph.tooltip.markdown : new MarkdownString();
                    hover = this.createHover(lineText, position, paragraph.title, markdown);
                    if (hover) 
                        return hover;
                }

                // if (docThis) {
                //     if (paragraph instanceof SkriptOptions) {
                //         for (const variable of paragraph.options) {
                //             hover = this.createHover(lineText, position,
                //                 `{@${variable[0]}}`,
                //                 new MarkdownString().appendCodeblock(variable[1], 'vskript'));
                //             if (hover) {
                //                 return hover;
                //             }
                //         }
                //     } else if (paragraph instanceof SkriptAliases)  {
                //         for (const itemtype of paragraph.aliases) {
                //             let hover = this.createHover(lineText, position,
                //                 itemtype[0],
                //                 new MarkdownString().appendCodeblock(itemtype[1].join('\r\n')));
                //             if (hover) {
                //                 return hover;
                //             }
                //         }
                //     }
                // }

            }

        }

        return;

    }

    private createHover(lineText:string, position:Position, searchString:string, markdownString:MarkdownString): Hover | undefined{
        let length = searchString.length;
        let index = lineText.indexOf(searchString, 0);
        while (index >= 0) {
            if (index <= position.character && position.character < index + length) {
                return new Hover(markdownString, new Range(
                    new Position(position.line, index),
                    new Position(position.line, index + length)
                ));
            }
            index = lineText.indexOf(searchString, index + length);
        }
        return undefined;
    }

}
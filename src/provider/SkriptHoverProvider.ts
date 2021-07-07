import { create } from 'node:domain';
import { Hover, HoverProvider, MarkdownString, Position, Range, TextDocument, Uri } from 'vscode'
import * as Skript from "../Skript"
import { SkriptFunction, SkriptOptions, SkriptAliases } from '../skript_fork/SkriptParagraph';

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
                    hover = this._createHover(lineText, position, paragraph.name, markdown);
                    if (hover) 
                        return hover;
                }

                if (docThis) {

                    // Options
                    if (paragraph instanceof SkriptOptions) {
                        for (const variable of paragraph.options) {
                            hover = this._createHover(lineText, position,
                                `{@${variable.key}}`,
                                new MarkdownString().appendCodeblock(variable.value, 'vskript'));
                            if (hover) {
                                return hover;
                            }
                        }
                    
                    // Skript Aliases
                    } else if (paragraph instanceof SkriptAliases)  {
                        for (const itemtype of paragraph.aliases) {
                            let hover = this._createHover(lineText, position,
                                itemtype.key,
                                new MarkdownString().appendCodeblock(itemtype.value.join('\r\n')));
                            if (hover) {
                                return hover;
                            }
                        }
                    }
                }

            }

        }

        return;

    }

    private _createHover(lineText:string, position:Position, searchString:string, markdownString:MarkdownString): Hover | undefined{
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
import { create } from 'node:domain';
import { Hover, HoverProvider, MarkdownString, Position, Range, TextDocument, Uri } from 'vscode'
import * as Skript from "../Skript"
import { SkriptAliases, SkriptFunction, SkriptOptions } from '../skript/Component';

export class SkriptHoverProvider implements HoverProvider {

    provideHover(document: TextDocument, position: Position /*token: CancellationToken*/) {
        
        // let range = document.getWordRangeAtPosition(position);
        // if (!range)
        //     return;
        
        // let text = document.getText(range);
        // let strings = new Array<MarkdownString>();
        // for(const skFile of Skript.getFileList()) {
        //     for (const skFunc of skFile.functions) if (skFunc.name === text) {
        //         strings.push(skFunc.markdown, new MarkdownString('from ```' + skFile.skName + '```'));
        //     }
        // }
        
        // return new Hover(strings);

        let lineText = document.lineAt(position.line).text;
        
        for(const skFile of Skript.getFileList()) {

            let docThis = skFile.fsPath === document.uri.fsPath;
            for (const comp of skFile.components) {

                let hover = null;

                if (comp instanceof SkriptFunction) {
                    hover = this.createHover(lineText, position, comp.name, comp.markdown);
                    if (hover) 
                        return hover;
                }

                if (docThis) {
                    if (comp instanceof SkriptOptions) {
                        for (const variable of comp.variables) {
                            hover = this.createHover(lineText, position,
                                `{@${variable[0]}}`,
                                new MarkdownString().appendCodeblock(variable[1], 'vskript'));
                            if (hover) 
                                return hover;
                        }
                    } else if (comp instanceof SkriptAliases)  {
                        for (const itemtype of comp.itemtypes) {
                            let hover = this.createHover(lineText, position,
                                itemtype[0],
                                new MarkdownString().appendCodeblock(itemtype[1].join('\r\n')));
                            if (hover)
                                return hover;
                        }
                    }
                }

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
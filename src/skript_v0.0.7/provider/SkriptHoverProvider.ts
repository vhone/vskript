import { create } from 'node:domain';
import { Hover, HoverProvider, MarkdownString, Position, Range, TextDocument, Uri } from 'vscode'
import * as Skript from "../Skript"
import { SkriptFunction, SkriptOptions, SkriptAliases } from '../SkriptComponent';

export class SkriptHoverProvider implements HoverProvider {

    provideHover(document: TextDocument, position: Position /*token: CancellationToken*/) {

        let lineText = document.lineAt(position.line).text;

        // Function
        let skFunctions: SkriptFunction[] = [];
        Skript.DOCUMENTS.forEach(skDocument => skFunctions.push(...skDocument.getComponents(SkriptFunction)));
        for (const skFunction of skFunctions) {
            let markdown = (skFunction.tooltip) ? skFunction.tooltip.markdown : new MarkdownString();
            let hover = this._createHover(lineText, position, skFunction.name, markdown);
            if (hover) return hover;
        }

        // Options
        let skDocument = Skript.find(document.uri.fsPath)!;
        for (const skOptions of skDocument.getComponents(SkriptOptions)) {
            for (const option of skOptions.options) {
                let hover = this._createHover(lineText, position, `{@${option.key}}`,
                    new MarkdownString().appendCodeblock(option.value, 'vskript'));
                if (hover) return hover;
            }
        }

        // Aliases
        for (const skAliases of skDocument.getComponents(SkriptAliases)) {
            for (const alias of skAliases.aliases) {
                let hover = this._createHover(lineText, position, alias.key,
                    new MarkdownString().appendCodeblock(alias.value.join('\r\n')));
                if (hover) return hover;
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
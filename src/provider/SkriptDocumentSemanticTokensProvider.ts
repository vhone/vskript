import { CancellationToken, DocumentSemanticTokensProvider, Position, ProviderResult, Range, SemanticTokens, SemanticTokensBuilder, SemanticTokensLegend, TextDocument } from "vscode";
import * as Skript from '../Skript'
import { SkriptAliases, SkriptFunction } from "../skript_fork/SkriptComponent";
import { SkriptVariable } from "../skript_fork/SkriptExpression";

export const LEGEND = new SemanticTokensLegend(['aliases','parameter']);

export class SkriptDocumentSemanticTokensProvider implements DocumentSemanticTokensProvider {
    provideDocumentSemanticTokens(document: TextDocument, _token: CancellationToken): ProviderResult<SemanticTokens> {
        // console.log('SkriptDocumentSemanticTokensProvider');

        let skDocument = Skript.find(document.uri.fsPath);
        if (!skDocument) {
            return;
        }

        let builder = new SemanticTokensBuilder(LEGEND);

        // Aliases Setting
        let aliases = new Map<Position, Set<string>>();
        skDocument.getComponents(SkriptAliases).forEach((skAliases) => {
            let set = new Set<string>();
            skAliases.aliases.forEach((alias) => { set.add(alias.key) });
            aliases.set(skAliases.range.end, set);
        });

        // Function
        let skFunctions = skDocument.getComponents(SkriptFunction);
        for (const skFunc of skFunctions) {

            let paragraph = skFunc.paragraph;

            // Parameter
            let parameters = skFunc.parameters;
            if (parameters) for (const parameter of parameters) for (const variable of paragraph.variables) {
                let name = (parameter.type.isList) ? `{_${parameter.name}::*}` : `{_${parameter.name}}`;
                for (const v of this._getAllChildVariables(variable)) {
                    if ( name === v.raw ) {
                        builder.push(v.range, 'parameter');
                    }
                }
            }

            // Aliases
            for (const alias_pos of aliases.keys()) if (alias_pos.isBefore(skFunc.range.start)) {
                console.log(skFunc);
                let legacy = paragraph.legacy;
                let start =paragraph.range.start;
                let set = aliases.get(alias_pos)!;
                for (const alias of set) {
                    let position = 0;
                    let index;
                    while ((index = legacy.indexOf(alias, position)) >= 0) {
                        position = index + alias.length;
                        let range = new Range(start.line, index, start.line, position);
                        builder.push(range, 'aliases');
                    }
                }
            }
        }

        let build = builder.build();
        
        return build;
    }

    private _getAllChildVariables(variable:SkriptVariable): SkriptVariable[] {
        let array: SkriptVariable[] = [];
        array.push(variable);
        for (const child of variable.child) {
            array.push(...this._getAllChildVariables(child));
        }
        _asdf('a')
        return array;
    }
}

function _asdf(text:string): string {
    return 'a' + text
}
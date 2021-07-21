import { CancellationToken, DocumentSemanticTokensProvider, ProviderResult, SemanticTokens, SemanticTokensBuilder, SemanticTokensLegend, TextDocument } from "vscode";
import * as Skript from '../Skript'
import { SkriptFunction } from "../skript_fork/SkriptComponent";
import { SkriptVariable } from "../skript_fork/SkriptExpression";

export const LEGEND = new SemanticTokensLegend(['aliases','parameter']);

export class SkriptDocumentSemanticTokensProvider implements DocumentSemanticTokensProvider {
    provideDocumentSemanticTokens(document: TextDocument, _token: CancellationToken): ProviderResult<SemanticTokens> {
        console.log('SkriptDocumentSemanticTokensProvider');

        let skDocument = Skript.find(document.uri.fsPath);
        if (!skDocument) {
            return;
        }

        let builder = new SemanticTokensBuilder(LEGEND);

        let skFunctions = skDocument.getComponents(SkriptFunction);
        for (const skFunc of skFunctions) {
            console.log(skFunc)
            let parameters = skFunc.parameters;
            if (parameters) for (const parameter of parameters) for (const variable of skFunc.paragraph.variables) {
                let name = (parameter.type.isList) ? `{_${parameter.name}::*}` : `{_${parameter.name}}`;
                for (const v of this._getAllChildVariables(variable)) {
                    if ( name === v.raw ) {
                        builder.push(v.range, 'parameter');
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
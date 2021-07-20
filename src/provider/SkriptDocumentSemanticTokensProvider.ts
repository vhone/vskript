import { CancellationToken, DocumentSemanticTokensProvider, ProviderResult, SemanticTokens, SemanticTokensBuilder, SemanticTokensLegend, TextDocument } from "vscode";
import * as Skript from '../Skript'
import { SkriptFunction } from "../skript_fork/SkriptComponent";

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
            if (parameters) for (const param of parameters) for (const variable of skFunc.paragraph.variables) {
                let name = (param.type.isList) ? `{_${param.name}::*}` : `{_${param.name}}`;
                if ( name === variable.raw ) {
                    builder.push(variable.range, 'parameter');
                }
            }
        }
        // for (const comp of skFile.components) if (comp instanceof SkriptAliases) {
        //     let position = comp.range.end;
        //     for (const key of comp.aliases.keys()) {
        //         for (const range of skFile.getRanges(key)) if (range.start.isAfterOrEqual(position)) {
        //             let thisComp = skFile.componentOf(range.start);
        //             let context = thisComp?.contextOf(range.start);
        //             if (!(thisComp?.contextOf(range.start) instanceof SkriptExprText)) {
        //                 builder.push(range, 'aliases');
        //             }
        //         }
        //     }
        // }
        let build = builder.build();
        
        return build;
    }
}
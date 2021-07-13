import { CancellationToken, DocumentSemanticTokensProvider, ProviderResult, SemanticTokens, SemanticTokensBuilder, SemanticTokensLegend, TextDocument } from "vscode";

export const LEGEND = new SemanticTokensLegend(['aliases']);

export class SkriptDocumentSemanticTokensProvider implements DocumentSemanticTokensProvider {
    provideDocumentSemanticTokens(document: TextDocument, _token: CancellationToken): ProviderResult<SemanticTokens> {
        console.log('SkriptDocumentSemanticTokensProvider');

        // let skFile = Skript.findDocument(document.uri.fsPath);
        // if (!skFile) {
        //     return;
        // }

        let builder = new SemanticTokensBuilder(LEGEND);
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
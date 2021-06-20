import { CancellationToken, DocumentSemanticTokensProvider, Event, Position, ProviderResult, Range, SemanticTokens, SemanticTokensBuilder, TextDocument } from "vscode";

export class SkriptDocumentSemanticTokensProvider implements DocumentSemanticTokensProvider {
    onDidChangeSemanticTokens?: Event<void> | undefined;
    provideDocumentSemanticTokens(_document: TextDocument, _token: CancellationToken): ProviderResult<SemanticTokens> {
        let builder = new SemanticTokensBuilder();
        builder.push(new Range(new Position(1, 1), new Position(1, 5)), 'class', ['declaration']);
        throw builder.build();
    }
}
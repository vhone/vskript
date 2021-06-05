import { CancellationToken, Color, ColorInformation, ColorPresentation, DocumentColorProvider, Position, ProviderResult, Range, TextDocument, TextEdit } from 'vscode'

/**
 * 컬러코드(<##000000>)에서 색 선택 GUI를 사용한다.
 *  - provideDocumentColors - 문서에서 색을 지정할 곳을 찾는다.
 *  - provideColorPresentations - 색 선택 GUI가 열리거나 사용할 때 동작한다.
 */
export class SkriptDocumentColorProvider implements DocumentColorProvider {
    provideDocumentColors(document: TextDocument /*token: CancellationToken*/ ) {
        let array = new Array<ColorInformation>();
        document.getText().split(/\r\n|\r|\n/i).forEach((line, i) => {
            let match = line.match(/\<\#\#[0-9a-fA-F]{6}\>/ig);
            if (match) {
                match.forEach((tag) => {
                    let index = line.indexOf(tag);
                    let range = new Range(new Position(i, index), new Position(i, index + tag.length));
                    let color = this.hexToColor(tag.replace(/\<|\#|\>/, ''));
                    if (!color) {
                        return;
                    }
                    let info = new ColorInformation(range, color);
                    array.push(info);
                });
            }
        });
        return array;
    }
    provideColorPresentations(color: Color, context: {document: TextDocument; range: Range;} /*token: CancellationToken*/ ) {
        let hex = '<##' + this.colorToHex(color) + '>';
        return [{
            label: hex,
            textEdit: new TextEdit(context.range, hex)
        }];
    }


    private hexToColor(hex:string): Color | null {
        let match = hex.match(/([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})/i);
        return match ? new Color(
            parseInt(match[1], 16)/255,
            parseInt(match[2], 16)/255,
            parseInt(match[3], 16)/255, 1) : null;
    }
    


    private colorToHex(color:Color): string {
        return (( 1 << 24)
            + (Math.floor(color.red * 255) << 16)
            + (Math.floor(color.green * 255) << 8)
            + Math.floor(color.blue * 255)).toString(16).slice(1);
    }


}
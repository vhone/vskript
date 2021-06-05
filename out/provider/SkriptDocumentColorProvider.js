"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SkriptDocumentColorProvider = void 0;
const vscode_1 = require("vscode");
/**
 * 컬러코드(<##000000>)에서 색 선택 GUI를 사용한다.
 *  - provideDocumentColors - 문서에서 색을 지정할 곳을 찾는다.
 *  - provideColorPresentations - 색 선택 GUI가 열리거나 사용할 때 동작한다.
 */
class SkriptDocumentColorProvider {
    provideDocumentColors(document /*token: CancellationToken*/) {
        let array = new Array();
        let lines = document.getText().split(/\r\n|\r|\n/);
        for (let i = 0; i < lines.length; i++) {
            let line = lines[i];
            let match = line.match(/\<\#\#[0-9a-fA-F]{6}\>/ig);
            let pos = 0;
            if (match)
                for (const tag of match) {
                    let start = line.indexOf(tag, pos);
                    let end = start + tag.length;
                    pos = end;
                    let range = new vscode_1.Range(new vscode_1.Position(i, start), new vscode_1.Position(i, end));
                    let color = this.hexToColor(tag.replace(/\<|\#|\>/, ''));
                    if (!color)
                        continue;
                    array.push(new vscode_1.ColorInformation(range, color));
                }
        }
        return array;
    }
    provideColorPresentations(color, context /*token: CancellationToken*/) {
        let hex = '<##' + this.colorToHex(color) + '>';
        return [{
                label: hex,
                textEdit: new vscode_1.TextEdit(context.range, hex)
            }];
    }
    hexToColor(hex) {
        let match = hex.match(/([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})/i);
        return match ? new vscode_1.Color(parseInt(match[1], 16) / 255, parseInt(match[2], 16) / 255, parseInt(match[3], 16) / 255, 1) : null;
    }
    colorToHex(color) {
        return ((1 << 24)
            + (Math.floor(color.red * 255) << 16)
            + (Math.floor(color.green * 255) << 8)
            + Math.floor(color.blue * 255)).toString(16).slice(1);
    }
}
exports.SkriptDocumentColorProvider = SkriptDocumentColorProvider;
//# sourceMappingURL=SkriptDocumentColorProvider.js.map
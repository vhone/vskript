import * as FileSystem from 'fs';
import { StringUtils } from './StringUtils';

export namespace FileUtils {

	const LEADING_WHITESPACE_PATTERN = /^(\s+)\S.*/;

	export function getIndentationLevel(line: string, countAllSpace: boolean): number {
		let m = LEADING_WHITESPACE_PATTERN.exec(line);
		if (m) {
			let space = m[1];
			if (countAllSpace) {
				return 4 * StringUtils.count(space, '\t') + StringUtils.count(space, ' ');
			} else {
				return StringUtils.count(space, '\t', '    ');
			}
		} else {
			return 0;
		}
	}
	
	export function readAllLines(filePath: string): string[] {
		let lang = FileSystem.readFileSync(filePath, 'utf-8');
		if (lang) {
			return lang.split(/\r\n|\r|\n/);
		} else {
			throw new Error("파일 없음");
		}
	}

}
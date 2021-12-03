import * as StringUtils from './StringUtils'


const LEADING_WHITESPACE_PATTERN = /(\s+)\S.*/;

export function getIndentationLevel(line: string, countAllSpace: boolean): number {
	let m = LEADING_WHITESPACE_PATTERN.exec(line);
	if (m) {
		let space = m.groups![1];
		if (countAllSpace) {
			return 4 * StringUtils.count(space, '\t') + StringUtils.count(space, ' ');
		} else {
			return StringUtils.count(space, '\t', '    ');
		}
	} else {	
		return 0;
	}
}
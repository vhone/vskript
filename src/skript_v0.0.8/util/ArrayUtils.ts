/**
 * array1에 있는 모든 array2 요소를 제거함
 * @param array1 제거 될 배열
 * @param array2 제거 할 배열
 * @returns 제거 된 배열 
 */
export function removeAll<T>(array1: T[], array2: T[]): boolean {
	let result = false;
	for (let i of array2) {
		let index = array1.indexOf(i);
		while (index > 0) {
			array1.splice(index, 1);
			result = true;
			index = array1.indexOf(i);
		}
	}
	return result;
}
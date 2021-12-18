export namespace ArrayUtils {

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

	/**
	 * array에서 조건에 해당하는 값을 모두 제거
	 * @param array 배열
	 * @param condition 조건
	 */
	export function removeIf<T>(array: T[], condition: (arg: T) => boolean) {
		console.log(array)
		for(let i = 0; i < array.length; i++)
			if (condition.call(array[i], array[i]))
				array.splice(i--, 1);
	}

	
	export function min<T>(array: T[], comparator: (arg1: T, arg2: T) => number): T {
		let result = array[0];
		for (let i = 1; i < array.length; i++) {
			let v = array[i];
			if (comparator.call(array, result, v) > 0) {
				result = v;
			}
		}
		return result;
	}
	
}
var shared = {
	types: [
		[
			[0, 0, 0, 0, 0],
			[0, 0, 1, 0, 0],
			[0, 1, 1, 1, 0],
			[0, 0, 0, 0, 0],
			[0, 0, 0, 0, 0]
		],
		[
			[0, 0, 0, 0, 0],
			[0, 0, 1, 1, 0],
			[0, 1, 1, 0, 0],
			[0, 0, 0, 0, 0],
			[0, 0, 0, 0, 0]
		],
		[
			[0, 0, 0, 0, 0],
			[0, 1, 1, 0, 0],
			[0, 0, 1, 1, 0],
			[0, 0, 0, 0, 0],
			[0, 0, 0, 0, 0]
		],
		[
			[0, 0, 0, 0, 0],
			[0, 1, 1, 0, 0],
			[0, 1, 1, 0, 0],
			[0, 0, 0, 0, 0],
			[0, 0, 0, 0, 0]
		],
		[
			[0, 0, 0, 0, 0],
			[0, 0, 1, 0, 0],
			[0, 0, 1, 0, 0],
			[0, 0, 1, 0, 0],
			[0, 0, 1, 0, 0]
		],
		[
			[0, 0, 0, 0, 0],
			[0, 0, 1, 0, 0],
			[0, 0, 1, 0, 0],
			[0, 0, 1, 0, 0],
			[0, 0, 1, 0, 0]
		],
		[
			[0, 0, 0, 0, 0],
			[0, 0, 1, 0, 0],
			[0, 0, 1, 0, 0],
			[0, 1, 1, 0, 0],
			[0, 0, 0, 0, 0]
		],
		[
			[0, 0, 0, 0, 0],
			[0, 0, 1, 0, 0],
			[0, 0, 1, 0, 0],
			[0, 0, 1, 1, 0],
			[0, 0, 0, 0, 0]
		]
	]
}

function rotateMatrix(matrix, reps) {

	var rotMatrix,
		n

	for (n = 0; n < reps; n++) {
		rotMatrix = newMatrix(matrix.length, matrix[0].length)
		for (y = 0; y < matrix.length; y++) {
			for (x = 0; x < matrix[0].length; x++) {
				rotMatrix[x][matrix[0].length - 1 - y] = matrix[y][x]
			}
		}
		matrix = rotMatrix
	}

	return matrix
}

function newMatrix(n, m) {

	var matrix = [],
		y

	for (y = 0; y < n; y++) {
		matrix.push([]);
		for (x = 0; x < m; x++) {
			matrix[y].push(undefined)
		}
	}

	return matrix
}

if (typeof module === "object" && module && typeof module.exports === "object")
	module.exports = shared


var _sockets = null,
	_field = newMatrix(20, 20),
	_player = [],
	_types = [
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
	],
	_blockid = 0,
	_timeout = 500,
	x,
	i, y


exports.index = function (req, res) {
	res.send('hello world')
}

exports.init = function (sockets) {
	_sockets = sockets
	_sockets.on('connection', newPlayer)
	setTimeout(gameloop, _timeout)
}

function newPlayer(socket) {
	socket.on('update', recvUpdate)
	// create new Player object
	_player.push({
		name: 'rnd',
		position: [0, 0],
		rotation: 0,
		type: 0,
		id: _blockid++
	})

	//placePiece(0, 2, [0,0],1,'dustin')
	sendBaseData()
}

function recvUpdate(data) {
	console.log(data)
	//handle movement
	//sendBaseData()
}

function sendBaseData() {
	_sockets.emit('base', {players: _player, field: _field})
}


function gameloop() {
	movePiecesDown()
	checkPlacement()
	checkLines()
	sendBaseData()
	setTimeout(gameloop, _timeout)
}

function movePiecesDown() {
	for (i = 0; i < _player.length; i++) {
		_player[i].position[1]++
	}
}

function checkLines() {

	var lineFull

	for (y = 0; y < _field.length; y++) {

		lineFull = true

		for (x = 0; x < _field[0].length; x++) {
			if (!_field[y][x]) {
				lineFull = false;
				break
			}
		}
		if (lineFull)
			return clearLine(y)
	}
}

function clearLine(line) {
	for (y = line; y > 0; y--) {
		for (x = 0; x < _field[0].length; x++) {
			_field[y][x] = _field[y - 1][x]
		}
	}
	for (x = 0; x < _field[0].length; x++) {
		_field[0][x] = 0
	}
}

function checkPlacement() {
	for (i = 0; i < _player.length; i++) {
		checkPieceOf(_player[i])
	}
}

function checkPieceOf(player) {

	var x = player.position[0],
		y = player.position[1],
		matrix = rotateMatrix(_types[player.type], player.rotation),
		isValid = true

	for (dy = 0; dy < matrix.length; dy++) {
		for (dx = 0; dx < matrix[0].length; dx++) {
			if (matrix[dy][dx] && _field[dy + y + 1][dx + x]) {
				isValid = false;
				break;
			}
		}
		console.log(_player)
		if (!isValid || y >= 10) {

			placePiece(player.type, player.id, player.position, player.rotation, player.name)
		}
	}
}

function placePiece(type, id, position, rotation, owner) {

	var x = position[0],
		y = position[0],
		matrix = rotateMatrix(_types[type], rotation),
		dy,
		dx

	for (dy = 0; dy < matrix.length; dy++) {
		for (dx = 0; dx < matrix[0].length; dx++) {
			if (matrix[dy][dx]) {
				_field[dy + y][dx + x] = {type: type, id: id, owner: owner}
			}
		}
	}
}

// Matrix-Manipulation
function rotateMatrix(matrix, n) {

	var rotMatrix,
		_n

	for (_n = 0, y; _n < n; _n++) {
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

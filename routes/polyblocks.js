var shared = require('../public/js/shared.js')

var _sockets = null,
	_WIDTH = 10,
	_HEIGHT = 30,
	_minSpeed = 500,
	_maxSpeed = 50,
	_field = shared.newMatrix(_HEIGHT, _WIDTH),
	_player = [],
	_blockid = 0,
	_pid = 1,
	_clearedLines = 0,
	timeout,
	x,
	i, y,

	keymap = {
		up: function (player) {
			player.rotation = (player.rotation + 1) % 4
		},
		down: function (player) {
			player.rotation--
			if (player.rotation === -1)
				player.rotation = 4
		},
		right: function (player) {
			player.position[0]++
		},
		left: function (player) {
			player.position[0]--
		},
		space: function (player) {
			while (!isColliding(player)){
				player.position[1]++
			}
			player.position[1]--
			placePiece(player)
		}
	},
	revert = {
		up: function (player) {
			player.rotation--
			if (player.rotation === -1)
				player.rotation = 4
		},
		down: function (player) {
			player.rotation = (player.rotation + 1) % 4
		},
		right: function (player) {
			player.position[0]--
		},
		left: function (player) {
			player.position[0]++
		},
		space: function (player) {
			
		}
	}


if (typeof module === "object" && module && typeof module.exports === "object"){


	exports.init = function (sockets) {
		_sockets = sockets
		_sockets.on('connection', newPlayer)
		Math.random()
		Math.random()
		Math.random()
		gameloop()
	}
}

function randomInt (low, high) {
    return Math.floor(Math.random() * (high - low) + low);
}

function sendBaseData() {
	_sockets.emit('base', {players: _player, field: _field})
}

function gameloop() {
	movePiecesDown()
	sendBaseData()
	timeout = (_minSpeed-_maxSpeed)*Math.pow(Math.E, -1/20*_clearedLines)+_maxSpeed
	// console.log('speed: '+timeout+'ms')
	setTimeout(gameloop,timeout)
}

function newPlayer(socket) {
	_player.push(_playerproto = {
		pid: ++_pid,
		name: 'rnd'
	})
	newPiece(_player[_player.length-1])

	socket.on('update', recvUpdate)
	socket.on('disconnect', recvDisconnect)
	socket['pid']=_pid
	sendBaseData()
}

function newPiece(player) {
	console.log(_field[0].length)
	player.position = [randomInt(0, _WIDTH-5), 0]
	player.rotation = 0
	player.type = randomInt(0, 8),
	player.id = _blockid++
}

function recvUpdate(data) {
	// console.time('update')
	for (var i = 0; i < _player.length; i++) {
		if (_player[i].pid == this.pid){
			player = _player[i]
		}
	}
	keymap[data](player)
	if (isColliding(player)){
		revert[data](player)
	}
	sendBaseData()
	// console.timeEnd('update')
}

function recvDisconnect(data) {
	console.log('disconnect')
	_clearedLines = 0
	_field = shared.newMatrix(_HEIGHT,_WIDTH)
	pidToDelete = -1;
	for (var i = 0; i < _player.length; i++) {
		if (_player[i].pid == this.pid){
			pidToDelete = this.pid
		}
	}
	_player = _player.splice(pidToDelete, 1)
}

function movePiecesDown() {
	for (i = 0; i < _player.length; i++) {
		_player[i].position[1]++
		if (isColliding(_player[i])){
			_player[i].position[1]--
			placePiece(_player[i])
		}
	}
}

function clearFinishedLines(){
	y = _HEIGHT-1
	while (y >= 0) {
		cleared = true
		for (x = 0; x <_WIDTH; x++) {
			if (!_field[x][y]){
				cleared = false
			}
		}
		if (cleared){
			_clearedLines++
			for (i = y-1; i >= 0; i--){
				for (x = 0; x <_WIDTH; x++) {
					_field[x][i+1] = _field[x][i]
				}
			}
		} else {
			y--
		}
	}
}


function placePiece(player){
	var x = player.position[0],
		y = player.position[1],
		matrix = shared.rotateMatrix(shared.types[player.type],player.rotation)

	for (var dy = 0; dy < matrix.length; dy++){
		for (var dx = 0; dx < matrix[0].length; dx++){
			if (matrix[dy][dx]){
				_field[dx+x][dy+y] = {type: player.type, id: player.id, owner: player.pid}
			}
		}
	}
	newPiece(player)
	clearFinishedLines();
}

function isColliding(player){
	var x = player.position[0],
		y = player.position[1],
		matrix = shared.rotateMatrix(shared.types[player.type],player.rotation)

	for (var dy = 0; dy < matrix.length; dy++){
		for (var dx = 0; dx < matrix[0].length; dx++){
			if (matrix[dy][dx]){
				if ( dx+x < 0 || dy+y < 0 || dx+x >= _WIDTH|| dy+y >= _HEIGHT || _field[dx+x][dy+y]){
					return true
				}
			}
		}
	}
	return false
}


var shared = require('../public/js/shared.js')

var _sockets = null,
	_field = shared.newMatrix(10, 10),
	_player = [],
	_blockid = 0,
	_blockpos = 0,
	_pid = 1,
	_timeout = 200,
	x,
	i, y,

	keymap = {
		down: function (player) {
			player.rotation = (player.rotation + 1) % 4
		},
		up: function (player) {
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
			
		}
	},
	revert = {
		down: function (player) {
			player.rotation--
			if (player.rotation === -1)
				player.rotation = 4
		},
		up: function (player) {
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

	exports.index = function (req, res) {
		res.send('hello world')
	}


	exports.init = function (sockets) {
		_sockets = sockets
		_sockets.on('connection', newPlayer)
		gameloop()
	}
}


function sendBaseData() {
	_sockets.emit('base', {players: _player, field: _field})
}

function gameloop() {
	console.time('gameloop')
	movePiecesDown()
	//checkPlacement()
	//checkLines()
	sendBaseData()
	console.timeEnd('gameloop')
	setTimeout(gameloop,_timeout)
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
	_blockpos=_blockpos+5
	player.position = [_blockpos%_field.length, 0]
	player.rotation = 0
	player.type = Math.floor(Math.random()*8),
	player.id = _blockid++
}

function recvUpdate(data) {
	console.time('update')
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
	console.timeEnd('update')
}

function recvDisconnect(data) {
	console.log('disconnect')
	_field = shared.newMatrix(20,20)
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
			_player[i].position[1]=0
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
}

function isColliding(player){
	var x = player.position[0],
		y = player.position[1],
		matrix = shared.rotateMatrix(shared.types[player.type],player.rotation)

	for (var dy = 0; dy < matrix.length; dy++){
		for (var dx = 0; dx < matrix[0].length; dx++){
			if (matrix[dy][dx]){
				if ( dx+x < 0 || dy+y < 0 || dx+x >= _field[0].length|| dy+y >= _field.length || _field[dx+x][dy+y]){
					return true
				}
			}
		}
	}
	return false
}


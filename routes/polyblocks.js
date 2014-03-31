var shared = require('../public/js/shared.js')
var colors = require('colors')

var _sockets = null,
	_WIDTH = 0,
	_HEIGHT = 0,
	_start_width = 20,
	_start_height = 30,
	_extendBy = 4,
	_minSpeed = 500,
	_maxSpeed = 50,
	_field,
	_player = [],
	_blockid = 0,
	_pid = 1,
	_clearedLines = 0,
	_gameloop,
	_timeout,
	x,
	i, y,
	_gameover = false

	keymap = {
		up: function (player) {
			player.rotation = (player.rotation + 1) % 4
		},
		down: function (player) {
			player.rotation--
			if (player.rotation === -1)
				player.rotation = 3
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
				player.rotation = 3
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
	}
	
	exports.reset = function(req, res){
		res.end()
		startGame()
	}
}

function randomInt (low, high) {
    return Math.floor(Math.random() * (high - low) + low);
}

function sendBaseData() {
	_sockets.emit('base', {players: _player, field: _field, score:_clearedLines})
}

function gameover(){
	console.log('Game Over'.red.bold)
	stopGame()
	_sockets.emit('gameover', {players: _player, field: _field, score:_clearedLines})
	startGame()
}

function startGame(){
	clearTimeout(_gameloop)
	console.log('Starting the game'.green.underline)
	_clearedLines = 0
	_WIDTH = _start_width + (_player.length-1)
	_HEIGHT = _start_height
	_field = shared.newMatrix(_WIDTH, _HEIGHT)
	_gameover = false
	for (var i = 0; i < _player.length; i++) {
		_player[i].score = 0
		newPiece(_player[i])
	}
	gameloop()
}

function stopGame(){
	console.log('Stopping the game'.red.underline)
	_gameover = true
	clearTimeout(_gameloop)
}

function gameloop() {
	movePiecesDown()
	sendBaseData()

	timeout = Math.floor((_minSpeed-_maxSpeed)*Math.pow(Math.E, -1/20*_clearedLines)+_maxSpeed)
	if (!_gameover){
		_gameloop = setTimeout(gameloop, timeout)
	}
	if (timeout !== _timeout){
		console.log(('Line cleared. New Speed: '+timeout+'ms').italic.yellow)
	}
	_timeout = timeout
}

function newPlayer(socket) {
	if (_player.length===0){
		startGame()
	} else {
		extendField()
	}
	pid = _pid++
	_player.push({
		pid: pid,
		name: 'rnd',
		score: 0
	})
	newPiece(_player[_player.length-1])
	socket.on('update', recvUpdate)
	socket.on('disconnect', recvDisconnect)
	socket['pid']=pid
	sendBaseData()
	console.log(('Player '+pid+' joined the game').cyan)	
}

function newPiece(player) {
	player.position = [randomInt(0, _WIDTH-3), 0]
	player.rotation = 0
	player.type = randomInt(0, 8),
	player.id = _blockid++
	if (isColliding(player)){
		gameover()
	}
}

function recvUpdate(data) {
	if (_gameover){return}
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
}

function recvDisconnect(data) {
	console.log(('Player '+this.pid+' leaved the game').grey)
	indexToDelete = -1;
	for (var i = 0; i < _player.length; i++) {
		if (_player[i].pid === this.pid){
			indexToDelete = i
		}
	}
	_player.splice(indexToDelete, 1)
	if (_player.length === 0){
		stopGame()
	} else {
		reduceField()
		sendBaseData()
	}
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

function clearFinishedLines(player){
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
			player.score++
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
	clearFinishedLines(player);
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

function extendField(){
	nMatrix = shared.newMatrix(_WIDTH+1, _HEIGHT)
	for (var x = 0; x < _WIDTH; x++) {
		for (var y = 0; y < _HEIGHT; y++) {
			nMatrix[x][y] = _field[x][y]
		}	
	}
	_field = nMatrix
	_WIDTH++
}

function reduceField(){
	
	nMatrix = shared.newMatrix(_WIDTH-_extendBy, _HEIGHT)
	for (var x = 0; x < _WIDTH-_extendBy; x++) {
		for (var y = 0; y < _HEIGHT; y++) {
			nMatrix[x][y] = _field[x][y]
		}	
	}
	for (var i = 0; i < _player.length; i++){
		if (_player[i].position[0] + 5 >= _WIDTH - _extendBy){
			_player[i].position[0]-=5;
		}
	}
	_WIDTH--
	_field = nMatrix

}

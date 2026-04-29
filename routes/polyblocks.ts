import shared, { Player, GameField, GamePiece } from '../public/js/shared';
import 'colors';
import * as ban from './ban';
import { Request, Response } from 'express';
import { Server as SocketIOServer, Socket } from 'socket.io';

let _sockets: SocketIOServer | null = null;
let _WIDTH = 0;
let _HEIGHT = 0;
const _start_width = 10;
const _start_height = 20;
const _extendBy = 4;
const _minSpeed = 500;
const _maxSpeed = 50;
let _field: GameField;
let _player: Player[] = [];
let _blockId = 0;
let _pixelId = 0;
let _pid = 1;
let _clearedLines = 0;
let _gameloop: NodeJS.Timeout;
let _timeout: number;
let x: number;
let i: number;
let y: number;
let _gameover = true;

interface KeyMapFunction {
    (player: Player): void;
}

const keymap: { [key: string]: KeyMapFunction } = {
    up: function (player: Player) {
        player.rotation = ((player.rotation || 0) + 1) % 4;
    },
    down: function (player: Player) {
        player.rotation = (player.rotation || 0) - 1;
        if (player.rotation === -1) {
            player.rotation = 3;
        }
    },
    right: function (player: Player) {
        if (player.position) {
            player.position[0]++;
        }
    },
    left: function (player: Player) {
        if (player.position) {
            player.position[0]--;
        }
    },
    space: function (player: Player) {
        while (!isColliding(player)) {
            if (player.position) {
                player.position[1]++;
            }
        }
        if (player.position) {
            player.position[1]--;
        }
        placePiece(player);
    }
};

const revert: { [key: string]: KeyMapFunction } = {
    up: function (player: Player) {
        player.rotation = (player.rotation || 0) - 1;
        if (player.rotation === -1) {
            player.rotation = 3;
        }
    },
    down: function (player: Player) {
        player.rotation = ((player.rotation || 0) + 1) % 4;
    },
    right: function (player: Player) {
        if (player.position) {
            player.position[0]--;
        }
    },
    left: function (player: Player) {
        if (player.position) {
            player.position[0]++;
        }
    },
    space: function (player: Player) {
        // No revert action for space
    }
};

export function init(sockets: SocketIOServer): void {
    _sockets = sockets;
    _sockets.on('connection', newPlayer);
}

export function reset(req: Request, res: Response): void {
    res.end();
    startGame();
}

function randomInt(low: number, high: number): number {
    return Math.floor(Math.random() * (high - low) + low);
}

function sendBaseData(): void {
    if (_sockets) {
        _sockets.emit('base', { players: _player, field: _field, score: _clearedLines });
    }
}

function gameover(): void {
    console.log('Game Over'.red.bold);
    stopGame();

    if (_sockets) {
        _sockets.emit('gameover', {
            players: _player,
            field: _field,
            score: _clearedLines
        });
    }

    setTimeout(startGame, _timeout);
}

function stopGame(): void {
    console.log('Stopping the game'.red.underline);
    _gameover = true;
    clearTimeout(_gameloop);
}

function startGame(): void {
    clearTimeout(_gameloop);
    if (!_gameover) { return; }
    console.log('Starting the game'.green.underline);

    _clearedLines = 0;
    _WIDTH = _start_width + ((_player.length - 1) * _extendBy);
    _HEIGHT = _start_height;
    _field = shared.newMatrix(_WIDTH, _HEIGHT) as GameField;
    _gameover = false;

    for (i = 0; i < _player.length; i++) {
        _player[i].score = 0;
        newPiece(_player[i]);
    }
    gameloop();
}

function gameloop(): void {
    movePiecesDown();
    sendBaseData();

    const timeout = Math.floor((_minSpeed - _maxSpeed) * Math.pow(Math.E, -1 / 15 * _clearedLines) + _maxSpeed);

    if (!_gameover) {
        _gameloop = setTimeout(gameloop, timeout);
    }

    if (timeout !== _timeout) {
        console.log(('Line cleared. New Speed: ' + timeout + 'ms').italic.yellow);
    }

    _timeout = timeout;
}

// Store socket to player ID mapping
const socketToPid = new Map<string, number>();

function newPlayer(socket: Socket): void {
    console.log(socket.handshake.address);
    if (ban.bannedIPs.indexOf(socket.handshake.address || '') > -1) { return; }

    const pid = _pid++;
    _player.push({
        pid: pid,
        name: 'rnd',
        score: 0
    });

    socket.on('update', recvUpdate);
    socket.on('disconnect', recvDisconnect);
    socketToPid.set(socket.id, pid);

    if (_player.length === 1) {
        startGame();
    } else {
        extendField();
    }
    newPiece(_player[_player.length - 1]);
    sendBaseData();

    console.log(('Player ' + pid + ' joined the game').cyan);
}

function newPiece(player: Player): void {
    player.position = [randomInt(0, _WIDTH - 3), 0];
    player.rotation = 0;
    player.type = randomInt(0, 8);
    player.id = _blockId++;

    if (isColliding(player)) {
        gameover();
    }
}

function recvUpdate(this: Socket, data: string): void {
    if (_gameover) { return; }

    const pid = socketToPid.get(this.id);
    let player: Player | undefined;
    for (let i = 0; i < _player.length; i++) {
        if (_player[i].pid === pid) {
            player = _player[i];
            break;
        }
    }

    if (player && keymap[data]) {
        keymap[data](player);

        if (isColliding(player)) {
            revert[data](player);
        }
    }

    sendBaseData();
}

function recvDisconnect(this: Socket): void {
    const pid = socketToPid.get(this.id);
    console.log(('Player ' + pid + ' leaved the game').grey);
    let indexToDelete = -1;

    for (let i = 0; i < _player.length; i++) {
        if (_player[i].pid === pid) {
            indexToDelete = i;
            break;
        }
    }

    _player.splice(indexToDelete, 1);
    socketToPid.delete(this.id);

    if (_player.length === 0) {
        stopGame();
    } else {
        reduceField();
        sendBaseData();
    }
}

function movePiecesDown(): void {
    for (i = 0; i < _player.length; i++) {
        if (_player[i].position) {
            _player[i].position![1]++;
            if (isColliding(_player[i])) {
                _player[i].position![1]--;
                placePiece(_player[i]);
            }
        }
    }
}

function clearFinishedLines(player: Player): void {
    y = _HEIGHT - 1;
    while (y > 0) {
        let cleared = true;
        for (x = 0; x < _WIDTH; x++) {
            if (!_field[x][y]) {
                cleared = false;
            }
        }
        if (cleared) {
            _clearedLines++;
            player.score++;
            for (i = y - 1; i >= 0; i--) {
                for (x = 0; x < _WIDTH; x++) {
                    _field[x][i + 1] = _field[x][i];
                }
            }
        } else {
            y--;
        }
    }
}

function placePiece(player: Player): void {
    if (!player.position || player.type === undefined || player.id === undefined) return;

    const x = player.position[0];
    const y = player.position[1];
    const matrix = shared.rotateMatrix(shared.types[player.type], player.rotation || 0);

    for (let dy = 0; dy < matrix.length; dy++) {
        for (let dx = 0; dx < matrix[0].length; dx++) {
            if (matrix[dy][dx]) {
                if (dx + x < _WIDTH && dy + y < _HEIGHT) {
                    _field[dx + x][dy + y] = {
                        type: player.type,
                        id: player.id,
                        owner: player.pid,
                        pixelId: _pixelId++
                    };
                }
            }
        }
    }
    newPiece(player);
    clearFinishedLines(player);
}

function isColliding(player: Player): boolean {
    if (!player.position || player.type === undefined) return false;

    const x = player.position[0];
    const y = player.position[1];
    const matrix = shared.rotateMatrix(shared.types[player.type], player.rotation || 0);

    for (let dy = 0; dy < matrix.length; dy++) {
        for (let dx = 0; dx < matrix[0].length; dx++) {
            if (matrix[dy][dx]) {
                if (
                    dx + x < 0 ||
                    dy + y < 0 ||
                    dx + x >= _WIDTH ||
                    dy + y >= _HEIGHT ||
                    _field[dx + x][dy + y]
                ) {
                    return true;
                }
            }
        }
    }
    return false;
}

function extendField(): void {
    const nMatrix = shared.newMatrix(_WIDTH + _extendBy, _HEIGHT) as GameField;

    for (let x = 0; x < _WIDTH; x++) {
        for (let y = 0; y < _HEIGHT; y++) {
            nMatrix[x][y] = _field[x][y];
        }
    }
    _field = nMatrix;
    _WIDTH += _extendBy;
}

function reduceField(): void {
    const nMatrix = shared.newMatrix(_WIDTH - _extendBy, _HEIGHT) as GameField;

    for (let x = 0; x < _WIDTH - _extendBy; x++) {
        for (let y = 0; y < _HEIGHT; y++) {
            nMatrix[x][y] = _field[x][y];
        }
    }

    for (let i = 0; i < _player.length; i++) {
        if (_player[i].position && _player[i].position![0] + 5 >= _WIDTH - _extendBy) {
            _player[i].position![0] -= 5;
        }
    }

    _WIDTH -= _extendBy;
    _field = nMatrix;
}
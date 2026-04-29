import Mousetrap from 'mousetrap';
import type { ExtendedKeyboardEvent } from 'mousetrap';
import Hammer from 'hammerjs';
import type { Socket } from 'socket.io-client';
import shared, { GameField, GamePiece, Player } from './shared';

interface RenderData {
  players: Player[];
  field: GameField;
  score: number;
}

export function initPolyblocks(socket: Socket, canvas: HTMLElement): void {
  const scoresContainer = document.getElementById('scores');
  if (!scoresContainer) {
    throw new Error('Missing #scores element');
  }

  function render(data: RenderData, containerElement: HTMLElement): void {
    const maxWidth = 600;
    let pixelSize = 14;

    function drawHtmlInc(x: number, y: number, pixel: GamePiece): void {
      const pixelElement = document.createElement('div');
      const styleString =
        'left:' + ((x / data.field.length) * 100).toFixed(1) + '%;' +
        'top:' + ((y / data.field[0].length) * 100).toFixed(1) + '%;';

      pixelElement.className = 'pixel block-' + pixel.owner + '-' + pixel.type;
      pixelElement.setAttribute('style', styleString);

      containerElement.appendChild(pixelElement);
    }

    containerElement.innerHTML = '';

    const newPixelSize = Math.round(maxWidth / data.field.length);
    let width: number;
    let height: number;
    if (newPixelSize < pixelSize) {
      pixelSize = newPixelSize;
      width = newPixelSize * data.field.length;
      height = newPixelSize * data.field[0].length;
    } else {
      width = pixelSize * data.field.length;
      height = pixelSize * data.field[0].length;
    }

    containerElement.setAttribute(
      'style',
      'width:' + width + 'px;height:' + height + 'px',
    );

    const styleElement = document.createElement('style');
    styleElement.textContent =
      '.pixel {' +
      'width:' + (1 / data.field.length * 100).toFixed(1) + '%;' +
      'height:' + (1 / data.field[0].length * 100).toFixed(1) + '%;' +
      '}';
    containerElement.appendChild(styleElement);

    scoresContainer!.innerHTML = '';

    data.players.forEach((player) => {
      if (
        !player.position ||
        player.type === undefined ||
        player.id === undefined
      ) {
        return;
      }

      const x = player.position[0];
      const y = player.position[1];
      const matrix = shared.rotateMatrix(
        shared.types[player.type],
        player.rotation || 0,
      );

      for (let dy = 0; dy < matrix.length; dy++) {
        for (let dx = 0; dx < matrix[0].length; dx++) {
          if (matrix[dy][dx]) {
            data.field[dx + x][dy + y] = {
              id: player.id,
              owner: player.pid,
              type: player.type,
              pixelId: 0,
            };
          }
        }
      }

      const scoreSpan = document.createElement('span');
      scoreSpan.textContent = String(player.score);
      scoreSpan.className = 'block-' + player.pid + '-3';
      scoresContainer!.appendChild(scoreSpan);
    });

    for (let x = 0; x < data.field.length; x++) {
      for (let y = 0; y < data.field[0].length; y++) {
        const cell = data.field[x][y];
        if (cell) {
          drawHtmlInc(x, y, cell);
        }
      }
    }

    console.timeEnd('render');
  }

  const modifications = {
    rotateRight: () => socket.emit('update', 'up'),
    rotateLeft: () => socket.emit('update', 'down'),
    moveRight: () => socket.emit('update', 'right'),
    moveLeft: () => socket.emit('update', 'left'),
    moveDown: () => socket.emit('update', 'space'),
  };

  const keymap: Record<string, (e: ExtendedKeyboardEvent) => void> = {
    up: (e) => { e.preventDefault(); modifications.rotateRight(); },
    right: (e) => { e.preventDefault(); modifications.moveRight(); },
    down: (e) => { e.preventDefault(); modifications.rotateLeft(); },
    left: (e) => { e.preventDefault(); modifications.moveLeft(); },
    space: (e) => { e.preventDefault(); modifications.moveDown(); },
  };

  for (const key in keymap) {
    Mousetrap.bind(key, keymap[key]);
  }

  const touchMap: Record<string, () => void> = {
    swipeup: modifications.rotateRight,
    panup: modifications.rotateRight,
    tap: modifications.rotateRight,
    swipedown: modifications.moveDown,
    pandown: modifications.moveDown,
    swiperight: modifications.moveRight,
    panright: modifications.moveRight,
    swipeleft: modifications.moveLeft,
    panleft: modifications.moveLeft,
  };

  const hammer = new Hammer(document.body);
  hammer.get('swipe').set({ velocity: 0.1 });
  hammer.get('pan').set({ direction: Hammer.DIRECTION_ALL });

  let latestX: number | null = null;

  hammer.on('panstart', (event) => {
    latestX = event.center.x;
  });

  hammer.on('panleft panright swipedown swipeup tap', (event) => {
    if (event.type === 'panleft' || event.type === 'panright') {
      if (latestX !== null && Math.abs(latestX - event.center.x) >= 15) {
        touchMap[event.type]();
        latestX = event.center.x;
      }
    } else {
      const fn = touchMap[event.type];
      if (fn) fn();
    }
  });

  socket.on('base', (data: RenderData) => {
    console.time('render');
    console.log(data);
    render(data, canvas);
  });
}

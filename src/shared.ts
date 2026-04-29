export interface GamePiece {
  type: number;
  id: number;
  owner: number;
  pixelId: number;
}

export interface Player {
  pid: number;
  name: string;
  score: number;
  position?: [number, number];
  rotation?: number;
  type?: number;
  id?: number;
}

export type GameField = (GamePiece | undefined)[][];
export type Matrix = number[][];

const types: Matrix[] = [
  [
    [0, 0, 0, 0, 0],
    [0, 0, 1, 0, 0],
    [0, 1, 1, 1, 0],
    [0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0],
  ],
  [
    [0, 0, 0, 0, 0],
    [0, 0, 1, 1, 0],
    [0, 1, 1, 0, 0],
    [0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0],
  ],
  [
    [0, 0, 0, 0, 0],
    [0, 1, 1, 0, 0],
    [0, 0, 1, 1, 0],
    [0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0],
  ],
  [
    [0, 0, 0, 0, 0],
    [0, 1, 1, 0, 0],
    [0, 1, 1, 0, 0],
    [0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0],
  ],
  [
    [0, 0, 0, 0, 0],
    [0, 0, 1, 0, 0],
    [0, 0, 1, 0, 0],
    [0, 0, 1, 0, 0],
    [0, 0, 1, 0, 0],
  ],
  [
    [0, 0, 0, 0, 0],
    [0, 0, 1, 0, 0],
    [0, 0, 1, 0, 0],
    [0, 0, 1, 0, 0],
    [0, 0, 1, 0, 0],
  ],
  [
    [0, 0, 0, 0, 0],
    [0, 0, 1, 0, 0],
    [0, 0, 1, 0, 0],
    [0, 1, 1, 0, 0],
    [0, 0, 0, 0, 0],
  ],
  [
    [0, 0, 0, 0, 0],
    [0, 0, 1, 0, 0],
    [0, 0, 1, 0, 0],
    [0, 0, 1, 1, 0],
    [0, 0, 0, 0, 0],
  ],
];

function newMatrix<T = undefined>(n: number, m: number): T[][] {
  const matrix: T[][] = [];
  for (let y = 0; y < n; y++) {
    const row: T[] = [];
    for (let x = 0; x < m; x++) {
      row.push(undefined as unknown as T);
    }
    matrix.push(row);
  }
  return matrix;
}

function rotateMatrix(matrix: Matrix, reps: number): Matrix {
  for (let n = 0; n < reps; n++) {
    const rotMatrix = newMatrix<number>(matrix.length, matrix[0].length);
    for (let y = 0; y < matrix.length; y++) {
      for (let x = 0; x < matrix[0].length; x++) {
        rotMatrix[x][matrix[0].length - 1 - y] = matrix[y][x];
      }
    }
    matrix = rotMatrix;
  }
  return matrix;
}

const shared = { types, newMatrix, rotateMatrix };

export { newMatrix, rotateMatrix, types };
export default shared;

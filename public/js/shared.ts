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

const shared = {
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
  ] as Matrix[],

  newMatrix(n: number, m: number): (undefined)[][] {
    const matrix: (undefined)[][] = [];

    for (let y = 0; y < n; y++) {
      matrix.push([]);
      for (let x = 0; x < m; x++) {
        matrix[y].push(undefined);
      }
    }

    return matrix;
  },

  rotateMatrix(matrix: Matrix, reps: number): Matrix {
    let rotMatrix: Matrix;
    let n: number;

    for (n = 0; n < reps; n++) {
      rotMatrix = this.newMatrix(matrix.length, matrix[0].length) as unknown as Matrix;
      for (let y = 0; y < matrix.length; y++) {
        for (let x = 0; x < matrix[0].length; x++) {
          rotMatrix[x][matrix[0].length - 1 - y] = matrix[y][x];
        }
      }
      matrix = rotMatrix;
    }

    return matrix;
  }
};

if (typeof module === "object" && module && typeof module.exports === "object") {
  module.exports = shared;
}

export default shared;
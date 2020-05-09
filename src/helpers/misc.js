import { store } from "./store";

//--------------------------------------------------//

// Tile is the object to hold information about a chess piece.
// E.g. id (enumaration from 0..31, also index of tiles array),
// type (br=black rook, bb=black bishop, bk=balck king, bq=black 
// queen, bn=black knight, bp=black pawn
// same for wr==white rook etc., x and y
// for the chess coords starting at (0, 0) in the top left
// corner of the board. Thus (0, 0) is the top left field
// no matter what the player's color is.
export function Tile(id, type, x, y) {
  this.id = id;
  this.type = type;
  this.x = x;
  this.y = y;
}

//--------------------------------------------------//

export function initTiles() {
  // console.log("misc.js::initTiles");
  let t = [];
  t[0] = new Tile(0, "br", 0, 0);
  t[1] = new Tile(1, "bn", 1, 0);
  t[2] = new Tile(2, "bb", 2, 0);
  t[3] = new Tile(3, "bq", 3, 0);
  t[4] = new Tile(4, "bk", 4, 0);
  t[5] = new Tile(5, "bb", 5, 0);
  t[6] = new Tile(6, "bn", 6, 0);
  t[7] = new Tile(7, "br", 7, 0);

  t[8] = new Tile(8, "bp", 0, 1);
  t[9] = new Tile(9, "bp", 1, 1);
  t[10] = new Tile(10, "bp", 2, 1);
  t[11] = new Tile(11, "bp", 3, 1);
  t[12] = new Tile(12, "bp", 4, 1);
  t[13] = new Tile(13, "bp", 5, 1);
  t[14] = new Tile(14, "bp", 6, 1);
  t[15] = new Tile(15, "bp", 7, 1);

  t[16] = new Tile(16, "wp", 0, 6);
  t[17] = new Tile(17, "wp", 1, 6);
  t[18] = new Tile(18, "wp", 2, 6);
  t[19] = new Tile(19, "wp", 3, 6);
  t[20] = new Tile(20, "wp", 4, 6);
  t[21] = new Tile(21, "wp", 5, 6);
  t[22] = new Tile(22, "wp", 6, 6);
  t[23] = new Tile(23, "wp", 7, 6);

  t[24] = new Tile(24, "wr", 0, 7);
  t[25] = new Tile(25, "wn", 1, 7);
  t[26] = new Tile(26, "wb", 2, 7);
  t[27] = new Tile(27, "wq", 3, 7);
  t[28] = new Tile(28, "wk", 4, 7);
  t[29] = new Tile(29, "wb", 5, 7);
  t[30] = new Tile(30, "wn", 6, 7);
  t[31] = new Tile(31, "wr", 7, 7);

  return t;
}

//--------------------------------------------------//

// getTileFromCoords returns the tile that is on chessboard
// fieled x (left) and y (top), starting at (0, 0).
// Mirrored if player's color is black...
export function getTileIdFromCoords(x, y) {
  // console.log(`misc.js::getTileIdFromCoords::x=${x}, y=${y}`);

  for (let i = 0; i < 32; i++) {
    if (store.state.tiles[i].x === x && store.state.tiles[i].y === y) {
      // console.log(`misc.js::getTileIdFromCoords::returned TileId=${i}`);
      return i;
    }
  }
  return -1;
}

//--------------------------------------------------//

export function DashedBox(id, x, y, visible) {
  this.id = id;
  this.x = x;
  this.y = y;
  this.visible = visible;
}

//--------------------------------------------------//

export const DASHED_BOX_INDEX_OFFSET = 40;

export function initDashedBoxes() {
  let db = [];
  db[0] = new DashedBox(DASHED_BOX_INDEX_OFFSET + 0, 0, 0, "hidden");
  db[1] = new DashedBox(DASHED_BOX_INDEX_OFFSET + 1, 0, 0, "hidden");
  return db;
}

//--------------------------------------------------//

export function Coords(x, y) {
  this.x = x;
  this.y = y;
}

//=========================================================//
// calcCoords calculates the x (left) and y (top) index
// of the field on the chessboard touched by the absolute
// coordinates (pageX, pageY) and the offset of the
// chessboard given by offsetX (left) and offsetY (top).
//
export function calcCoords(absX, absY, offsetX, offsetY) {
  // console.log("misc.js::calcCoords");
  // const fieldWidth = parseInt(store.state.innerBoardWidth / 8);
  const fieldWidth = store.state.innerBoardWidth / 8;
  const relX = absX - offsetX - store.state.innerBoardOffsetX;
  const relY = absY - offsetY - store.state.innerBoardOffsetY;
  const x = parseInt(relX / fieldWidth);
  const y = parseInt(relY / fieldWidth);
  return new Coords(x, y);
}

//--------------------------------------------------//

export const SQUARE_COORDS = [
  ["a8", "b8", "c8", "d8", "e8", "f8", "g8", "h8"],
  ["a7", "b7", "c7", "d7", "e7", "f7", "g7", "h7"],
  ["a6", "b6", "c6", "d6", "e6", "f6", "g6", "h6"],
  ["a5", "b5", "c5", "d5", "e5", "f5", "g5", "h5"],
  ["a4", "b4", "c4", "d4", "e4", "f4", "g4", "h4"],
  ["a3", "b3", "c3", "d3", "e3", "f3", "g3", "h3"],
  ["a2", "b2", "c2", "d2", "e2", "f2", "g2", "h2"],
  ["a1", "b1", "c1", "d1", "e1", "f1", "g1", "h1"]
];

//--------------------------------------------------//

export function coordsToSan(coords) {
  // console.log(`misc.js::coordsToSan::coords=(${coords.x}, ${coords.y})`);
  return SQUARE_COORDS[coords.y][coords.x];
}

//--------------------------------------------------//

export function sanToCoords(san) {
  // console.log("misc.js::sanToCoords::san=", san);
  const x = san.charCodeAt(0) - 97;
  const y = -(parseInt(san[1]) - 8);
  return new Coords(x, y);
}

//--------------------------------------------------//

export function throttled(delay, fn) {
  let lastCall = 0;
  return function(...args) {
    const now = new Date().getTime();
    if (now - lastCall < delay) {
      return;
    }
    lastCall = now;
    return fn(...args);
  };
}

//--------------------------------------------------//

export function chessToPageCoords(coords) {
  const newX =
    coords.x * (store.state.innerBoardWidth / 8) +
    store.state.innerBoardOffsetX;
  const newY =
    coords.y * (store.state.innerBoardWidth / 8) +
    store.state.innerBoardOffsetY;
  return {
    x: newX,
    y: newY
  };
}

//--------------------------------------------------//

export function mirrorCoords(coords) {
  if (store.state.playersColor === "b") {
    return { x: 7 - coords.x, y: 7 - coords.y };
  }
  // color === "w" => do nothing
  return coords;
}

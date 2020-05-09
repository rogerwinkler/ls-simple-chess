import { initTiles, initDashedBoxes, getTileIdFromCoords } from "./misc";

export const FEN_START_POS =
  "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
export const FEN_EMPTY_POS = "8/8/8/8/8/8/8/8";

export var store = {
  debug: false,

  state: {
    // material and layout/position
    tiles: initTiles(),
    boardWidth: 0,
    fieldWidth: 0,
    boardOffsetX: 0, // offset of board (img) in relation to document (page)
    boardOffsetY: 0, // offset of board (img) in relation to document (page)
    innerBoardWidth: 0, // set in setBoardWidth()
    innerBoardOffsetX: 0, // offset of innerBoard in relation to board (img), set in setBoardWidth()
    innerBoardOffsetY: 0, // offset of innerBoard in relation to board (img),set in setBoardWidth()
    dashedBoxes: initDashedBoxes(),
    blackTilesRemoved: [], // array of black tileIDs removed after capture
    whiteTilesRemoved: [], // array of white tileIDs removed after capture
    promotedTiles: [], // array of tileIDs that have been promoted
    chess: null,

    // settings
    levelOfDifficulty: 2,
    playersColor: "w",
    opponentsColor: "b",
    showOpponentsLastMove: true,

    // game control
    dragTileId: null,
    dragTileOffsetX: 0,
    dragTileOffsetY: 0,
    dragFromX: null,
    dragFromY: null,
    dragStatus: "start" // one of: "start", "downPressed", "dragging"
  },

  //------------------------------------------------------------//

  pushToPromotedTiles(tileId) {
    if (this.debug)
      console.log("DEBUG: store.js::pushToPromotedTiles::tileId=", tileId);
    this.state.promotedTiles.push(tileId);
  },

  //------------------------------------------------------------//

  popFromPromotedTiles() {
    if (this.debug) console.log("DEBUG: store.js::popFromPromotedTiles");
    return this.state.promotedTiles.pop();
  },

  //------------------------------------------------------------//

  logTiles() {
    // even if var 'debug' is false
    const board = [
      [".", ".", ".", ".", ".", ".", ".", "."],
      [".", ".", ".", ".", ".", ".", ".", "."],
      [".", ".", ".", ".", ".", ".", ".", "."],
      [".", ".", ".", ".", ".", ".", ".", "."],
      [".", ".", ".", ".", ".", ".", ".", "."],
      [".", ".", ".", ".", ".", ".", ".", "."],
      [".", ".", ".", ".", ".", ".", ".", "."],
      [".", ".", ".", ".", ".", ".", ".", "."]
    ];
    for (let i = 0; i < 32; i++) {
      // console.log(`store.state.tile[${i}]=`, this.state.tiles[i]);

      // don't show removed tiles
      if (
        this.state.tiles[i].x > -1 &&
        this.state.tiles[i].x < 8 &&
        this.state.tiles[i].y > -1 &&
        this.state.tiles[i].y < 8
      ) {
        board[this.state.tiles[i].y][this.state.tiles[i].x] = this.state.tiles[
          i
        ].type;
      }
    }
    console.log("store.state.tiles = ", board);

    // log as ascii...
    let ascii = "   +------------------------+\n";
    for (let i = 0; i < 8; i++) {
      ascii =
        ascii + " " + (8 - i).toString() + " | " + board[i].join("  ") + " |\n";
    }

    ascii = ascii + "   +------------------------+\n";
    ascii = ascii + "     a  b  c  d  e  f  g  h\n";
    console.log(ascii);

    // show chess' state in comparison...
    const chessAscii = store.state.chess.ascii();
    console.log(chessAscii);
    if (ascii === chessAscii) {
      console.log("Representations are IDENTICAL!");
    } else {
      console.log("Representations are !!!!! NOT !!!!! identical!");
    }
  },

  //------------------------------------------------------------//

  resetPromotedTiles() {
    if (this.debug) console.log("DEBUG: store.js::resetPromotedTiles");
    for (let i = 0; i < this.state.promotedTiles.length; i++) {
      const tile = document.getElementById(this.state.promotedTiles[i]);
      const tileType = this.state.promotedTiles[i] < 16 ? "bp" : "wp";
      tile.setAttribute("src", "statics/chess/" + tileType + ".svg");
    }
    this.state.promotedTiles = [];
  },

  //------------------------------------------------------------//

  setTileType(tileId, newType) {
    if (this.debug)
      console.log("DEBUG: store.js::setTileType::newType", newType);
    this.state.tiles[tileId].type = newType;
  },

  //------------------------------------------------------------//

  resetTilesRemoved() {
    if (this.debug) console.log("DEBUG: store.js::resetTilesRemoved");
    this.state.blackTilesRemoved = [];
    this.state.whiteTilesRemoved = [];
  },

  //------------------------------------------------------------//

  setShowOpponentsLastMove(newVal) {
    if (this.debug)
      console.log("DEBUG: store.js::setShowOpponentsLastMove::newVal=", newVal);
    this.state.showOpponentsLastMove = newVal;
    if (!newVal) {
      this.hideDashedBox(0);
      this.hideDashedBox(1);
    }
  },

  //------------------------------------------------------------//

  pushBlackTilesRemoved(tileId) {
    if (this.debug)
      console.log("DEBUG: store.js::addBlackTilesRemoved::tileId=", tileId);
    this.state.blackTilesRemoved.push(tileId);
  },

  //------------------------------------------------------------//

  pushWhiteTilesRemoved(tileId) {
    if (this.debug)
      console.log("DEBUG: store.js::addWhiteTilesRemoved::tileId =", tileId);
    this.state.whiteTilesRemoved.push(tileId);
  },

  //------------------------------------------------------------//

  popBlackTilesRemoved() {
    if (this.debug) console.log("DEBUG: store.js::popBlackTilesRemoved");
    return this.state.blackTilesRemoved.pop();
  },

  //------------------------------------------------------------//

  popWhiteTilesRemoved() {
    if (this.debug) console.log("DEBUG: store.js::popWhiteTilesRemoved");
    return this.state.whiteTilesRemoved.pop();
  },

  //------------------------------------------------------------//

  setBoardOffsets(newX, newY) {
    if (this.debug)
      console.log(
        `DEBUG: store.js::setBoardOffsets::newX=${newX}, newY=${newY}`
      );
    this.state.boardOffsetX = newX;
    this.state.boardOffsetY = newY;
  },

  //------------------------------------------------------------//

  setDashedBox(id, coords) {
    if (this.debug)
      console.log(
        `DEBUG: store.js::setDashedBox::id=${id}, coords=(${coords.x}, ${coords.y})`
      );
    this.state.dashedBoxes[id].x = coords.x;
    this.state.dashedBoxes[id].y = coords.y;
  },

  //------------------------------------------------------------//

  hideDashedBox(id) {
    if (this.debug) console.log("DEBUG: store.js::hideDashedBox::id=", id);
    this.state.dashedBoxes[id].visible = "hidden";
  },

  //------------------------------------------------------------//

  showDashedBox(id) {
    if (this.debug) console.log("DEBUG: store.js::showDashedBox::id=", id);
    this.state.dashedBoxes[id].visible = "visible";
  },

  //------------------------------------------------------------//

  setTile(id, coords) {
    if (this.debug)
      console.log(
        `DEBUG: store.js::setTile::coords=(${coords.x}, ${coords.y})`
      );
    this.state.tiles[id].x = coords.x;
    this.state.tiles[id].y = coords.y;

    // for (let i = 0; i < 32; i++) {
    //   console.log(
    //     `storejs::setTile::Tile (${i}): x=${this.state.tiles[i].x}, y=${this.state.tiles[i].y}`
    //   );
    // }
  },

  //------------------------------------------------------------//

  init() {
    if (this.debug) console.log("store.js::init");
    this.state.tiles = initTiles();
  },

  //------------------------------------------------------------//

  setBoardWidth(newVal) {
    if (this.debug)
      console.log("DEBUG: store.js::setBoardWidth::newVal=", newVal);
    this.state.boardWidth = newVal;

    // Calculations for chessboard-with-captions-6.svg
    // this.state.innerBoardWidth = (newVal * 106) / 123;
    // this.state.innerBoardOffsetX = (newVal * 11) / 123;
    // this.state.innerBoardOffsetY = (newVal * 6) / 123;

    // Calculations for chessboard-with-captions-7.svg
    this.state.innerBoardWidth = newVal; // no border on this image
    this.state.innerBoardOffsetX = 0;
    this.state.innerBoardOffsetY = 0;

    this.state.fieldWidth = this.state.innerBoardWidth / 8;

    if (this.debug)
      console.log(
        `DEBUG: store.js::setBoardWidth::boardWidth=${this.state.boardWidth}, innerBoardWidth=${this.state.innerBoardWidth}, innerBoardOffsetX=${this.state.innerBoardOffsetX}, innerBoardOffsetY=${this.state.innerBoardOffsetY}`
      );
  },

  //------------------------------------------------------------//

  setChess(newVal) {
    if (this.debug) console.log("DEBUG: store.js::setChess::newVal=", newVal);
    this.state.chess = newVal;
  },

  //------------------------------------------------------------//

  setLevelOfDifficulty(newVal) {
    if (this.debug)
      console.log("DEBUG: store.js::setLevelOfDifficulty::newVal=", newVal);
    this.state.levelOfDifficulty = newVal;
  },

  //------------------------------------------------------------//

  setPlayersColor(newVal) {
    if (this.debug)
      console.log("DEBUG: store.js::setPlayersColor::newVal=", newVal);
    if (newVal === "w") {
      this.state.playersColor = "w";
      this.state.opponentsColor = "b";
    } else {
      this.state.playersColor = "b";
      this.state.opponentsColor = "w";
    }
  },

  //------------------------------------------------------------//

  setDragTileId(newVal) {
    if (this.debug)
      console.log("DEBUG: store.js::setDragTileId::newVal=", newVal);
    this.state.dragTileId = newVal;
  },

  //------------------------------------------------------------//

  setDragFrom(coords) {
    if (this.debug)
      console.log(`DEBUG: store.js::setDragFrom::coords=${coords}`);
    this.state.dragFromX = coords.x;
    this.state.dragFromY = coords.y;
  },

  //------------------------------------------------------------//

  setDragTileOffset(newX, newY) {
    if (this.debug)
      console.log(
        `DEBUG: store.js::setDragTileOffset::newX=${newX}, newY=${newY}`
      );
    this.dragTileOffsetX = newX;
    this.dragTileOffsetY = newY;
  },

  //------------------------------------------------------------//

  setDragStatus(newVal) {
    if (this.debug)
      console.log("DEBUG: store.js::setDragStatus::newVal=", newVal);
    this.state.dragStatus = newVal;
  }
};

import { store } from "./store";
import {
  calcCoords,
  getTileIdFromCoords,
  coordsToSan,
  sanToCoords,
  chessToPageCoords,
  mirrorCoords
} from "./misc";
import { Notify } from "quasar";
import { minimaxRoot } from "./ai";

//---------------------------------------------------------//
export function touchDown(x, y) {
  // console.log(`animation.js::touchDown::x=${x}, y=${y}`);

  switch (store.state.dragStatus) {
    case "start":
      const coords = calcCoords(
        x,
        y,
        store.state.boardOffsetX,
        store.state.boardOffsetY
      );
      // console.log("animation.js::touchDown::coords=", coords);

      const mirroredCoords = mirrorCoords(coords);
      const tileId = getTileIdFromCoords(mirroredCoords.x, mirroredCoords.y);

      // check color
      if (
        (store.state.playersColor === "w" && tileId < 16) ||
        (store.state.playersColor === "b" && tileId > 15)
      ) {
        // wrong color don't drag
        return;
      }

      // console.log("animation.js::touchDown::tileId=", tileId);

      if (tileId >= 0) {
        // a tile is hit...
        store.setDragTileId(tileId);
        // store.setDragTileOffset(e.offsetX, e.offsetY);
        store.setDragTileOffset(
          x -
            (coords.x * store.state.innerBoardWidth) / 8 -
            store.state.boardOffsetX -
            store.state.innerBoardOffsetX,
          y -
            (coords.y * store.state.innerBoardWidth) / 8 -
            store.state.boardOffsetY -
            store.state.innerBoardOffsetX
        );
        store.setDragFrom(mirrorCoords(coords));
        // console.log(
        //   `animation::touchDown::dragFrom=(${store.state.dragFromX}, ${store.state.dragFromY})`
        // );
        store.setDragStatus("downPressed");
      }
      break;
    case "downPressed":
      // do nothing
      break;
    case "dragging":
      dragToStartPos();
      store.setDragStatus("downPressed");
      break;
  }
}

//---------------------------------------------------------//

export function touchMove(x, y) {
  switch (store.state.dragStatus) {
    case "start":
      // do nothing, no tile picked...
      break;
    case "downPressed":
      dragTo(x, y);
      store.setDragStatus("dragging");
      break;
    case "dragging":
      dragTo(x, y);
      break;
  }
}

//-----------------------------------------------------------------------------//

export function touchUp(x, y) {
  switch (store.state.dragStatus) {
    case "start":
      // do nothing
      break;
    case "downPressed":
      // do nothing, tile not moved
      break;
    case "dragging":
      // dragTo(e.x, e.y);
      dropTo(x, y);
      store.setDragStatus("start");
      break;
  }
}

//-----------------------------------------------------------------------------//

export function touchLeave(x, y) {
  switch (store.state.dragStatus) {
    case "start":
      // do nothing, tile not moved
      break;
    case "downPressed":
      store.setDragStatus("start");
      break;
    case "dragging":
      dragToStartPos();
      store.setDragStatus("start");
      break;
  }
}

//-----------------------------------------------------------------------------//

export function dragTilesToPos() {
  // console.log(`animation.js::dragTilesToPos`);
  let pageCoords, tile;

  for (let i = 0; i < 32; i++) {
    pageCoords = chessToPageCoords(
      mirrorCoords({
        x: store.state.tiles[i].x,
        y: store.state.tiles[i].y
      })
    );
    tile = document.getElementById(i);
    // console.log(`animation.js::dragToTilesToPos::tile=`, tile);
    tile.velocity(
      { left: pageCoords.x + "px", top: pageCoords.y + "px" },
      { duration: 1, drag: true }
    );
  }
}

//-----------------------------------------------------------------------------//

function dragTo(x, y) {
  // console.log(`animation.js::dragTo::x=${x}, y=${y}`);
  // console.log(
  //   `animation.js::dragTo::store.state.dragTileId=${store.state.dragTileId}`
  // );

  // const coords = mirrorCoords({ x: x, y: y });
  const newX =
    x -
    store.state.boardOffsetX -
    store.state.dragTileOffsetX -
    store.state.innerBoardWidth / (8 * 2); // half of fieldwidth
  const newY =
    y -
    store.state.boardOffsetY -
    store.state.dragTileOffsetY -
    store.state.innerBoardWidth / (8 * 2); // half of fieldwidth
  // console.log(`animation.js::dragTo::newX=${newX}, newX=${newY}`);
  const tile = document.getElementById(store.state.dragTileId);
  // console.log(`animation.js::dragTo::tile=`, tile);
  tile.velocity(
    { left: newX + "px", top: newY + "px" },
    { duration: 1, drag: true }
  );
}

//-----------------------------------------------------------------------------//

function dragToStartPos() {
  // console.log("animation.js::dragToStartPos");
  const tile = document.getElementById(store.state.dragTileId);
  // console.log(`animation.js::dragToStartPos::tile=`, tile);
  // console.log(
  //   `animation.js::dragToStartPos::dragFrom=(${store.state.dragFromX}, ${store.state.dragFromY})`
  // );

  const pageCoords = chessToPageCoords(
    mirrorCoords({
      x: store.state.dragFromX,
      y: store.state.dragFromY
    })
  );
  tile.velocity(
    { left: pageCoords.x + "px", top: pageCoords.y + "px" },
    { duration: 500, easing: "easeOutSine" }
  );
}

//-----------------------------------------------------------------------------//

function dropTo(x, y) {
  // console.log(`animation.js::dropTo::x=${x}, y=${y}`);
  const tile = document.getElementById(store.state.dragTileId);
  // console.log(`animation.js::dragToStartPos::tile=`, tile);

  const coords = calcCoords(
    x,
    y,
    store.state.boardOffsetX,
    store.state.boardOffsetY
  );
  // console.log(`animation.js::dropTo::coords=(${coords.x}, ${coords.y})`);
  if (coords.x < 0 || coords.y < 0 || coords.x > 7 || coords.y > 7) {
    // dropped outside
    dragToStartPos();
  }

  const pageCoords = chessToPageCoords(coords);
  // console.log(
  //   `animation.js::dropTo::pageCoords=(${pageCoords.x}, ${pageCoords.y})`
  // );
  tile.velocity(
    { left: pageCoords.x + "px", top: pageCoords.y + "px" },
    { duration: 100, easing: "easeOutSine" }
  );

  if (tryMove(coords)) {
    // give the user a chance to see the opponents move!
    setTimeout(() => {
      opponentMove();
    }, 1000);
  } else {
    // move tile back
    dragToStartPos();
  }
}

//-----------------------------------------------------------------------------//

function dragOpponent(tileId, coordsTo) {
  // console.log("animation.js::dragOpponent");
  const tile = document.getElementById(tileId);
  // console.log(`animation.js::dragOpponent::tile=`, tile);

  if (!tile) {
    Notify.create({
      message: "ERROR: Opponent tile not identified, sorry! Restart the game.",
      color: "primary"
    });
    return;
  }

  const pageCoords = chessToPageCoords(mirrorCoords(coordsTo));
  tile.velocity(
    { left: pageCoords.x + "px", top: pageCoords.y + "px" },
    { duration: 400, easing: "easeInOutSine" }
  );
}

//-----------------------------------------------------------------------------//

function removeTile(coords) {
  // console.log(`animation.js::removeTile::coords=(${coords.x}, ${coords.y})`);
  const tileId = getTileIdFromCoords(coords.x, coords.y);
  // console.log("store.js::removeTile::tileId=", tileId);

  if (tileId === null) {
    // console.log(
    //   `ERROR: animation.js::removeTile: tile (${x}, ${y}) not found!`
    // );
    return;
  }
  const tile = document.getElementById(tileId);
  let xPos, yPos;

  // Calc rest position of removed tile, depending on color
  if (store.state.tiles[tileId].type > "wa") {
    // black tile
    // console.log(
    //   "animation.js::removeTile::store.state.blackTilesRemoved=",
    //   store.state.blackTilesRemoved
    // );
    xPos = store.state.blackTilesRemoved.length % 8;

    // Calculation for chessboard-with-captions-6.svg
    // yPos = store.state.blackTilesRemoved.length < 7 ? -1.4 : -2.4;

    // Calculations for chessboard-with-captions-7.svg
    yPos = store.state.blackTilesRemoved.length < 8 ? -1 : -2;
    store.pushBlackTilesRemoved(tileId);
  } else {
    // white tile
    // console.log(
    //   "animation.js::removeTile::store.state.whiteTilesRemoved=",
    //   store.state.whiteTilesRemoved
    // );
    xPos = store.state.whiteTilesRemoved.length % 8;

    // Calculation for chessboard-with-captions-6.svg
    // yPos = store.state.whiteTilesRemoved.length < 7 ? 8.8 : 9.8;

    // Calculations for chessboard-with-captions-7.svg
    yPos = store.state.whiteTilesRemoved.length < 8 ? 8 : 9;
    store.pushWhiteTilesRemoved(tileId);
  }

  const pageCoords = chessToPageCoords(mirrorCoords({ x: xPos, y: yPos }));
  tile.velocity(
    { left: pageCoords.x + "px", top: pageCoords.y + "px" },
    { duration: 400, easing: "easeInOutSine" }
  );

  store.setTile(tileId, { x: xPos, y: yPos });
}

//-----------------------------------------------------------------------------//

function tryMove(coords) {
  // console.log(`animation.js::tryMove::coords=(${coords.x}, ${coords.y})`);

  // if game over, return...
  if (isGameOver()) return false;

  // if it's not the player's turn, return...
  if (store.state.playersColor !== store.state.chess.turn()) {
    dragToStartPos();
    Notify.create({
      message: "Not your turn!",
      color: "primary"
    });
    return false;
  }

  // Plausi check: coords inside of chessboard? If not, return false.
  if (coords.x < 0 || coords.x > 7 || coords.y < 0 || coords.y > 7)
    return false;

  const sanFrom = coordsToSan({
    x: store.state.dragFromX,
    y: store.state.dragFromY
  });
  // console.log(
  //   `animation.js::tryMove::dragFrom=(${store.state.dragFromX}, ${store.state.dragFromY})`
  // );
  // console.log("animation.js::tryMove::sanFrom=", sanFrom);

  const sanTo = coordsToSan(mirrorCoords(coords));
  // console.log("animation.js::tryMove::sanTo=", sanTo);

  // Try move...
  const tileFrom = store.state.chess.get(sanFrom);
  const tileTo = store.state.chess.get(sanTo);
  // console.log("animation.js::tryMove::tileFrom=", tileFrom);
  if (!tileFrom) {
    Notify.create({
      message: "ERROR: No tile selected in move!",
      color: "primary"
    });
    return false;
  }

  let moveObj = {
    from: sanFrom,
    to: sanTo
  };

  // if promotion...
  if (tileFrom.type === "bp" && coords.y === 0) moveObj.promotion = "bq";
  // if capture...
  if (tileTo) moveObj.captured = tileTo;

  // console.log("animation.js::tryMove::moveObj=", moveObj);
  const move = store.state.chess.move(moveObj);
  // console.log("animation.js::tryMove::move=", move);

  if (move) {
    if (move.flags.indexOf("e") > -1) {
      // en passant capture, remove opponents tile
      let epCoords = sanToCoords(move.to);
      if (store.state.playersColor === "w") {
        epCoords.y = epCoords.y + 1;
      } else {
        epCoords.y = epCoords.y - 1;
      }
      removeTile(mirrorCoords(epCoords));
    } else {
      if (tileTo) {
        // is capture => remove opponent's tile
        removeTile(mirrorCoords(coords));
      }
    }

    // check if promotion / queening
    if (move.flags.indexOf("p") > -1) {
      store.setTileType(
        store.state.dragTileId,
        store.state.playersColor === "w" ? "wq" : "bq"
      );
      const tile = document.getElementById(store.state.dragTileId);
      const tileType = store.state.playersColor === "w" ? "wq" : "bq";
      tile.setAttribute("src", "statics/chess/" + tileType + ".svg");
      store.pushToPromotedTiles(store.state.dragTileId);
    }

    // move tile on board
    store.setTile(store.state.dragTileId, mirrorCoords(coords));

    // DEBUG
    // store.logTiles();

    setTimeout(() => {
      if (store.state.chess.in_check()) {
        // console.log("animation.js::tryMove::in_check");
        Notify.create({
          message: "Check!",
          color: "primary"
        });
      }
    }, 10);
  } else {
    dragToStartPos();
    Notify.create({
      message: "Illegal move!",
      color: "primary"
    });
    return false;
  }
  return true;
}

//-----------------------------------------------------------------------------//

export function opponentMove() {
  // console.log("animation.js::opponentMove");
  if (isGameOver()) return;

  // find best move according to level of difficulty...
  const bestMove = minimaxRoot(
    store.state.levelOfDifficulty,
    store.state.chess,
    true
  );
  // console.log("animation.js::opponentMove::bestMove=", bestMove);

  // move opponent's tile...
  const opponentsMove = store.state.chess.move(bestMove);
  // console.log("animation.js::opponentMove::opponentMove=", opponentsMove);

  if (!opponentsMove) {
    // console.log(
    //   "ERROR: animation.js::opponentMove: no best move found for opponent!"
    // );
    Notify.create({
      message:
        "ERROR: No move found for opponent, sorry! Restart the game please.",
      color: negative
    });
    return;
  }

  const opCoordsTo = sanToCoords(opponentsMove.to);
  if (opponentsMove.flags.indexOf("e") > -1) {
    // en passant capture, remove player's tile
    const epCoords = sanToCoords(opponentsMove.to);
    epCoords.y = epCoords.y - 1;
    removeTile(mirrorCoords(epCoords));
  } else {
    if (opponentsMove.san.indexOf("x") > -1) {
      // capture => remove tile
      removeTile(mirrorCoords(opCoordsTo));
      // console.log(
      //   `animation.js::opponentMove::store.removeTile::x=${opCoordsTo.x}, y=${opCoordsTo.y}`
      // );
    }
  }

  // Move opponent's tile
  const opCoordsFrom = sanToCoords(opponentsMove.from);
  const opponentsTileId = getTileIdFromCoords(opCoordsFrom.x, opCoordsFrom.y);
  // console.log("animation.js::opponentMove::opponentsTileId=", opponentsTileId);
  dragOpponent(opponentsTileId, opCoordsTo);
  store.setTile(opponentsTileId, opCoordsTo);
  // console.log(
  //   `animation.js::opponentMove::store.setTile::id=${opponentsTileId}, x=${opCoordsTo.x}, y=${opCoordsTo.y}`
  // );

  // check if castling... king has already been moved... move rook...
  let newRookCoords, rookTileId;
  if (
    opponentsMove.flags.indexOf("q") > -1 ||
    opponentsMove.flags.indexOf("k") > -1
  ) {
    if (opponentsMove.flags.indexOf("q") > -1) {
      // queenside castling...
      rookTileId = 0;
      newRookCoords = { x: 3, y: 0 };
    } else {
      // kingside castling...
      rookTileId = 7;
      newRookCoords = { 5: 3, y: 0 };
    }
    dragOpponent(rookTileId, newRookCoords);
    store.setTile(rookTileId, newRookCoords);
  }

  // check if promotion / queening
  if (opponentsMove.flags.indexOf("p") > -1) {
    store.setTileType(
      opponentsTileId,
      store.state.playersColor === "w" ? "bq" : "wq"
    );
    const tile = document.getElementById(opponentsTileId);
    const tileType = store.state.playersColor === "w" ? "bq" : "wq";
    tile.setAttribute("src", "statics/chess/" + tileType + ".svg");
    store.pushToPromotedTiles(opponentsTileId);
  }

  // Show last move if according to settings...
  if (store.state.showOpponentsLastMove) {
    // give the tile some time to move before showing the dashed boxes
    setTimeout(() => {
      store.setDashedBox(0, mirrorCoords(opCoordsFrom));
      store.showDashedBox(0);
      store.setDashedBox(1, mirrorCoords(opCoordsTo));
      store.showDashedBox(1);
    }, 400);
  }

  // DEBUG
  // store.logTiles();

  setTimeout(() => {
    if (store.state.chess.in_check()) {
      // console.log("animation.js::opponentMove::in_check");
      Notify.create({
        message: "Check!",
        color: "primary"
      });
    }
    // Check if game is over...
    isGameOver();
  }, 10);
}

//-----------------------------------------------------------------------------//

function isGameOver() {
  // console.log("animation.js::isGameOver");
  let isOver = false;

  if (store.state.chess.in_checkmate()) {
    // console.log("animation.js::isGameOver::in_checkmate");
    isOver = true;
    Notify.create({
      message: "Checkmate!",
      color: "primary"
    });
  }

  if (store.state.chess.in_draw()) {
    // console.log("animation.js::isGameOver::in_draw");
    isOver = true;
    Notify.create({
      message: "Draw!",
      color: "primary"
    });
  }

  if (store.state.chess.in_stalemate()) {
    // console.log("animation.js::isGameOver::in_stalemate");
    isOver = true;
    Notify.create({
      message: "Stalemate!",
      color: "primary"
    });
  }

  if (store.state.chess.in_threefold_repetition()) {
    // console.log("animation.js::isGameOver::in_threefold_repetition");
    isOver = true;
    Notify.create({
      message: "Threefold repetition!",
      color: "primary"
    });
  }

  if (store.state.chess.insufficient_material()) {
    // console.log("animation.js::isGameOver::insufficient_material");
    isOver = true;
    Notify.create({
      message: "Insufficient material!",
      color: "primary"
    });
  }

  if (store.state.chess.game_over()) {
    // console.log("animation.js::isGameOver::game_over");
    isOver = true;
    Notify.create({
      message: "Game Over!",
      color: "primary",
      position: "center"
    });
  }

  return isOver;
}

//-----------------------------------------------------------------------------//

function castling(side) {
  if (isGameOver()) return false;

  // if it's not the player's turn, return...
  if (store.state.playersColor[0] !== store.state.chess.turn()) {
    Notify.create({
      message: "Not your turn! You can't castle.",
      color: "primary"
    });
    return false;
  }

  const moveSan = side === "kingside" ? "O-O" : "O-O-O";
  // console.log("animation.js::castling::moveSan=", moveSan);
  const move = store.state.chess.move(moveSan);
  // console.log("animation.js::castling::move=", move);

  let kingId, rookId, kingX, rookX, posY;
  if (move) {
    if (side === "kingside") {
      // castle kingside
      kingId = 28;
      rookId = 31;
      kingX = 6;
      rookX = 5;
      posY = 7;
    } else {
      // castle queenside
      kingId = 28;
      rookId = 24;
      kingX = 2;
      rookX = 3;
      posY = 7;
    }

    const king = document.getElementById(kingId);
    let pageCoords = chessToPageCoords(mirrorCoords({ x: kingX, y: posY }));
    king.velocity(
      { left: pageCoords.x + "px", top: pageCoords.y + "px" },
      { duration: 400, easing: "easeInOutSine" }
    );

    const rook = document.getElementById(rookId);
    pageCoords = chessToPageCoords(mirrorCoords({ x: rookX, y: posY }));
    rook.velocity(
      { left: pageCoords.x + "px", top: pageCoords.y + "px" },
      { duration: 400, easing: "easeInOutSine" }
    );

    // update store...
    store.setTile(kingId, { x: kingX, y: posY }); // move king to rook's pos
    store.setTile(rookId, { x: rookX, y: posY }); // move rook to king's pos

    // DEBUG
    // store.logTiles();

    setTimeout(() => {
      if (store.state.chess.in_check()) {
        // console.log("animation.js::castle::in_check");
        Notify.create({
          message: "Check!",
          color: "primary"
        });
      }
      // Check if game is over...
      if (!isGameOver()) {
        // give the user a chance to see the opponents move!
        setTimeout(() => {
          opponentMove();
        }, 1000);
      }
    }, 10);
  } else {
    Notify.create({
      message: "Illegal move! Castle not allowed.",
      color: "primary"
    });
  }
}

//-----------------------------------------------------------------------------//

export function castlingQueenside() {
  // console.log("animation.js::castleQueenside");
  castling("queenside");
}

//-----------------------------------------------------------------------------//

export function castlingKingside() {
  // console.log("animation.js::castleKingside");
  castling("kingside");
}

//-----------------------------------------------------------------------------//

export function undoMove() {
  // console.log("animation.js::undoMove");
  if (store.state.chess.game_over()) {
    Notify.create({
      message: "Game over, can't undo move!",
      color: "primary"
    });
    return;
  }

  if (store.state.chess.turn() !== store.state.playersColor) {
    Notify.create({
      message: "Cannot undo if it's not your turn!",
      color: "primary"
    });
    return;
  }

  // hide opponents last move
  store.hideDashedBox(0);
  store.hideDashedBox(1);

  // undo opponent's move
  undoHalfeMove();
  // undo player's move
  undoHalfeMove();
}

//-----------------------------------------------------------------------------//

function undoHalfeMove() {
  // console.log("animation.js::undoHalfMove");
  const move = store.state.chess.undo();
  // console.log("animation.js::undoHalfMove::move=", move);
  if (!move) {
    Notify.create({
      message: "Nothing to undo!",
      color: "primary"
    });
    return;
  }

  const coordsFrom = sanToCoords(move.from);
  const coordsTo = sanToCoords(move.to);
  let tileId, tile;

  // undo promotion if appropriate
  if (move.promotion) {
    tileId = store.popFromPromotedTiles();
    store.setTileType(tileId, move.color === "w" ? "P" : "p");
    tile = document.getElementById(tileId);
    const tileType = move.color === "w" ? "P" : "p";
    tile.setAttribute("src", "statics/chess/" + tileType + ".svg");
  } else {
    tileId = getTileIdFromCoords(coordsTo.x, coordsTo.y);
  }

  tile = document.getElementById(tileId);
  let pageCoords = chessToPageCoords(mirrorCoords(coordsFrom));
  tile.velocity(
    { left: pageCoords.x + "px", top: pageCoords.y + "px" },
    { duration: 400, easing: "easeInOutSine" }
  );
  store.setTile(tileId, coordsFrom);

  // restore captured tile if appropriate
  if (move.captured) {
    let tileRemovedId, tileRemoved;
    if (move.color === "b") {
      tileRemovedId = store.popWhiteTilesRemoved();
    } else {
      tileRemovedId = store.popBlackTilesRemoved();
    }
    tileRemoved = document.getElementById(tileRemovedId);

    // prepare undo e.p. capture...
    if (move.flags.indexOf("e") > -1) {
      if ((move.color = "w")) {
        coordsTo.y = coordsTo.y + 1;
      } else {
        coordsTo.y = coordsTo.y - 1;
      }
    }

    pageCoords = chessToPageCoords(mirrorCoords(coordsTo));
    tileRemoved.velocity(
      { left: pageCoords.x + "px", top: pageCoords.y + "px" },
      { duration: 400, easing: "easeInOutSine" }
    );
    store.setTile(tileRemovedId, coordsTo);
  }

  if (move.flags.indexOf("k") > -1 || move.flags.indexOf("q") > -1) {
    const side = move.flags.indexOf("k") > -1 ? "k" : "q";
    undoCastling(move.color, side);
  }

  // DEBUG
  // store.logTiles();
}

//-----------------------------------------------------------------------------//

function undoCastling(color, side) {
  // console.log(`animation.js::undoCastling::color=${color}, side=${side}`);
  let kingId, rookId, kingCoords, rookCoords;
  if (color === "w") {
    kingId = 28;
    kingCoords = { x: 4, y: 7 };
    if (side === "k") {
      // kingside castling
      rookId = 31;
      rookCoords = { x: 7, y: 7 };
    } else {
      // queenside castling
      rookId = 24;
      rookCoords = { x: 0, y: 7 };
    }
  } else {
    // color === "b"
    kingId = 4;
    kingCoords = { x: 4, y: 0 };
    if (side === "k") {
      // kingside castling
      rookId = 7;
      rookCoords = { x: 7, y: 0 };
    } else {
      // queenside castling
      rookId = 0;
      rookCoords = { x: 0, y: 0 };
    }
  }

  const king = document.getElementById(kingId);
  let pageCoords = chessToPageCoords(mirrorCoords(kingCoords));
  king.velocity(
    { left: pageCoords.x + "px", top: pageCoords.y + "px" },
    { duration: 400, easing: "easeInOutSine" }
  );

  const rook = document.getElementById(rookId);
  pageCoords = chessToPageCoords(mirrorCoords(rookCoords));
  rook.velocity(
    { left: pageCoords.x + "px", top: pageCoords.y + "px" },
    { duration: 400, easing: "easeInOutSine" }
  );

  // update store...
  store.setTile(kingId, kingCoords); // move king to rook's pos
  store.setTile(rookId, rookCoords); // move rook to king's pos
}

//-----------------------------------------------------------------------------//

export function switchBoard() {
  // console.log("animation.js::switchBoard");

  let src;
  const board = document.getElementById("board");
  if (store.state.playersColor === "w") {
    src = "statics/chess/chessboard-with-captions-7.svg";
  } else {
    src = "statics/chess/chessboard-with-captions-7-black-pos.svg";
  }
  board.setAttribute("src", src);
}

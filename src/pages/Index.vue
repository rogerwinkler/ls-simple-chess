<template>
  <q-page id="main-page" class="flex flex-center">
    <ChessBoard :boardWidth="imgWidth" />
    <q-resize-observer @resize="onResize" />
  </q-page>
</template>

<script>
import ChessBoard from "components/ChessBoard";
import { store } from "../helpers/store";
import { calcCoords, getTileIdFromCoords, throttled } from "../helpers/misc";
import {
  touchDown,
  touchMove,
  touchUp,
  touchLeave
} from "../helpers/animation";
import Chess from "chess.js";
import Velocity from "velocity-animate";

export default {
  components: {
    ChessBoard
  },

  data() {
    return {
      name: "PageIndex",
      imgWidth: store.state.boardWidth
    };
  },

  created() {
    // console.log("Index.vue::created");
    store.setChess(new Chess());
  },

  mounted() {
    const board = document.querySelector(".board");
    // console.log("Index.vue::mounted::board=", board);
    board.addEventListener("mousedown", this.handleMouseDown);
    board.addEventListener("touchstart", this.handleTouchStart);
    const throttledMouseMoveHandler = throttled(20, this.handleMouseMove);
    board.addEventListener("mousemove", throttledMouseMoveHandler);
    const throttledTouchMoveHandler = throttled(20, this.handleTouchMove);
    board.addEventListener("touchmove", throttledTouchMoveHandler);
    board.addEventListener("mouseup", this.handleMouseUp);
    board.addEventListener("touchend", this.handleTouchEnd);
    // board.addEventListener("mouseenter", this.handleMouseEnter);
    board.addEventListener("mouseleave", this.handleMouseLeave);
    board.addEventListener("touchcancel", this.handleTouchCancel);
  },

  methods: {
    calcBoardWidth() {
      // console.log("Index.vue::calcBoardWidth");
      const page = document.getElementById("main-page");

      // Leave room for two rows of removed tiles on top and
      // at the bottom and leave a small boarder (9/10)
      const boardWidth =
        (Math.min(page.clientWidth, (page.clientHeight / 12) * 8) / 10) * 9;
      // console.log("Index.vue::calcBoardWidth::boardWidth=", boardWidth);
      return boardWidth;
    },

    //-----------------------------------------------------------------------------//

    onResize() {
      // console.log("Index.vue::onResize");
      store.setBoardWidth(this.calcBoardWidth());
      this.imgWidth = store.state.boardWidth;
      // console.log("Index.vue::onResize::this.imgWidth=", this.imgWidth);
      this.$root.$emit("screenResized");
    },

    //-----------------------------------------------------------------------------//

    handleMouseDown(e) {
      // console.log("Index.vue::handleMouseDown::e=", e);
      const board = document.querySelector(".board");
      const box = board.getBoundingClientRect();
      // console.log(
      //   `Index.vue::handleMouseDown::box.x=${box.left}, box.y=${box.top}`
      // );
      store.setBoardOffsets(box.left, box.top);

      touchDown(e.x, e.y);
    },

    //-----------------------------------------------------------------------------//

    handleTouchStart(e) {
      // console.log("Index.vue::handleTouchStart::e=", e);
      const board = document.querySelector(".board");
      const box = board.getBoundingClientRect();
      // console.log(
      //   `Index.vue::handleMouseDown::box.x=${box.left}, box.y=${box.top}`
      // );
      store.setBoardOffsets(box.left, box.top);

      touchDown(e.targetTouches[0].clientX, e.targetTouches[0].clientY);
    },

    //-----------------------------------------------------------------------------//

    handleMouseMove(e) {
      // console.log("Index.vue::handleMouseMove");
      touchMove(e.x, e.y);
    },

    //-----------------------------------------------------------------------------//

    handleTouchMove(e) {
      // console.log("Index.vue::handleTouchMove");
      touchMove(e.targetTouches[0].clientX, e.targetTouches[0].clientY);
    },

    //-----------------------------------------------------------------------------//

    handleMouseUp(e) {
      // console.log("Index.vue::handleMouseUp::e=", e);
      touchUp(e.x, e.y);
    },

    //-----------------------------------------------------------------------------//

    handleTouchEnd(e) {
      // console.log("Index.vue::handleTouchEnd::e=", e);
      touchUp(e.changedTouches[0].clientX, e.changedTouches[0].clientY);
    },

    //-----------------------------------------------------------------------------//

    // handleMouseEnter(e) {
    //   console.log("Index.vue::handleMouseEnter");
    // },

    //-----------------------------------------------------------------------------//

    handleMouseLeave(e) {
      // console.log("Index.vue::handleMouseLeave");
      touchLeave(e.x, e.y);
    },

    //-----------------------------------------------------------------------------//

    handleTouchCancel(e) {
      // console.log("Index.vue::handleTouchCancel::e=", e);
      touchLeave(e.changedTouches[0].clientX, e.changedTouches[0].clientY);
    }
  }
};
</script>

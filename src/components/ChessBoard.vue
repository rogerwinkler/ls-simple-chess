<template>
  <div class="board">
    <img
      id="board"
      draggable="false"
      src="statics/chess/chessboard-with-captions-7.svg"
      alt="Chessboard"
      :width="boardWidth"
    />

    <DashedBox
      v-for="dBox in dashedBoxes"
      v-bind:key="dBox.id"
      v-bind:id="dBox.id"
      v-bind:dBoxX="dBox.x"
      v-bind:dBoxY="dBox.y"
      v-bind:visibility="dBox.visible"
      :width="tileWidth"
    />

    <Tile
      v-for="tile in tiles"
      v-bind:key="tile.id"
      v-bind:id="tile.id"
      v-bind:type="tile.type"
      v-bind:tileX="tile.x"
      v-bind:tileY="tile.y"
      :width="tileWidth"
    />
  </div>
</template>

<script>
import { store } from "../helpers/store";
import Tile from "components/Tile";
import DashedBox from "components/DashedBox";
import { dragTilesToPos } from "../helpers/animation";

export default {
  components: {
    Tile,
    DashedBox
  },

  data() {
    return {
      tiles: store.state.tiles,
      tileWidth: store.state.innerBoardWidth / 8,
      dashedBoxes: store.state.dashedBoxes
    };
  },

  created() {
    // console.log("ChessBoard.vue::created");
    this.$root.$on("screenResized", this.handleResize);
  },

  props: {
    boardWidth: {
      type: Number,
      default: 200
    }
  },

  methods: {
    handleResize() {
      // console.log("ChessBoard.vue::handleResize");
      this.tileWidth = store.state.innerBoardWidth / 8;
      dragTilesToPos();
    }
  }
};
</script>

<style lang="scss" scoped>
.board {
  position: relative;
}
</style>

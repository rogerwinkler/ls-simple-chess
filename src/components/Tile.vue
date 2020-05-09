<template>
  <img
    draggable="false"
    class="tile"
    :id="id"
    :type="type"
    :src="imgSrc"
    :alt="imgAlt"
    :style="cssVars"
  />
</template>

<script>
import { store } from "../helpers/store";

export default {
  props: {
    id: {
      type: Number
    },
    type: {
      type: String
    },
    tileX: {
      type: Number
      // default: 0
    },
    tileY: {
      type: Number
      // default: 0
    },
    width: {
      type: Number,
      default: store.state.innerBoardWidth / 8
    },
    visibility: {
      type: String,
      default: "visible"
    },
    draggable: {
      type: Boolean,
      default: true
    }
  },

  //------------------------------------------//

  computed: {
    cssVars() {
      // console.log("Tile.vue::computed:cssVars");
      // console.log("Tile.vue::computed:cssVars::this.width=", this.width);
      return {
        "--width": `${this.width}px`
      };
    },
    imgSrc() {
      const src = "statics/chess/" + this.type + ".svg";
      // console.log("Tile.vue::coomputed:src=", src);
      return src;
    },
    imgAlt() {
      return this.type;
    }
  }
};
</script>

<style scoped>
.tile {
  position: absolute;
  left: 0;
  top: 0;
  width: var(--width);
}
</style>

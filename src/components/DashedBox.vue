<template>
  <img
    draggable="false"
    class="dashed-box"
    :id="id"
    src="statics/chess/box.svg"
    alt="Dashed Box"
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
    dBoxX: {
      type: Number
      // default: 0
    },
    dBoxY: {
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
    }
  },

  //------------------------------------------//

  computed: {
    cssVars() {
      // console.log("DashedBox.vue::computed:cssVars");
      // console.log("DashedBox.vue::computed:cssVars::this.left=", this.left);
      // console.log("DashedBox.vue::computed:cssVars::this.top=", this.top);
      // console.log("DashedBox.vue::computed:cssVars::this.width=", this.width);
      return {
        "--left": `${this.left}px`,
        "--top": `${this.top}px`,
        "--width": `${this.width}px`,
        "--visibility": this.visibility
      };
    },
    left() {
      const left = this.width * this.dBoxX + store.state.innerBoardOffsetX;
      // console.log("DashBox.vue::computed::left=", left);
      return left;
    },
    top() {
      const top = this.width * this.dBoxY + store.state.innerBoardOffsetY + 2;
      // console.log("DashBox.vue::computed::top=", top);
      return top;
    }
  },

  //------------------------------------------//

  methods: {}
};
</script>

<style scoped>
.dashed-box {
  position: absolute;
  left: var(--left);
  top: var(--top);
  width: var(--width);
  visibility: var(--visibility);
}
</style>

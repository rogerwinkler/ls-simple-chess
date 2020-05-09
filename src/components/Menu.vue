<template>
  <div class="q-pa-md">
    <q-list>
      <q-item-label header class="text-grey-8" overline>
        SETTINGS
      </q-item-label>

      <q-item>
        <q-item-label>Level of difficulty:</q-item-label>
        <q-slider
          v-model="value"
          markers
          snap
          :min="1"
          :max="5"
          :step="1"
          label
          label-always
          color="primary"
          @change="changeDifficulty"
        />
      </q-item>

      <!-- <q-item>
        <q-item-label>Your<br />color:</q-item-label>
        <div class="q-gutter-sm">
          <q-radio v-model="color" val="b" label="black" @input="changeColor" />
          <q-radio v-model="color" val="w" label="white" @input="changeColor" />
        </div>
      </q-item> -->

      <q-item>
        <q-item-label>Show opponents last move:</q-item-label>
        <div class="q-gutter-sm">
          <q-toggle v-model="toggle" color="primary" @input="toggleShowMove" />
        </div>
      </q-item>

      <q-separator />

      <q-item-label header class="text-grey-8" overline>
        ACTIONS
      </q-item-label>

      <q-item>
        <div class="q-pa-xs q-gutter-md">
          <q-btn
            label="Start / Restart"
            outline
            color="primary"
            class="full-width"
            @click="handleRestart"
          />
          <q-btn
            label="Undo Move"
            outline
            color="primary"
            class="full-width"
            @click="handleUndoMove"
          />
          <q-btn
            label="Castling Queenside"
            outline
            color="primary"
            class="full-width"
            @click="handleCastlingQueenside"
          />
          <q-btn
            label="Castling Kingside"
            outline
            color="primary"
            class="full-width"
            @click="handleCastlingKingside"
          />
        </div>
      </q-item>

      <q-separator />

      <q-item-label header class="text-grey-8" overline>
        ATTRIBUTION
      </q-item-label>
      <q-item>
        <div>
          Inspired by
          <a
            href="https://www.freecodecamp.org/news/simple-chess-ai-step-by-step-1d55a9266977/"
            target="_blank"
            >A step-by-step guide to building a simple chess AI</a
          >
          by Lauri Hartikka.
        </div>
      </q-item>

      <q-item>
        <div>
          Chess engine
          <a href="https://github.com/jhlywa/chess.js" target="_blank"
            >Copyright (c) 2020, Jeff Hlywa (jhlywa@gmail.com)</a
          >.
        </div>
      </q-item>

      <q-item>
        <div>
          Image of chessboard made by
          <a
            href="https://commons.wikimedia.org/wiki/File:Chess_Board.svg"
            title="via Wikimedia Commons"
            target="_blank"
            >Nevit Dilmen</a
          >
          / Public domain.
        </div>
      </q-item>
      <q-item>
        <div>
          Images of chess pieces made by
          <a
            href="https://commons.wikimedia.org/wiki/File:Chess_klt45.svg"
            title="via Wikimedia Commons"
            target="_blank"
            >Cburnett</a
          >
          /
          <a
            href="http://creativecommons.org/licenses/by-sa/3.0/"
            target="_blank"
            >CC BY-SA</a
          >.
        </div>
      </q-item>

      <q-separator />

      <q-item-label header class="text-grey-8" overline>
        ABOUT
      </q-item-label>
      <q-item>
        MX Simple Chess<br />
        Version 1.0.0<br />
      </q-item>
      <q-item>
        &copy; Copyright 2020 Monex AG, Liechtenstein
      </q-item>
      <q-item>
        <a
          href="https://www.monex.li/en/global/dsk/dsk-mobile-apps/"
          target="_blank"
          >Privacy Policy for Mobile Apps</a
        >
      </q-item>
    </q-list>
  </div>
</template>

<script>
import { store } from "../helpers/store";
import {
  dragTilesToPos,
  castlingQueenside,
  castlingKingside,
  undoMove,
  switchBoard,
  opponentMove
} from "../helpers/animation";
export default {
  data() {
    return {
      value: store.state.levelOfDifficulty,
      color: store.state.playersColor,
      toggle: store.state.showOpponentsLastMove
    };
  },

  methods: {
    closeDrawer() {
      // console.log("Menu.vue::closeDrawer");
      // give the user some time to see his changes before closing the drawer...
      setTimeout(() => {
        this.$root.$emit("closeDrawer");
      }, 200);
    },

    //--------------------------------------------------------//

    changeDifficulty(value) {
      // console.log("Menu.vue::changeDifficulty::value=", value);
      store.setLevelOfDifficulty(value);
      this.handleRestart();
    },

    //--------------------------------------------------------//

    changeColor(value) {
      // console.log("Menu.vue::changeColor::value=", value);
      store.setPlayersColor(value);
      switchBoard();
      this.handleRestart();
      // store.logTiles();
    },

    //--------------------------------------------------------//

    toggleShowMove(value) {
      // console.log("Menu.vue::toggleShowMove::value=", value);
      store.setShowOpponentsLastMove(value);
      this.closeDrawer();
    },

    //--------------------------------------------------------//

    handleRestart() {
      // console.log("Menu.vue::handleRestart");
      store.init();
      dragTilesToPos();
      store.hideDashedBox(0);
      store.hideDashedBox(1);
      store.state.chess.reset();
      store.resetTilesRemoved();
      store.resetPromotedTiles();
      // if player's color is black, opponent starts to move...
      if (store.state.playersColor === "b") {
        opponentMove();
      }
      this.closeDrawer();
    },

    //--------------------------------------------------------//

    handleUndoMove() {
      // console.log("Menu.vue::handleUndoMove");
      undoMove();
      this.closeDrawer();
    },

    //--------------------------------------------------------//

    handleCastlingQueenside() {
      // console.log("Menu.vue::handleCastleQueenside");
      this.$root.$emit("closeDrawer");
      castlingQueenside();
    },

    //--------------------------------------------------------//

    handleCastlingKingside() {
      // console.log("Menu.vue::handleCastleKingside");
      this.$root.$emit("closeDrawer");
      castlingKingside();
    }
  }
};
</script>

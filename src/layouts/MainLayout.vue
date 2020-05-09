<template>
  <!-- <q-layout view="lHh Lpr lFf"> -->
  <q-layout view="hhh lpR fff">
    <q-header elevated>
      <q-toolbar class="glossy">
        <img
          src="~assets/app-logo-128x128.png"
          alt="App Logo"
          width="32px"
          height="32px"
        />
        <q-toolbar-title>
          MX Simple Chess
        </q-toolbar-title>
        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          @click="rightDrawerOpen = !rightDrawerOpen"
        />
      </q-toolbar>
    </q-header>

    <q-drawer
      id="drawer"
      v-model="rightDrawerOpen"
      show-if-above
      side="right"
      overlay
      bordered
      content-class="bg-grey-1"
    >
      <Menu />
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script>
import Menu from "components/Menu";

export default {
  name: "MainLayout",

  components: {
    Menu
  },

  data() {
    return {
      rightDrawerOpen: false
    };
  },

  created() {
    this.$root.$on("closeDrawer", this.closeDrawer);
    this.$root.$on("openDrawer", this.openDrawer);
  },

  methods: {
    closeDrawer() {
      this.rightDrawerOpen = false;
    },

    openDrawer() {
      this.rightDrawerOpen = true;
    }
  }
};
</script>

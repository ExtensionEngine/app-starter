<template>
  <v-app id="app" class="system-font-stack">
    <v-main>
      <router-view class="view" />
    </v-main>
  </v-app>
</template>

<script>
export default {
  name: 'app'
};
</script>

<style lang="scss">
@import "./stylesheets/main";

* {
  box-sizing: border-box;
}

html, body {
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
  background-color: #f5f5f5;
  overflow: hidden;
}

#app {
  height: 100%;
  overflow-x: auto !important;
  overflow-y: overlay !important;
  overflow-y: auto !important;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
</style>

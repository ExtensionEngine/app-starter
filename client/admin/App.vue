<template>
  <v-app id="app">
    <sidebar :drawer.sync="drawer" />
    <navbar :drawer.sync="drawer" />
    <v-main>
      <router-view />
    </v-main>
  </v-app>
</template>

<script>
import Navbar from '@/admin/components/common/Navbar';
import Sidebar from '@/admin/components/common/Sidebar';

export default {
  name: 'admin-app',
  data: () => ({ drawer: true }),
  components: { Navbar, Sidebar }
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
  overflow-x: auto !important;
  overflow-y: overlay !important;
  overflow-y: auto !important;
}

#app {
  height: 100%;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.v-main {
  background-color: #f5f5f5;
}
</style>

<template>
  <v-app-bar color="blue" app>
    <router-link
      :to="{ name: 'home' }"
      class="app-brand text-decoration-none">
      App starter
    </router-link>
    <v-spacer />
    <v-menu
      min-width="220px"
      transition="slide-y-transition"
      offset-y
      z-index="1000">
      <template #activator="{ on }">
        <a v-on="on" class="navbar-link">
          <v-icon color="white" class="mr-1">mdi-account-circle</v-icon>
          {{ user.email }}
          <v-icon color="white">mdi-chevron-down</v-icon>
        </a>
      </template>
      <v-list class="menu-list text-left">
        <v-list-item @click="logout">
          <v-list-item-title>Logout</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-menu>
  </v-app-bar>
</template>

<script>
import { mapActions, mapState } from 'vuex';

export default {
  name: 'main-navbar',
  computed: {
    ...mapState('auth', ['user'])
  },
  methods: mapActions('auth', ['logout'])
};
</script>

<style lang="scss" scoped>
.app-brand {
  padding-bottom: 0.125rem;
  color: #fafafa;
  font-size: 1.25rem;
  font-weight: 400;
  text-transform: uppercase;
  cursor: pointer;
}

.navbar-link {
  color: #fafafa;
}
</style>

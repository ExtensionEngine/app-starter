<template>
  <v-toolbar color="amber" app fixed clipped-left>
    <v-toolbar-side-icon @click.native="$emit('update:drawer', !drawer)" />
    <span class="title ml-3 mr-5">
      <v-icon class="mr-2">mdi-shopping</v-icon>
      APP
      <span class="font-weight-light">STARTER</span>
    </span>
    <v-spacer />
    <v-menu min-width="220px" transition="slide-y-transition" offset-y>
      <v-btn slot="activator" icon large class="mr-2">
        <v-avatar size="42px" color="#eaeaea">
          <span class="grey--text headline">{{ user.firstName[0] }}</span>
        </v-avatar>
      </v-btn>
      <v-list>
        <v-list-tile @click="logout">
          <v-list-tile-title>Logout</v-list-tile-title>
        </v-list-tile>
      </v-list>
    </v-menu>
  </v-toolbar>
</template>

<script>
import { mapActions, mapState } from 'vuex';

export default {
  name: 'main-toolbar',
  props: {
    drawer: { type: Boolean, default: true }
  },
  computed: mapState('auth', ['user']),
  methods: mapActions('auth', ['logout'])
};
</script>

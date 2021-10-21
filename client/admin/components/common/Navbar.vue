<template>
  <v-app-bar
    color="amber"
    fixed app clipped-left
    class="px-2">
    <v-app-bar-nav-icon @click.native="$emit('update:drawer', !drawer)" />
    <span class="title ml-3 mr-5">
      <v-icon class="mr-2">mdi-shopping</v-icon>
      APP
      <span class="font-weight-light">STARTER</span>
    </span>
    <v-spacer />
    <v-menu min-width="220" transition="slide-y-transition" offset-y>
      <template #activator="{ on, attrs }">
        <v-btn
          v-on="on"
          v-bind="attrs"
          color="primary"
          dark icon large
          class="mr-2"
          :data-testid="user.label">
          <v-avatar size="42" color="#eaeaea">
            <span class="grey--text headline">{{ user.label[0] }}</span>
          </v-avatar>
        </v-btn>
      </template>
      <v-list>
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
  name: 'main-toolbar',
  props: {
    drawer: { type: Boolean, default: true }
  },
  computed: mapState('auth', ['user']),
  methods: mapActions('auth', ['logout'])
};
</script>

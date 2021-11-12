<template>
  <v-navigation-drawer
    @input="$emit('update:drawer', $event)"
    :value="drawer"
    fixed app clipped
    class="pt-5 grey lighten-4">
    <v-list nav dense class="grey lighten-4">
      <v-list-item :to="{ name: 'users' }" exact>
        <v-list-item-action>
          <v-icon class="mr-2">mdi-contacts</v-icon>
        </v-list-item-action>
        <v-list-item-title>Users</v-list-item-title>
      </v-list-item>
    </v-list>
  </v-navigation-drawer>
</template>

<script>
export default {
  props: {
    drawer: { type: Boolean, default: true }
  }
};
</script>

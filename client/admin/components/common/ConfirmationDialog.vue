<template>
  <v-dialog v-model="show" max-width="500">
    <v-form @submit.prevent="executeAction">
      <v-card>
        <v-card-title class="headline">{{ heading }}</v-card-title>
        <v-card-text>{{ message }}</v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn @click="close" text>Cancel</v-btn>
          <v-btn type="submit" color="red" text>Yes</v-btn>
        </v-card-actions>
      </v-card>
    </v-form>
  </v-dialog>
</template>

<script>
export default {
  name: 'confirmation-dialog',
  props: {
    visible: { type: Boolean, default: false },
    heading: { type: String, default: '' },
    message: { type: String, default: 'Are you sure?' },
    action: { type: Function, default: () => true }
  },
  computed: {
    show: {
      get: vm => vm.visible,
      set(value) {
        if (!value) this.close();
      }
    }
  },
  methods: {
    close() {
      this.$emit('update:visible', false);
    },
    executeAction() {
      return Promise.resolve(this.action()).then(() => {
        this.close();
        this.$emit('confirmed');
      });
    }
  }
};
</script>

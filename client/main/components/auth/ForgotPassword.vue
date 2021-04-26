<template>
  <div>
    <v-alert v-if="message" text class="mb-5">
      {{ message }}
    </v-alert>
    <validation-observer
      v-else
      ref="form"
      @submit.prevent="$refs.form.handleSubmit(submit)"
      tag="form"
      novalidate>
      <validation-provider
        v-slot="{ errors }"
        name="email"
        rules="required|email">
        <v-text-field
          v-model="email"
          :error-messages="errors"
          type="email"
          label="Email"
          placeholder="Email"
          prepend-inner-icon="mdi-email-outline"
          outlined
          class="required" />
      </validation-provider>
      <div>
        <v-btn type="submit" block depressed rounded dark>
          Send reset email
        </v-btn>
        <v-btn @click="$router.go(-1)" tag="a" text class="mt-7">
          <v-icon class="pr-2">mdi-arrow-left</v-icon>Back
        </v-btn>
      </div>
    </validation-observer>
  </div>
</template>

<script>
import { delay } from 'bluebird';
import { mapActions } from 'vuex';

const getDefaultData = () => ({
  email: '',
  message: ''
});

export default {
  data: () => getDefaultData(),
  methods: {
    ...mapActions('auth', ['forgotPassword']),
    submit() {
      this.forgotPassword({ email: this.email })
        .then(() => {
          this.message = 'Reset email sent';
          return delay(2000);
        })
        .then(() => this.$router.push('/'))
        .catch(() => (this.message = 'Oops! Something went wrong.'));
    }
  }
};
</script>

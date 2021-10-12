<template>
  <div>
    <v-alert :value="!!error" text class="mb-5">
      {{ error }}
    </v-alert>
    <validation-observer
      ref="form"
      @submit.prevent="$refs.form.handleSubmit(submit)"
      tag="form"
      novalidate>
      <validation-provider
        v-slot="{ errors }"
        :rules="{ required: true, alphanumerical: true, min: 6 }"
        vid="password"
        name="password">
        <v-text-field
          v-model="password"
          :error-messages="errors"
          type="password"
          name="password"
          label="Password"
          placeholder="Password"
          prepend-inner-icon="mdi-lock"
          outlined
          class="required mb-1" />
      </validation-provider>
      <validation-provider
        v-slot="{ errors }"
        :rules="{ required: true, confirmed: { target: 'password' } }"
        vid="passwordConfirmation"
        name="password">
        <v-text-field
          v-model="passwordConfirmation"
          :error-messages="errors"
          type="password"
          name="passwordConfirmation"
          label="Re-enter password"
          placeholder="Password confirmation"
          prepend-inner-icon="mdi-lock-outline"
          outlined
          class="required" />
      </validation-provider>
      <v-btn
        type="submit"
        text outlined
        class="my-1">
        Change password
      </v-btn>
    </validation-observer>
  </div>
</template>

<script>
import { mapActions } from 'vuex';

export default {
  data: () => ({
    password: '',
    passwordConfirmation: '',
    error: null
  }),
  computed: {
    token: vm => vm.$route.params.token
  },
  methods: {
    ...mapActions('auth', ['resetPassword']),
    submit() {
      const { token, password } = this;
      return this.resetPassword({ password, token })
        .then(() => this.$router.push('/'))
        .catch(() => (this.error = 'An error has occurred!'));
    }
  }
};
</script>

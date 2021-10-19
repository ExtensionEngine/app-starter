<template>
  <div>
    <v-alert
      :value="!!errorMessage"
      transition="fade-transition"
      dismissible text dense
      class="mb-7 text-left">
      {{ errorMessage }}
    </v-alert>
    <validation-observer
      ref="form"
      @submit.prevent="$refs.form.handleSubmit(submit)"
      tag="form"
      novalidate>
      <validation-provider
        v-slot="{ errors }"
        :rules="{ required: true, email: true }"
        name="email">
        <v-text-field
          v-model="email"
          :error-messages="errors"
          type="email"
          name="email"
          label="Email"
          placeholder="Email"
          autocomplete="username"
          prepend-inner-icon="mdi-email-outline"
          outlined
          class="required mb-1" />
      </validation-provider>
      <validation-provider
        v-slot="{ errors }"
        :rules="{ required: true }"
        name="password">
        <v-text-field
          v-model="password"
          :error-messages="errors"
          type="password"
          name="password"
          label="Password"
          placeholder="Password"
          prepend-inner-icon="mdi-lock-outline"
          autocomplete="current-password"
          outlined
          class="required" />
      </validation-provider>
      <div class="mt-1 text-right">
        <router-link
          :to="{ name: 'forgot-password' }"
          class="text-decoration-none text--primary">
          Forgot password?
        </router-link>
        <v-btn type="submit" outlined text class="ml-3">
          Log in
        </v-btn>
      </div>
    </validation-observer>
  </div>
</template>

<script>
import { mapActions } from 'vuex';
import { Role } from '@/../common/config';

const LOGIN_ERR_MESSAGE = 'The email or password you entered is incorrect.';

export default {
  name: 'user-login',
  data: () => ({
    email: '',
    password: '',
    errorMessage: ''
  }),
  methods: {
    ...mapActions('auth', ['login']),
    submit() {
      this.message = '';
      return this.login({ email: this.email, password: this.password })
        .then(user => {
          if (user.role !== Role.ADMIN) return this.$router.push('/');
          document.location.replace(`${document.location.origin}/admin`);
        })
        .catch(() => (this.errorMessage = LOGIN_ERR_MESSAGE));
    }
  }
};
</script>

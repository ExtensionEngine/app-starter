<template>
  <div>
    <div class="message">
      <span v-if="message">{{ message }}</span>
    </div>
    <form @submit.prevent="submit">
      <v-input
        v-model="email"
        autocomplete="email"
        name="email"
        validate="required|email" />
      <v-input
        v-model="password"
        autocomplete="current-password"
        name="password"
        type="password"
        validate="required" />
      <div class="options">
        <router-link :to="{ name: 'forgot-password' }">
          Forgot password ?
        </router-link>
        <button class="button" type="submit">Login</button>
      </div>
    </form>
  </div>
</template>

<script>
import { mapActions } from 'vuex';
import pick from 'lodash/pick';
import { Role } from '@/../common/config';
import VInput from '@/common/components/form/VInput';
import { withValidation } from '@/common/validation';

const LOGIN_ERR_MESSAGE = 'User email and password do not match';

export default {
  name: 'login',
  mixins: [withValidation()],
  data: () => ({
    email: '',
    password: '',
    message: ''
  }),
  methods: {
    ...mapActions('auth', ['login']),
    submit() {
      this.message = '';
      this.$validator.validateAll().then(isValid => {
        if (!isValid) return;
        this.login(pick(this, ['email', 'password']))
          .then(user => {
            if (user.role !== Role.Admin) return this.$router.push('/');
            document.location.replace(`${document.location.origin}/admin`);
          })
          .catch(() => (this.message = LOGIN_ERR_MESSAGE));
      });
    }
  },
  components: { VInput }
};
</script>

<style lang="scss" scoped>
.options {
  padding: 5px 0 10px 0;
  text-align: right;

  a {
    display: inline-block;
    padding: 6px 20px;
    color: #444;
  }
}
</style>

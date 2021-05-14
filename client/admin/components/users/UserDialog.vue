<template>
  <v-dialog v-model="show" v-hotkey="{ esc: close }" width="700">
    <validation-observer
      ref="form"
      @submit.prevent="$refs.form.handleSubmit(save)"
      tag="form">
      <v-card class="pa-3">
        <v-card-title class="headline pr-0">
          <span>{{ userData ? 'Edit' : 'Create' }} User</span>
          <v-spacer />
          <v-btn
            v-if="!isNewUser"
            @click="invite"
            :disabled="isLoading"
            :loading="isLoading"
            outlined
            color="blue-grey">
            Reinvite
          </v-btn>
        </v-card-title>
        <v-card-text>
          <validation-provider
            v-slot="{ errors }"
            name="email"
            :rules="{ required: true, email: true, unique_email: { userData } }">
            <v-text-field
              v-model="user.email"
              :error-messages="errors"
              label="E-mail"
              class="mb-3" />
          </validation-provider>
          <validation-provider
            v-slot="{ errors }"
            name="role"
            rules="required">
            <v-select
              v-model="user.role"
              :items="roles"
              :error-messages="errors"
              label="Role"
              class="mb-3" />
          </validation-provider>
          <validation-provider
            v-slot="{ errors }"
            name="firstName"
            rules="required|alpha|min:2|max:50">
            <v-text-field
              v-model="user.firstName"
              :error-messages="errors"
              label="First Name"
              class="mb-3" />
          </validation-provider>
          <validation-provider
            v-slot="{ errors }"
            name="lastName"
            rules="required|alpha|min:2|max:50">
            <v-text-field
              v-model="user.lastName"
              :error-messages="errors"
              label="Last Name"
              class="mb-3" />
          </validation-provider>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn @click="close">Cancel</v-btn>
          <v-btn color="success" type="submit">Save</v-btn>
        </v-card-actions>
      </v-card>
    </validation-observer>
  </v-dialog>
</template>

<script>
import api from '@/admin/api/user';
import cloneDeep from 'lodash/cloneDeep';
import humanize from 'humanize-string';
import isEmpty from 'lodash/isEmpty';
import map from 'lodash/map';
import { Role } from '@/../common/config';

const resetUser = () => ({
  firstName: '',
  lastName: '',
  email: '',
  role: null
});

export default {
  name: 'user-dialog',
  props: {
    visible: { type: Boolean, default: false },
    userData: { type: Object, default: () => ({}) }
  },
  data: () => ({
    user: resetUser(),
    isLoading: false
  }),
  computed: {
    show: {
      get: vm => vm.visible,
      set(value) {
        if (!value) this.close();
      }
    },
    roles: () => map(Role, it => ({ text: humanize(it), value: it })),
    isNewUser: vm => !vm.user.id
  },
  methods: {
    close() {
      this.user = resetUser();
      this.$emit('update:visible', false);
    },
    async save() {
      const action = this.isNewUser ? 'create' : 'update';
      await api[action](this.user);
      this.$emit(`${action}d`);
      this.close();
    },
    invite() {
      this.isLoading = true;
      api.invite(this.user).finally(() => (this.isLoading = false));
    }
  },
  watch: {
    show(val) {
      if (!val || isEmpty(this.userData)) return;
      this.user = cloneDeep(this.userData);
    }
  }
};
</script>

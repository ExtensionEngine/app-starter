<template>
  <!-- eslint-disable vue/valid-v-slot -->
  <v-layout justify-center>
    <v-flex class="mt-5">
      <v-toolbar color="#f5f5f5" flat>
        <v-spacer />
        <import-dialog @imported="fetch(defaultPage)" />
        <v-btn @click.stop="showUserDialog()" color="success" outlined>
          Add user
        </v-btn>
      </v-toolbar>
      <div class="elevation-1 ml-2 mr-4">
        <v-layout class="px-4 py-3 table-toolbar">
          <v-flex lg3 offset-lg9>
            <v-text-field
              v-model="filter"
              append-icon="mdi-magnify"
              label="Search"
              single-line
              clearable />
          </v-flex>
        </v-layout>
        <v-data-table
          v-model="selectedUsers"
          :headers="headers"
          :items="users"
          :server-items-length="totalItems"
          :options.sync="dataTable"
          :multi-sort="false"
          show-select
          class="user-table">
          <template #item.createdAt="{ item }">
            <td class="no-wrap">{{ item.createdAt | formatDate }}</td>
          </template>
          <template #item.actions="{ item }">
            <v-icon @click="showUserDialog(item)" small>
              mdi-pencil
            </v-icon>
            <v-icon @click="removeUser(item)" small class="ml-2">
              mdi-delete
            </v-icon>
          </template>
        </v-data-table>
      </div>
      <user-dialog
        @created="fetch(defaultPage)"
        @updated="fetch(defaultPage)"
        :visible.sync="userDialog"
        :user-data="editedUser" />
      <confirmation-dialog
        @confirmed="fetch()"
        :visible.sync="confirmation.dialog"
        :action="confirmation.action"
        :message="confirmation.message"
        heading="Remove user" />
    </v-flex>
  </v-layout>
</template>

<script>
import api from '@/admin/api/user';
import ConfirmationDialog from '../common/ConfirmationDialog';
import ImportDialog from './ImportDialog';
import throttle from 'lodash/throttle';
import UserDialog from './UserDialog';

const defaultPage = () => ({ page: 1, sortBy: ['createdAt'], sortDesc: [true] });

const headers = () => [
  { text: 'Email', value: 'email' },
  { text: 'Role', value: 'role' },
  { text: 'First Name', value: 'firstName' },
  { text: 'Last Name', value: 'lastName' },
  { text: 'Date Created', value: 'createdAt' },
  { text: 'Actions', value: 'actions', align: 'center', sortable: false }
];

export default {
  name: 'user-list',
  data: () => ({
    users: [],
    selectedUsers: [],
    filter: null,
    dataTable: defaultPage(),
    totalItems: 0,
    userDialog: false,
    editedUser: null,
    confirmation: { dialog: null }
  }),
  computed: {
    headers,
    defaultPage
  },
  methods: {
    showUserDialog(user = null) {
      this.editedUser = user;
      this.userDialog = true;
    },
    fetch: throttle(async function (opts) {
      Object.assign(this.dataTable, opts);
      const params = { ...this.dataTable, filter: this.filter };
      const { items, total } = await api.fetch(params);
      this.users = items;
      this.totalItems = total;
    }, 400),
    removeUser(user) {
      Object.assign(this.confirmation, {
        message: `Are you sure you want to remove user "${user.label}"?`,
        action: () => api.remove(user),
        dialog: true
      });
    }
  },
  watch: {
    dataTable: {
      handler: 'fetch',
      immediate: true
    },
    filter: 'fetch'
  },
  components: { ConfirmationDialog, ImportDialog, UserDialog }
};
</script>

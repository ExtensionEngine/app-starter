<template>
  <v-dialog
    v-model="showDialog"
    v-hotkey="{ esc: close }"
    persistent
    no-click-animation
    width="700">
    <template #activator="{ on, attrs }">
      <v-btn
        v-on="on"
        v-bind="attrs"
        color="blue-grey"
        outlined
        class="mr-4">
        <v-icon>mdi-cloud-upload</v-icon>Import
      </v-btn>
    </template>
    <form @submit.prevent="save">
      <v-card class="pa-3">
        <v-card-title class="headline">Import Users</v-card-title>
        <v-card-text>
          <validation-provider
            ref="fileProvider"
            v-slot="{ errors }"
            name="fileInput"
            :rules="{ required: true, mimes }">
            <label for="userImportInput">
              <v-text-field
                ref="fileName"
                v-model="filename"
                :error-messages="errors"
                :disabled="importing"
                prepend-icon="mdi-attachment"
                label="Upload .xlsx or .csv file"
                readonly
                single-line />
              <input
                ref="fileInput"
                @change="onFileSelected"
                id="userImportInput"
                name="file"
                type="file"
                class="file-input">
            </label>
          </validation-provider>
          <v-alert
            v-if="error"
            transition="fade-transition"
            dismissible text dense
            class="mb-7 text-left">
            {{ error }}
          </v-alert>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-fade-transition>
            <v-btn
              v-show="serverErrorsReport"
              @click="downloadErrorsFile"
              color="error">
              <v-icon>mdi-cloud-download</v-icon>Errors
            </v-btn>
          </v-fade-transition>
          <v-btn @click="close">Cancel</v-btn>
          <v-btn :disabled="importDisabled" color="success" type="submit">
            <span v-if="!importing">Import</span>
            <v-icon v-else>mdi-loading mdi-spin</v-icon>
          </v-btn>
        </v-card-actions>
      </v-card>
    </form>
  </v-dialog>
</template>

<script>
import api from '@/admin/api/user';
import saveAs from 'save-as';

const inputFormats = {
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
  'text/csv': 'csv'
};

export default {
  name: 'import-dialog',
  data: () => ({
    showDialog: false,
    importing: false,
    filename: null,
    form: null,
    error: null,
    serverErrorsReport: null
  }),
  computed: {
    importDisabled() {
      return !this.filename || this.importing;
    },
    mimes: () => Object.keys(inputFormats)
  },
  methods: {
    async onFileSelected(e) {
      const { valid } = await this.$refs.fileProvider.validate(e);
      if (!valid) return;
      this.form = new FormData();
      this.resetErrors();
      const [file] = e.target.files;
      this.filename = file.name;
      this.form.append('file', file, file.name);
    },
    close() {
      if (this.importing) return;
      if (this.$refs.fileInput) this.$refs.fileInput.value = null;
      this.filename = null;
      this.resetErrors();
      this.showDialog = false;
    },
    save() {
      this.importing = true;
      return api.bulkImport(this.form).then(response => {
        this.importing = false;
        if (response.data.size) {
          this.$nextTick(() => this.$refs.fileName.focus());
          this.error = 'All users aren\'t imported';
          this.serverErrorsReport = response.data;
          return;
        }
        this.$emit('imported');
        this.close();
      }).catch(err => {
        this.importing = false;
        this.error = 'Importing users failed.';
        this.$nextTick(() => this.$refs.fileName.focus());
        return Promise.reject(err);
      });
    },
    downloadErrorsFile() {
      const extension = inputFormats[this.serverErrorsReport.type];
      saveAs(this.serverErrorsReport, `Errors.${extension}`);
      this.$refs.fileName.focus();
    },
    resetErrors() {
      this.serverErrorsReport = null;
      this.error = null;
      this.$refs.form && this.$res.form.reset();
    }
  }
};
</script>

<style lang="scss" scoped>
.file-input {
  display: none;
}

.v-btn .v-icon {
  padding-right: 6px;
}

.v-text-field {
  ::v-deep .v-text-field__slot {
    cursor: pointer;

    input {
      pointer-events: none;
    }
  }

  ::v-deep .mdi {
    transform: rotate(-90deg);
  }
}

.loader-container {
  display: flex;
  justify-content: center;
}
</style>

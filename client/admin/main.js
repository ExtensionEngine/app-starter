import '@/common/validation';

import { formatDate, truncate } from '@/common/filters';
import { ValidationObserver, ValidationProvider } from 'vee-validate';
import App from './App';
import router from './router';
import store from './store';
import Vue from 'vue';
import VueHotkey from 'v-hotkey';
import vuetify from '@/common/plugins/vuetify';
import VueVisible from 'vue-visible';

Vue.filter('formatDate', formatDate);
Vue.filter('truncate', truncate);

Vue.component('validation-observer', ValidationObserver);
Vue.component('validation-provider', ValidationProvider);

Vue.use(VueHotkey);
Vue.use(VueVisible);

// eslint-disable-next-line no-new
new Vue({
  store,
  router,
  vuetify,
  el: '#app',
  render: h => h(App)
});

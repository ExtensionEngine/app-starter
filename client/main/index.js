import '@/common/validation';

import {
  setInteractionMode,
  ValidationObserver,
  ValidationProvider
} from 'vee-validate';
import App from './App';
import getStore from './store';
import router from './router';
import { truncate } from '@/common/filters';
import Vue from 'vue';
import vuetify from '@/common/plugins/vuetify';
import VueVisible from 'vue-visible';

Vue.component('validation-observer', ValidationObserver);
Vue.component('validation-provider', ValidationProvider);
setInteractionMode('passive');

Vue.filter('truncate', truncate);

Vue.use(VueVisible);

// eslint-disable-next-line no-new
getStore().then(store => new Vue({
  store,
  router,
  vuetify,
  el: '#app',
  render: h => h(App)
}));

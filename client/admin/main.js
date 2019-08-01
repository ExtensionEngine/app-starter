import { formatDate, truncate } from '@/common/filters';
import App from './App';
import router from './router';
import store from './store';
import VeeValidate from '@/common/validation';
import Vue from 'vue';
import VueHotkey from 'v-hotkey';
import Vuetify from 'vuetify';
import VueVisible from 'vue-visible';

Vue.filter('formatDate', formatDate);
Vue.filter('truncate', truncate);
Vue.use(VeeValidate, {
  delay: 700,
  fieldsBagName: 'vFields',
  errorBagName: 'vErrors',
  inject: false
});
Vue.use(VueHotkey);
Vue.use(VueVisible);
Vue.use(Vuetify, { iconfont: 'mdi' });

// eslint-disable-next-line no-new
new Vue({
  store,
  router,
  el: '#app',
  render: h => h(App)
});

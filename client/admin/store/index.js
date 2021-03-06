import auth from '@/common/store/modules/auth';
import { auth as authPlugin } from '@/common/store/plugins';
import request from '@/common/api/request';
import Vue from 'vue';
import Vuex from 'vuex';

const isProduction = process.env.NODE_ENV === 'production';

Vue.use(Vuex);

const store = new Vuex.Store({
  modules: {
    auth
  },
  plugins: [authPlugin({ key: 'APP_USER' })],
  strict: !isProduction
});

request.auth.storageKey = 'TOKEN';
request.auth.on('error', () => store.dispatch('auth/logout'));

export default store;

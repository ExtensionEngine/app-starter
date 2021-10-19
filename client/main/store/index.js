import auth from '@/common/store/modules/auth';
import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

const isProduction = process.env.NODE_ENV === 'production';

const store = new Vuex.Store({
  modules: {
    auth
  },
  strict: !isProduction
});

export default function getStore() {
  return store.dispatch('auth/fetchUserInfo').then(() => store);
}

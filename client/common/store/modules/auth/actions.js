import auth from '@/common/api/auth';
import { navigateTo } from '@/common/navigation';

export const login = async ({ commit }, credentials) => {
  const user = await auth.login(credentials);
  return commit('setAuth', user) || user;
};
export const logout = async () => {
  await auth.logout();
  return navigateTo('/');
};

export const forgotPassword = (_, { email }) => {
  return auth.forgotPassword(email);
};

export const resetPassword = (_, payload) => {
  return auth.resetPassword(payload);
};

export const fetchUserInfo = ({ commit }) => {
  return auth.getUserInfo()
    .then(user => commit('setAuth', user))
    .catch(() => commit('logout'));
};

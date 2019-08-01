import auth from '@/common/api/auth';

export const login = ({ commit }, credentials) => {
  return auth.login(credentials)
    .then(user => commit('login', user) || user);
};

export const logout = () => {
  return auth.logout();
};

export const forgotPassword = (_context, { email }) => {
  return auth.forgotPassword(email);
};

export const resetPassword = (_context, payload) => {
  return auth.resetPassword(payload);
};

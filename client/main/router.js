import Auth from '@/main/components/auth';
import ForgotPassword from '@/main/components/auth/ForgotPassword';
import get from 'lodash/get';
import Home from '@/main/components';
import Login from '@/main/components/auth/Login';
import { navigate } from '@/common/navigation';
import NotFound from '@/common/components/NotFound';
import ResetPassword from '@/main/components/auth/ResetPassword';
import { Role } from '@/../common/config';
import Router from 'vue-router';
import store from './store';
import Vue from 'vue';

Vue.use(Router);

// Handle 404
const fallbackRoute = { path: '*', component: NotFound };

const router = new Router({
  routes: [
    {
      path: '/auth',
      name: 'auth',
      component: Auth,
      children: [
        {
          path: 'login',
          name: 'login',
          component: Login
        },
        {
          path: 'forgot-password',
          name: 'forgot-password',
          component: ForgotPassword
        },
        {
          path: 'reset-password/:token',
          name: 'reset-password',
          component: ResetPassword
        }
      ]
    },
    {
      path: '/',
      name: 'home',
      component: Home,
      meta: { auth: true }
    },
    fallbackRoute
  ]
});

router.beforeEach((to, _from, next) => {
  const user = get(store.state, 'auth.user');
  const isNotAuthenticated = to.matched.some(it => it.meta.auth) && !user;
  if (isNotAuthenticated) return next({ name: 'login' });
  if (user && user.role === Role.Admin) return navigate('/admin/');
  return next();
});

export default router;

import Auth from '@/main/components/auth';
import ForgotPassword from '@/main/components/auth/ForgotPassword';
import Home from '@/main/components';
import Login from '@/main/components/auth/Login';
import { navigate } from '@/common/navigation';
import NotFound from '@/common/components/NotFound';
import ResetPassword from '@/main/components/auth/ResetPassword';
import { Role } from '@/../common/config';
import Router from 'vue-router';
import Vue from 'vue';

Vue.use(Router);

// Handle 404
const fallbackRoute = { path: '*', component: NotFound };

const router = new Router({
  routes: [{
    path: '/auth',
    name: 'auth',
    component: Auth,
    children: [{
      path: 'login',
      name: 'login',
      component: Login
    }, {
      path: 'forgot-password',
      name: 'forgot-password',
      component: ForgotPassword
    }, {
      path: 'reset-password/:token',
      name: 'reset-password',
      component: ResetPassword
    }]
  }, {
    path: '/',
    name: 'home',
    component: Home,
    meta: { auth: true }
  },
  fallbackRoute]
});

const isAdmin = user => user && user.role === Role.ADMIN;
const requiresAuth = route => route.matched.some(it => it.meta.auth);

router.beforeEach((to, _from, next) => {
  const { user } = router.app.$store.state.auth;
  const isNotAuthenticated = !user && requiresAuth(to);
  if (isNotAuthenticated) return next({ name: 'login' });
  return !isAdmin(user) ? next() : navigate('/admin');
});

export default router;

import get from 'lodash/get';
import { navigate } from '@/common/navigation';
import NotFound from '@/common/components//NotFound';
import { Role } from '@/../common/config';
import Router from 'vue-router';
import store from './store';
import Users from '@/admin/components/users';
import Vue from 'vue';

Vue.use(Router);

// Handle 404
const fallbackRoute = { path: '*', component: NotFound };

const router = new Router({
  routes: [{
    path: '/',
    name: 'users',
    component: Users,
    meta: { auth: true }
  }, fallbackRoute]
});

router.beforeEach((to, _from, next) => {
  const user = get(store.state, 'auth.user');
  const isNotAuthenticated = to.matched.some(it => it.meta.auth) && !user;
  const isNotAuthorized = user && user.role !== Role.ADMIN;
  if (isNotAuthenticated || isNotAuthorized) return navigate();
  next();
});

export default router;

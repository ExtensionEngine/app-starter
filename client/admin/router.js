import { navigateTo } from '@/common/navigation';
import NotFound from '@/common/components//NotFound';
import { Role } from '@/../common/config';
import Router from 'vue-router';
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

const isAdmin = user => user?.role === Role.ADMIN;
const isAuthRequired = (to, user) => !user && to.matched.some(it => it.meta.auth);

router.beforeEach((to, _from, next) => {
  const { user } = router.app.$store.state.auth;
  if (!isAdmin(user) || isAuthRequired(to, user)) return navigateTo();
  return next();
});

export default router;

import {
  createRouter,
  createWebHistory,
  RouteLocationNormalized,
  RouteRecordRaw
} from 'vue-router';
import Home from '@/views/Home.vue';
import AuthHandler from '@/components/AuthHandler.vue';

function redirectHome(to: RouteLocationNormalized) {
  if (to.query.error) {
    return { name: 'Home' };
  }
  return true;
}

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/auth/redirect',
    name: 'AuthHandler',
    component: AuthHandler,
    beforeEnter: [redirectHome]
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;

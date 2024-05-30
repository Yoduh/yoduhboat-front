import { createRouter, createWebHistory } from 'vue-router';
import type { RouteLocationNormalized, RouteRecordRaw } from 'vue-router';
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
    component: Home,
    children: [
      {
        path: '',
        name: 'Queue',
        component: () => import('@/views/Queue.vue')
      },
      {
        path: '/search',
        name: 'Search',
        component: () => import('@/views/Search.vue')
      },
      {
        path: '/playlists',
        name: 'Playlists',
        component: () => import('@/views/Playlists.vue')
      }
    ]
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

import { createRouter, createWebHashHistory } from 'vue-router'

// Dynamic imports break the potential circular dependency with useGame.js
// and enable automatic code splitting
export const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/',        name: 'menu',    component: () => import('../ui/screens/MenuScreen.vue') },
    { path: '/game',    name: 'game',    component: () => import('../ui/screens/GameScreen.vue') },
    { path: '/victory', name: 'victory', component: () => import('../ui/screens/VictoryScreen.vue') },
  ],
})

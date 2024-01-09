import { createRouter, createWebHashHistory } from 'vue-router'

import IndexView from './views/IndexView.vue'
import SignInView from './views/SignInView.vue'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      name: 'index',
      component: IndexView
    },
    {
      path: '/signin',
      name: 'signin',
      component: SignInView
    }
  ]
})

export default router

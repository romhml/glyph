import { createRouter, createWebHashHistory } from 'vue-router'

import IndexView from '@/views/IndexView.vue'
import SignInView from '@/views/SignInView.vue'
import SettingsView from '@/views/SettingsView.vue'

import { useAuth } from '@/composables/useAuth'

async function authGuard(to: any, from: any, next: any) {
  const { currentUser, loadCurrentUser } = useAuth()
  await loadCurrentUser()

  if (!currentUser.value) {
    next('/signin')
  } else {
    next()
  }
}

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      name: 'index',
      component: IndexView,
      beforeEnter: authGuard
    },
    {
      path: '/settings',
      name: 'settings',
      component: SettingsView,
      beforeEnter: authGuard
    },

    {
      path: '/signin',
      name: 'signin',
      component: SignInView
    }
  ]
})

export default router

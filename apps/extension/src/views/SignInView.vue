<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import BaseButton from '@/components/ui/button/BaseButton.vue'

const { signIn, currentUser } = useAuth()
const router = useRouter()

onMounted(() => {
  if (currentUser.value) {
    router.push('/')
  }
})

async function onSignIn(provider: string) {
  await signIn(provider)
  router.push('/')
}
</script>

<template>
  <div class="flex flex-col justify-center w-60 py-2 px-2">
    <p class="text-center mb-2 font-bold text-lg">Pont</p>
    <BaseButton variant="outline" @click="onSignIn('google')"> Sign in with Google </BaseButton>
  </div>
</template>

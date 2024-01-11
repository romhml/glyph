<script setup lang="ts">
import { useAuth } from '@/composables/useAuth'
import BaseButton from '@/components/ui/button/BaseButton.vue'
import PageLayout from '@/components/layouts/PageLayout.vue'
import BaseAvatar from '@/components/ui/avatar/BaseAvatar.vue'

import { useRouter } from 'vue-router'

const { signOut, currentUser } = useAuth()

const router = useRouter()
const onSignOut = async () => {
  await signOut()
  router.push('/signin')
}
</script>

<template>
  <PageLayout class="text-center">
    <div class="flex flex-col items-center mb-2">
      <BaseAvatar :src="currentUser?.picture" class="mb-2" />
      <p class="text-slate-500 font-bold">
        {{ currentUser?.email }}
      </p>
    </div>
    <BaseButton
      class="mx-auto text-slate-600 text-xs"
      size="sm"
      variant="link"
      @click="onSignOut()"
    >
      Sign Out
    </BaseButton>
  </PageLayout>
</template>

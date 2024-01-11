<script setup lang="ts">
import { ref } from 'vue'
import { ArrowPathIcon, Cog6ToothIcon, CheckCircleIcon } from '@heroicons/vue/24/outline'
import { useCodes } from '@/composables/useCodes'
import BaseButton from '@/components/ui/button/BaseButton.vue'

const { fetchCodes } = useCodes()

const codesUpdated = ref(false)
const fetching = ref(false)

async function refreshCodes() {
  fetching.value = true
  await fetchCodes()

  codesUpdated.value = true
  fetching.value = false

  setTimeout(() => {
    codesUpdated.value = false
  }, 2000)
}
</script>

<template>
  <div class="w-60 flex flex-col items-center rounded">
    <nav class="flex items-center justify-between py-2 mb-3 w-full px-4 border-b border-gray-100">
      <h1 class="text-lg font-bold">Glyth</h1>
      <div class="flex items-center space-x-1 justify-end">
        <BaseButton variant="ghost" size="icon" :disabled="fetching" @click="refreshCodes()">
          <Transition mode="out-in">
            <CheckCircleIcon v-if="codesUpdated" class="w-5 text-slate-400 transition" />
            <ArrowPathIcon
              v-else
              class="w-5 text-slate-500 transition"
              :class="fetching ? 'animate-spin' : ''"
            />
          </Transition>
        </BaseButton>
        <BaseButton variant="ghost" size="icon" @click="$router.push('settings')">
          <Cog6ToothIcon class="w-5 text-slate-500" />
        </BaseButton>
      </div>
    </nav>

    <Suspense>
      <div class="px-2 pb-2 w-full">
        <slot />
      </div>
    </Suspense>
  </div>
</template>

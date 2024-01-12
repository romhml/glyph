<script setup lang="ts">
import { ChevronLeftIcon } from '@heroicons/vue/24/outline'
import BaseButton from '@/components/ui/button/BaseButton.vue'
</script>

<template>
  <div class="w-60 flex flex-col items-center rounded pb-4">
    <nav class="flex items-center justify-between mt-2 w-full px-2">
      <BaseButton variant="ghost" size="icon" @click="$router.back()">
        <ChevronLeftIcon class="w-5 text-slate-500 transition" />
      </BaseButton>
    </nav>

    <Suspense>
      <div class="px-2 w-full">
        <slot />
      </div>
    </Suspense>
  </div>
</template>

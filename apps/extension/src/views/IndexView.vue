<script setup lang="ts">
import { ClipboardDocumentIcon, ClipboardDocumentCheckIcon } from '@heroicons/vue/24/outline'

import { useClipboard } from '@vueuse/core'
import { ref, computed, onMounted } from 'vue'
import { usePont } from '@/composables/usePont'

const { fetching, codes, registerEventHandlers, fetchCodes, autofill } = usePont()

onMounted(async () => {
  // TODO: Remove next line when event handlers are moved to service worker
  registerEventHandlers()
  await fetchCodes()
})

const latestCode = computed(() => codes?.value[0])
const { copy } = useClipboard()

const copied = ref(false)
function copyCodeToClipboard(code: string) {
  copy(code)
  copied.value = true
  setTimeout(() => {
    copied.value = false
  }, 2000)
}
</script>

<template>
  <div>
    <div v-if="latestCode" class="flex">
      <button
        class="py-2 flex items-center shadow px-2 rounded border border-zinc-200 cursor-pointer hover:bg-zinc-50 transition w-full"
        @click="autofill(latestCode.code)"
      >
        <div class="flex flex-col w-full">
          <p class="uppercase font-semibold text-lg text-zinc-700">{{ latestCode.code }}</p>
          <p class="text-xs font-medium text-zinc-500">
            {{ latestCode.sender?.replace(/<.*>/g, '').trim() }}
          </p>
        </div>

        <button
          @click.prevent="copyCodeToClipboard(latestCode.code)"
          class="p-1 cursor-pointer transition hover:bg-zinc-200 rounded-full"
        >
          <Transition mode="out-in">
            <ClipboardDocumentCheckIcon v-if="copied" key="copied" class="w-5 h-5 text-zinc-500" />
            <ClipboardDocumentIcon v-else key="not-copied" class="w-5 h-5 text-zinc-500" />
          </Transition>
        </button>
      </button>
    </div>
    <div v-else-if="fetching" class="flex items-center justify-center h-16">
      <p class="text-center text-zinc-500 animate-pulse">Fetching codes...</p>
    </div>
    <div v-else>
      <p class="text-center text-zinc-500">No codes found</p>
    </div>
  </div>
</template>

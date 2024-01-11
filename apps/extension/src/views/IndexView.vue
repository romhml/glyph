<script setup lang="ts">
import DefaultLayout from '@/components/layouts/DefaultLayout.vue'
import { ClipboardDocumentIcon, ClipboardDocumentCheckIcon } from '@heroicons/vue/24/outline'
import { useClipboard } from '@vueuse/core'
import { ref, computed, onMounted } from 'vue'
import { useCodes } from '@/composables/useCodes'
import BaseButton from '@/components/ui/button/BaseButton.vue'

const { codes, fetchCodes, autofill } = useCodes()

onMounted(async () => {
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
  <DefaultLayout>
    <div v-if="latestCode" class="flex">
      <button
        class="py-2 flex shadow items-center px-3 rounded border border-slate-200 cursor-pointer hover:bg-slate-50 transition w-full"
        @click="autofill(latestCode.code)"
      >
        <div class="w-full text-left">
          <p class="uppercase font-semibold text-lg text-slate-700">{{ latestCode.code }}</p>
          <p class="text-xs font-medium text-slate-500">
            {{ latestCode.sender?.replace(/<.*>/g, '').trim() }}
          </p>
        </div>

        <BaseButton
          variant="ghost"
          size="icon"
          @click.prevent="copyCodeToClipboard(latestCode.code)"
        >
          <Transition mode="out-in">
            <ClipboardDocumentCheckIcon v-if="copied" key="copied" class="w-5 h-5 text-slate-500" />
            <ClipboardDocumentIcon v-else key="not-copied" class="w-5 h-5 text-slate-500" />
          </Transition>
        </BaseButton>
      </button>
    </div>
    <div v-else>
      <p class="text-center text-slate-500">No codes found</p>
    </div>
  </DefaultLayout>
</template>

import { useAuth } from '@/composables/useAuth'
import { useCodes } from '@/composables/useCodes'
const { loadCurrentUser, currentUser } = useAuth()
const { codes, loadCodes, fetchCodes, autofill } = useCodes()

const browserApi = chrome || browser

;(async () => {
  await loadCurrentUser()
  await loadCodes()

  browserApi.commands.onCommand.addListener(async (command) => {
    console.log(`Glyth: Dispatched command: ${command}`)
    // await browserApi.runtime.sendMessage({ command })

    if (!currentUser.value) {
      console.log('Glyth: No user found')
      return
    }

    if (command === 'autofill') {
      await fetchCodes()
      const code = codes.value[0]
      await autofill(code.code)
    }
  })
})()

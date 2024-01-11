import { ref } from 'vue'
import { useAuth } from './useAuth'

export type AuthCode = {
  code: string
  sender?: string
  intternal_date?: number
}

const codes = ref<AuthCode[]>([])

async function fetchCodes(): Promise<AuthCode[]> {
  const { currentUser } = useAuth()

  const response = await fetch(import.meta.env.VITE_API_URL + '/codes', {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${currentUser.value?.accessToken}`
    }
  })

  const data = await response.json()

  codes.value = data

  return data
}

async function getCurrentChromeTab() {
  const queryOptions = { active: true, lastFocusedWindow: true }
  const [tab] = await chrome.tabs.query(queryOptions)

  return tab
}

async function autofillChrome(code?: string) {
  const tab = await getCurrentChromeTab()

  chrome.scripting.executeScript({
    target: { tabId: tab.id || chrome.tabs.TAB_ID_NONE },
    // @ts-ignore-next-line
    func: (code: string) => {
      const input = document.querySelector('input[type="text"]') as HTMLInputElement
      const segmentedInputs = document.querySelectorAll(
        'input[type="text"][maxlength="1"]'
      ) as NodeListOf<HTMLInputElement>

      if (!input && segmentedInputs.length === 0) {
        console.log('Pont: No input found')
        return
      }

      if (segmentedInputs.length > 0) {
        console.log('Pont: Detected segmented inputs', segmentedInputs)
        segmentedInputs.forEach((el, i) => {
          el.value = code[i]
        })
      } else if (input) {
        console.log('Pont: Detected input', input)
        input.value = code
      }
    },
    args: [code]
  })
}

async function autofill(code: string) {
  if (chrome) {
    await autofillChrome(code)
  }
}

export function useCodes() {
  return {
    codes,
    fetchCodes,
    autofill
  }
}

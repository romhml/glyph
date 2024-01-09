import { ref } from 'vue'

export type AuthCode = {
  code: string
  sender?: string
  intternal_date?: number
}

const codes = ref<AuthCode[]>([])
const fetching = ref(false)

async function fetchCodes(): Promise<AuthCode[]> {
  fetching.value = true

  const response = await fetch(import.meta.env.VITE_API_URL + '/codes')
  const data = await response.json()

  codes.value = data
  fetching.value = false

  return data
}

// TODO: This must be moved to the service worker in order to be executed in the background
function chromeEventHandler(request: any, _sender: any, sendResponse: any) {
  if (request.command === 'autofill') {
    // Get the codes from the API
    fetchCodes().then(async (resp) => {
      // Send the response to the service worker
      await autofillChrome(resp[0].code)
      sendResponse()
    })
  }
  return true
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

function registerChromeEventHandlers() {
  chrome.runtime.onMessage.addListener(chromeEventHandler)
}

function removeChromeEventHandlers() {
  chrome.runtime.onMessage.removeListener(chromeEventHandler)
}

// TODO: Implement Firefox event handlers
function registerEventHandlers() {
  if (chrome) {
    registerChromeEventHandlers()
  }
}

function removeEventHandlers() {
  if (chrome) {
    removeChromeEventHandlers()
  }
}

async function autofill(code: string) {
  console.log('autofill', code)
  if (chrome) {
    await autofillChrome(code)
  }
}

export function usePont() {
  return {
    registerEventHandlers,
    removeEventHandlers,
    codes,
    fetchCodes,
    fetching,
    autofill
  }
}

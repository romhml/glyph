import { readonly, ref, computed } from 'vue'

type AuthProvider = {
  name: string
  authUrl: string
  scope: string
  clientId: string
}

const providers: AuthProvider[] = [
  {
    name: 'google',
    clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID,
    authUrl: import.meta.env.VITE_GOOGLE_AUTH_URL,
    scope: import.meta.env.VITE_GOOGLE_SCOPE
  }
]

type CurrentUser = {
  accessToken: string
  email: string
  id: string
  name: string
  picture: string
}

const currentUser = ref<CurrentUser | null>(null)
const authenticated = computed(() => !!currentUser.value)

const identityApi = chrome?.identity // || browser.identity
const storageApi = chrome?.storage // || browser.storage

async function getToken(provider: string, code: string, redirectUrl: string) {
  const resp = await fetch(`${import.meta.env.VITE_API_URL}/auth/${provider}/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ code, redirect_uri: redirectUrl })
  })

  return await resp.json()
}

async function getUserInfo(accessToken: string) {
  const resp = await fetch('https://www.googleapis.com/oauth2/v1/userinfo', {
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  })
  return await resp.json()
}

async function loadCurrentUser() {
  return new Promise((resolve) => {
    storageApi.sync.get((result: any) => {
      currentUser.value = result.currentUser
      resolve(undefined)
    })
  })
}

export function useAuth() {
  return {
    loadCurrentUser,
    currentUser: readonly(currentUser),
    authenticated,

    signOut() {
      currentUser.value = null
      storageApi.sync.clear()
      storageApi.local.clear()
    },

    async signIn(provider: string) {
      return new Promise((resolve) => {
        const authProvider = providers.find((p) => p.name === provider)
        if (!authProvider) {
          throw new Error(`No provider with name ${provider}`)
        }

        const redirectUrl = identityApi.getRedirectURL()

        const webFlowUrl = new URL(authProvider.authUrl)
        webFlowUrl.searchParams.append('client_id', authProvider.clientId)
        webFlowUrl.searchParams.append('redirect_uri', redirectUrl)
        webFlowUrl.searchParams.append('response_type', 'code')
        webFlowUrl.searchParams.append('scope', authProvider.scope)

        identityApi.launchWebAuthFlow(
          {
            url: webFlowUrl.toString(),
            interactive: true
          },
          (resp) => {
            if (!resp) {
              throw new Error('Auth: No redirect url')
            }

            const url = new URL(resp)
            const code = url.searchParams.get('code')

            if (!code) {
              throw new Error('Auth: No code in redirect url')
            }

            getToken(provider, code, redirectUrl).then(async (data) => {
              const userinfo = await getUserInfo(data.access_token)
              currentUser.value = {
                ...userinfo,
                accessToken: data.access_token
              }

              await storageApi.sync.set({ currentUser: currentUser.value })
              resolve(undefined)
            })
          }
        )
      })
    }
  }
}

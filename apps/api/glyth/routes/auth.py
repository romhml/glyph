import requests
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from glyth.settings import settings

router = APIRouter(prefix="/auth", tags=["auth"])


class AuthProvider(BaseModel):
    name: str
    client_id: str
    client_secret: str
    redirect_uri: str

    def get_token(self, code: str, redirect_uri: str):
        req = requests.post(
            "https://oauth2.googleapis.com/token",
            data={
                "code": code,
                "client_id": self.client_id,
                "client_secret": self.client_secret,
                "redirect_uri": redirect_uri,
                "grant_type": "authorization_code",
            },
        )

        return req.json()


AUTH_PROVIDERS = {
    "google": AuthProvider(
        name="google",
        client_id=settings.GOOGLE_CLIENT_ID,
        client_secret=settings.GOOGLE_CLIENT_SECRET,
        redirect_uri=settings.GOOGLE_REDIRECT_URI,
    )
}


class GetAuthToken(BaseModel):
    code: str
    redirect_uri: str


@router.post("/{provider}/token")
async def auth_token(provider: str, form: GetAuthToken):
    auth_provider = AUTH_PROVIDERS.get(provider, None)
    if not auth_provider:
        raise HTTPException(
            status_code=400, detail=f"Provider {provider} not supported"
        )
    auth_data = auth_provider.get_token(form.code, form.redirect_uri)
    return auth_data

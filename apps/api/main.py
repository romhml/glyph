import os.path
import re
import time
from typing import Annotated, List, Optional

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
from pydantic import BaseModel
from pydantic.types import conint

# If modifying these scopes, delete the file token.json.
SCOPES = ["https://www.googleapis.com/auth/gmail.readonly"]

# TODO: Implement proper authentication
creds = None
# The file token.json stores the user's access and refresh tokens, and is
# created automatically when the authorization flow completes for the first
# time.
if os.path.exists("token.json"):
    creds = Credentials.from_authorized_user_file("token.json", SCOPES)

# If there are no (valid) credentials available, let the user log in.
if not creds or not creds.valid:
    if creds and creds.expired and creds.refresh_token:
        creds.refresh(Request())
    else:
        flow = InstalledAppFlow.from_client_secrets_file("credentials.json", SCOPES)
        creds = flow.run_local_server(port=0)
    # Save the credentials for the next run
    with open("token.json", "w") as token:
        token.write(creds.to_json())

# Temporary Authentication Method

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def probe():
    pass


class AuthCode(BaseModel):
    code: str
    sender: str | None
    internal_date: str | None


# TODO: Improve regexp or use NLP
def build_auth_code_pattern(length: Optional[int] = None):
    if length:
        return f"[0-9A-Z]{{{length}}}"

    return r"[0-9A-Z]{4,9}"


def parse_email(pattern, msg):
    matches = re.findall(pattern, msg["snippet"])
    if matches:
        sender = None
        for header in msg["payload"]["headers"]:
            if header["name"] == "From":
                sender = str(header["value"])
        return AuthCode(
            code=matches[0],
            sender=sender,
            internal_date=msg["internalDate"],
        )
    else:
        return None


CodeLength = Annotated[int, conint(gt=3, lt=8)]


@app.get("/codes")
async def codes(length: Optional[CodeLength] = None) -> List[AuthCode]:
    codes = []
    pattern = build_auth_code_pattern(length)

    # Call the Gmail API
    service = build("gmail", "v1", credentials=creds)

    qtime = int(time.time() - 60 * 500)  # 10 minutes ago
    results = (
        service.users()
        .messages()
        .list(userId="me", q=f"is:unread after:{qtime}")
        .execute()
    )

    def callback(request_id, msg, exception):
        if exception:
            print(f"Error: {exception}")
            return

        result = parse_email(pattern, msg)
        if result:
            codes.append(result)

    batch = service.new_batch_http_request()

    for message in results.get("messages", []):
        req = service.users().messages().get(userId="me", id=message["id"])
        batch.add(req, callback=callback)

    batch.execute()
    return codes

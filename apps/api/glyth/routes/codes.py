import re
import time
from typing import Annotated, List, Optional

from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from pydantic import BaseModel, conint

router = APIRouter(prefix="/codes", tags=["codes"])

get_token = HTTPBearer()


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


@router.get("")
async def codes(
    length: Optional[CodeLength] = None,
    auth: HTTPAuthorizationCredentials = Depends(get_token),
) -> List[AuthCode]:
    codes = []
    pattern = build_auth_code_pattern(length)

    try:
        credentials = Credentials(auth.credentials)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    service = build("gmail", "v1", credentials=credentials)

    qtime = int(time.time() - 60 * 500)  # 10 minutes ago

    try:
        results = (
            service.users()
            .messages()
            .list(userId="me", q=f"is:unread after:{qtime}")
            .execute()
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

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

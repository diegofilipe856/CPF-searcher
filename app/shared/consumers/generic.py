import httpx
from typing import Any
from fastapi import HTTPException

__async_client = httpx.AsyncClient()

def __pre_request(token: str | None, **kwargs) -> tuple[dict[str, str], dict[str, Any]]:
    headers = kwargs.pop("headers", {}) or {}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    return headers, kwargs

def __post_request(response: httpx.Response, kwargs: dict[str, Any]) -> dict | str:
    try:
        response.raise_for_status()
    except httpx.HTTPStatusError as exc:
        detail = "Erro na integração externa"
        try:
            body = response.json()
            if isinstance(body, dict):
                detail = body.get("detail") or body.get("message") or str(exc)
            else:
                detail = str(exc)
        except Exception:
            detail = response.text or str(exc)
            
        raise HTTPException(status_code=response.status_code, detail=detail)

    try:
        return response.json()
    except ValueError:
        return response.text

async def request_async(token: str | None, **kwargs) -> dict | str:
    """Requests request with interceptors to handle token and commons exceptions."""
    headers, kwargs = __pre_request(token, **kwargs)
    req = httpx.Request(headers=headers, **kwargs)
    res = await __async_client.send(req)
    return __post_request(res, kwargs)

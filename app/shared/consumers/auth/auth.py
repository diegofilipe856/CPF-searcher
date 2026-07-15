from app.domain.schemas.auth_response import LoginResponse
from app.shared.consumers.generic import request_async
from app.config.env import squid_url
from app.shared.consumers.squid_users import squid_users as squid_users_consumer


async def user_logon(username: str, password: str):
    """User logon"""
    logon = await request_async(
        token=None,
        method='POST',
        url=f'{squid_url}/api/auth/logon/user/login',
        json={'username': username, 'password': password, 'portalId': 'portal_subweb'},
    )
    token = logon['token']
    me = await get_me(token)
    return LoginResponse(token=token, me=me)

async def get_me(token: str):
    user_response = await squid_users_consumer.get_me(token=token)
    return user_response
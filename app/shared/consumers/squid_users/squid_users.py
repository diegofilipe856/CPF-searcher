from app.domain.schemas import auth_response as schemas
from app.shared.consumers.generic import request_async
from app.config.env import squid_url


async def get_me(token: str) -> schemas.UserResponse:
    """Get the logged user"""
    auth_data = await request_async(
        method='GET',
        token=token,
        url=f'{squid_url}/api/users/me',
        data={},
    )
    return schemas.UserResponse(**auth_data)

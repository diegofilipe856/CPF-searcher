import app.shared.consumers.auth.auth as auth_consumer
async def user_logon(username: str, password: str):
    logon = await auth_consumer.user_logon(username=username, password=password)
    return logon
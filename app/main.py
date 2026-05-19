from fastapi import FastAPI
from app.controllers import person_controller
app = FastAPI()
@app.get("/")
def read_root():
    return {"Hello": "World"}

app.include_router(person_controller.router)

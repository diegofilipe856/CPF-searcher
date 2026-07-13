from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.controllers import person_controller
from app.controllers import criminal_records_controller
from app.controllers import auth as auth_controller

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "https://ssp-digital.diegobezerra.space", "https://diegobezerra.space"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def read_root():
    return {"Hello": "World"}

app.include_router(person_controller.router)
app.include_router(criminal_records_controller.router)
app.include_router(auth_controller.router)


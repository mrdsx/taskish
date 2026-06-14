from fastapi import FastAPI

from src.lifespan import lifespan
from src.router import router as tasks_router

app = FastAPI(lifespan=lifespan)


@app.get("/")
def read_root():
    return {"status": "ok"}


app.include_router(tasks_router)

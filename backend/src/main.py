from fastapi import FastAPI

from src.lifespan import lifespan
from src.middleware import AuthMiddleware
from src.router import router as tasks_router
from src.trash_router import router as trash_router

app = FastAPI(lifespan=lifespan)


@app.get("/")
def read_root():
    return {"status": "ok"}


app.add_middleware(AuthMiddleware)
app.include_router(tasks_router)
app.include_router(trash_router)

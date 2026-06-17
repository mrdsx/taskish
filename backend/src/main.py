from fastapi import FastAPI

from src.api import api_router
from src.core.lifespan import lifespan
from src.core.middleware import AuthMiddleware

app = FastAPI(lifespan=lifespan)


# TODO: implement old deleted tasks cleanup
@app.get("/")
def read_root():
    return {"status": "ok"}


app.add_middleware(AuthMiddleware)
app.include_router(api_router)

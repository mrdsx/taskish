from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi_crons import Crons
from starlette.responses import FileResponse

from src.api import api_router
from src.core.lifespan import lifespan
from src.core.middleware.auth import AuthMiddleware
from src.core.middleware.rate_limiting import RateLimitingMiddleware
from src.core.middleware.throttling import ThrottlingMiddleware
from src.core.settings import settings

app = FastAPI(lifespan=lifespan)
crons = Crons(app)
import src.crons  # noqa: E402, F401

app.mount("/static", StaticFiles(directory=settings.static_dir), name="static")

# Last middleware added - first to be executed
app.add_middleware(AuthMiddleware)
app.add_middleware(RateLimitingMiddleware)
app.add_middleware(ThrottlingMiddleware)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_headers=["*"],
    allow_methods=["*"],
)
app.include_router(api_router)


@app.get("/")
def read_root():
    if settings.app_env == "prod":
        return FileResponse(path="static/frontend/index.html")
    return {"status": "ok"}

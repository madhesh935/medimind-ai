from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.core.config import settings
from app.core.exceptions import add_exception_handlers
from app.websocket.manager import ws_manager
from app.routers import auth, profiles, device, ai, medicine, dashboard, gamification, telemedicine, admin, notifications
from app.jobs.scheduler import start_scheduler

@asynccontextmanager
async def lifespan(app: FastAPI):
    start_scheduler()
    yield
    # Shutdown scheduler or other resources here if needed

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    lifespan=lifespan,
    redirect_slashes=True,
)

app.include_router(auth.router, prefix=f"{settings.API_V1_STR}/auth", tags=["auth"])
app.include_router(profiles.router, prefix=f"{settings.API_V1_STR}/profiles", tags=["profiles"])
app.include_router(device.router, prefix=f"{settings.API_V1_STR}/devices", tags=["smart-bottles"])
app.include_router(ai.router, prefix=f"{settings.API_V1_STR}/ai", tags=["ai"])
app.include_router(medicine.router, prefix=f"{settings.API_V1_STR}/medicines", tags=["medicines"])
app.include_router(dashboard.router, prefix=f"{settings.API_V1_STR}/dashboard", tags=["dashboard"])
app.include_router(gamification.router, prefix=f"{settings.API_V1_STR}/gamification", tags=["gamification"])
app.include_router(telemedicine.router, prefix=f"{settings.API_V1_STR}/telemedicine", tags=["telemedicine"])
app.include_router(admin.router, prefix=f"{settings.API_V1_STR}/admin", tags=["admin"])
app.include_router(notifications.router, prefix=f"{settings.API_V1_STR}/notifications", tags=["notifications"])

# Register global exception handlers
add_exception_handlers(app)

@app.websocket(f"{settings.API_V1_STR}/ws/{{user_id}}")
async def websocket_endpoint(websocket: WebSocket, user_id: int):
    await ws_manager.connect(websocket, user_id)
    try:
        while True:
            # Wait for any messages from client (e.g. ping)
            data = await websocket.receive_text()
    except WebSocketDisconnect:
        ws_manager.disconnect(websocket, user_id)

# CORS must be added before routes to take effect correctly
app.add_middleware(
    CORSMiddleware,
    # Dev servers in this project run on a sandbox-assigned port (not a fixed 5173/3000),
    # so allow any localhost/127.0.0.1 origin rather than hardcoding specific ports.
    allow_origin_regex=r"https?://(localhost|127\.0\.0\.1)(:\d+)?",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"message": "Welcome to MediMind AI Backend API"}

@app.get(f"{settings.API_V1_STR}/health")
def health_check():
    return {"status": "ok"}

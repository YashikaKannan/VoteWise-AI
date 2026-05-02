from __future__ import annotations

import os
from contextlib import asynccontextmanager

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from models.schemas import HealthResponse
from routes import chat, content, decision, simulation, user
from services import firestore_service, translate_service

load_dotenv()


@asynccontextmanager
async def lifespan(_: FastAPI):
    try:
        firestore_service._init_firebase()
    except Exception as e:
        print("Firebase init failed:", e)
    yield

app = FastAPI(
    title="VoteWise AI API",
    description="Intelligent election companion backend",
    version="1.0.0",
    lifespan=lifespan,
)

_origins = os.getenv("CORS_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in _origins if o.strip()],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(user.router)
app.include_router(decision.router)
app.include_router(chat.router)
app.include_router(simulation.router)
app.include_router(content.router)



@app.get("/")
def root():
    return {"message": "API is running"}


@app.get("/health", response_model=HealthResponse)
async def health() -> HealthResponse:
    return HealthResponse(
        status="ok",
        services={
            "firestore": firestore_service.get_client_status(),
            "translate": translate_service.status(),
            "gemini": "enabled" if os.getenv("GEMINI_API_KEY", "").strip() else "disabled",
        },
    )


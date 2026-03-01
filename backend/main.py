"""main.py — DAIL Navigator FastAPI application."""

import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from routers import cases, facets, stats

load_dotenv()

FRONTEND_ORIGIN = os.getenv("FRONTEND_ORIGIN", "http://localhost:5173")

app = FastAPI(
    title="DAIL Navigator API",
    description="Backend for the Database of AI Litigation Navigator",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_ORIGIN, "http://localhost:5174"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(cases.router, prefix="/api")
app.include_router(facets.router, prefix="/api")
app.include_router(stats.router, prefix="/api")


@app.get("/api/health")
def health():
    return {"status": "ok"}

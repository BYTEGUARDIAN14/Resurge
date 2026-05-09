"""Resurge backend — serves curated public content (quotes & milestones).
All sensitive user data lives ON-DEVICE (AsyncStorage). This server
never receives or stores personal recovery information."""

from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime, timezone, date
import hashlib

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

mongo_url = os.environ["MONGO_URL"]
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ["DB_NAME"]]

app = FastAPI(title="Resurge API", version="1.0.0")
api_router = APIRouter(prefix="/api")


# ============================================================
#  Curated content — deliberately handcrafted, recovery-tuned
# ============================================================

QUOTES: List[dict] = [
    {"id": "q01", "text": "A slip is not a fall. Stand up, brush off, walk on.", "author": "Resurge"},
    {"id": "q02", "text": "You are not your urges. You are the calm beneath them.", "author": "Resurge"},
    {"id": "q03", "text": "Every clean hour is a quiet act of self-respect.", "author": "Resurge"},
    {"id": "q04", "text": "The cave you fear to enter holds the treasure you seek.", "author": "Joseph Campbell"},
    {"id": "q05", "text": "Discipline is choosing what you want most over what you want now.", "author": "Abraham Lincoln"},
    {"id": "q06", "text": "Pain is inevitable. Suffering is optional.", "author": "Haruki Murakami"},
    {"id": "q07", "text": "Be kind to yourself. You're rebuilding from inside out.", "author": "Resurge"},
    {"id": "q08", "text": "What you resist persists. What you observe dissolves.", "author": "Carl Jung"},
    {"id": "q09", "text": "The urge is a wave. Don't fight it. Surf it.", "author": "Alan Marlatt"},
    {"id": "q10", "text": "Strength does not come from winning. It comes from showing up.", "author": "Resurge"},
    {"id": "q11", "text": "Tomorrow's strength is built in tonight's restraint.", "author": "Resurge"},
    {"id": "q12", "text": "You are doing the bravest thing — choosing yourself again.", "author": "Resurge"},
    {"id": "q13", "text": "Between stimulus and response there is a space. In that space is your power.", "author": "Viktor Frankl"},
    {"id": "q14", "text": "The wound is the place where the light enters you.", "author": "Rumi"},
    {"id": "q15", "text": "We are what we repeatedly do. Excellence is a habit.", "author": "Aristotle"},
    {"id": "q16", "text": "You don't have to be perfect. You just have to be honest.", "author": "Resurge"},
    {"id": "q17", "text": "The chains of habit are too light to be felt until they are too heavy to be broken.", "author": "Warren Buffett"},
    {"id": "q18", "text": "Today, breathe. Tomorrow, breathe. That is enough.", "author": "Resurge"},
    {"id": "q19", "text": "Healing is not linear. Neither is greatness.", "author": "Resurge"},
    {"id": "q20", "text": "What once owned you no longer needs your attention.", "author": "Resurge"},
    {"id": "q21", "text": "Quiet the noise. Hear the version of you that is whole.", "author": "Resurge"},
    {"id": "q22", "text": "Old habits die when you stop feeding them.", "author": "Resurge"},
    {"id": "q23", "text": "Comfort is the enemy of becoming.", "author": "Resurge"},
    {"id": "q24", "text": "The man who moves a mountain begins by carrying away small stones.", "author": "Confucius"},
    {"id": "q25", "text": "You are the one your future self is rooting for.", "author": "Resurge"},
    {"id": "q26", "text": "Fall seven times. Rise eight.", "author": "Japanese Proverb"},
    {"id": "q27", "text": "Triggers are teachers in disguise.", "author": "Resurge"},
    {"id": "q28", "text": "Rest is not retreat. Rest is recovery.", "author": "Resurge"},
    {"id": "q29", "text": "Your past does not negotiate your future.", "author": "Resurge"},
    {"id": "q30", "text": "Tonight you stayed. That matters.", "author": "Resurge"},
]

BRAIN_TIMELINE: List[dict] = [
    {"days": 1,   "title": "The first quiet hour",     "body": "Dopamine begins recalibrating. The numb fog from constant overstimulation starts to lift.",                                            "icon": "moon"},
    {"days": 3,   "title": "Withdrawal peak",          "body": "Mood dips, urges spike. This is the body's protest as it loses its old fuel. It always passes.",                                       "icon": "activity"},
    {"days": 7,   "title": "Sharper senses",           "body": "Eye contact feels more powerful. Real-life beauty becomes brighter than pixels. The world reopens.",                                  "icon": "eye"},
    {"days": 14,  "title": "Mental clarity returns",   "body": "Focus deepens. The constant background hum of craving softens. Decisions get easier.",                                                "icon": "zap"},
    {"days": 30,  "title": "New baseline",             "body": "Your reward system has begun rewiring. Healthy pleasures (food, music, movement) feel meaningful again.",                              "icon": "shield"},
    {"days": 60,  "title": "Energy surge",             "body": "Many report a 'flatline' breaking — drive, ambition, libido normalize and align with real life.",                                     "icon": "trending-up"},
    {"days": 90,  "title": "Deep rewire",              "body": "Neuroscience suggests significant neuroplastic change. The pull is fundamentally weaker.",                                            "icon": "feather"},
    {"days": 180, "title": "A different person",       "body": "Long compulsive loops are largely gone. You spend the energy elsewhere — on people, on craft.",                                       "icon": "compass"},
    {"days": 365, "title": "Resurgent",                "body": "A full year of choosing yourself rebuilds identity at a foundational level. You are not who you were.",                                "icon": "award"},
]

MILESTONES: List[dict] = [
    {"days": 1,   "title": "First Light",      "subtitle": "Day one is the hardest. You did it.",        "icon": "sunrise",      "color": "#6B8F71"},
    {"days": 3,   "title": "Three Suns",       "subtitle": "Withdrawal eases. Clarity sharpens.",        "icon": "sun",          "color": "#7FA386"},
    {"days": 7,   "title": "First Week",       "subtitle": "Seven days of choosing yourself.",           "icon": "leaf",         "color": "#4A7C59"},
    {"days": 14,  "title": "Fortnight",        "subtitle": "New patterns are forming inside you.",       "icon": "trending-up",  "color": "#5B937B"},
    {"days": 30,  "title": "Resilience",       "subtitle": "A full month. Old self is fading.",          "icon": "shield",       "color": "#D4A373"},
    {"days": 60,  "title": "Forge",            "subtitle": "Two months — the rewire is real.",           "icon": "anchor",       "color": "#C8915F"},
    {"days": 90,  "title": "Reborn",           "subtitle": "Ninety days. You are not the same person.",  "icon": "feather",      "color": "#E27D60"},
    {"days": 180, "title": "Half Year",        "subtitle": "Six months of reclaimed life.",              "icon": "compass",      "color": "#E89B6E"},
    {"days": 365, "title": "Resurgent",        "subtitle": "One year. You rose.",                        "icon": "award",        "color": "#F4F4F5"},
]


# ===================================
#  Models
# ===================================

class Quote(BaseModel):
    id: str
    text: str
    author: str

class Milestone(BaseModel):
    days: int
    title: str
    subtitle: str
    icon: str
    color: str

class HealthResponse(BaseModel):
    status: str
    timestamp: str
    quotes: int
    milestones: int


# ===================================
#  Routes
# ===================================

@api_router.get("/health", response_model=HealthResponse)
async def health():
    return HealthResponse(
        status="ok",
        timestamp=datetime.now(timezone.utc).isoformat(),
        quotes=len(QUOTES),
        milestones=len(MILESTONES),
    )

@api_router.get("/quotes/all", response_model=List[Quote])
async def quotes_all():
    return [Quote(**q) for q in QUOTES]

@api_router.get("/quotes/random", response_model=Quote)
async def quotes_random():
    import random
    return Quote(**random.choice(QUOTES))

@api_router.get("/quotes/daily", response_model=Quote)
async def quotes_daily(seed: Optional[str] = None):
    """Deterministic quote-of-the-day. Same seed → same quote, so the
    user sees a stable quote all day (client passes today's date)."""
    key = seed or date.today().isoformat()
    digest = hashlib.sha256(key.encode()).hexdigest()
    idx = int(digest, 16) % len(QUOTES)
    return Quote(**QUOTES[idx])

@api_router.get("/milestones", response_model=List[Milestone])
async def milestones_all():
    return [Milestone(**m) for m in MILESTONES]

@api_router.get("/brain-timeline")
async def brain_timeline_all():
    return BRAIN_TIMELINE

@api_router.get("/milestones/next")
async def milestones_next(days_clean: int):
    if days_clean < 0:
        raise HTTPException(status_code=400, detail="days_clean must be >= 0")
    upcoming = [m for m in MILESTONES if m["days"] > days_clean]
    achieved = [m for m in MILESTONES if m["days"] <= days_clean]
    return {
        "next": upcoming[0] if upcoming else None,
        "previous": achieved[-1] if achieved else None,
        "achieved_count": len(achieved),
        "total_count": len(MILESTONES),
    }

@api_router.get("/")
async def root():
    return {"app": "Resurge", "version": "1.0.0"}


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")
logger = logging.getLogger("resurge")


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()

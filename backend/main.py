from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from recommender import MovieRecommender
import os
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("main")

app = FastAPI(
    title="CineWhiz Movie Recommendation API",
    description="Backend for CineWhiz using FastAPI",
    version="1.1.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

recommender = None

@app.on_event("startup")
def startup_event():
    global recommender
    logger.info("🔄 Loading recommender system...")
    try:
        recommender = MovieRecommender()
    except Exception as e:
        logger.exception("❌ Failed to load recommender system")
        recommender = None

@app.get("/")
def read_root():
    return {"message": "🎬 CineWhiz API is up and running!"}

@app.get("/recommend")
def get_recommendations(title: str = Query(..., description="Movie title to base recommendations on")):
    logger.info(f"🎯 Request for recommendations based on: {title}")
    if not recommender:
        raise HTTPException(status_code=503, detail="Recommender system not available")
    try:
        results = recommender.recommend(title)
        if results == ["Movie not found in dataset."]:
            raise HTTPException(status_code=404, detail=f"Movie '{title}' not found")
        return {"recommended": results}
    except Exception as e:
        logger.exception("🚨 Error processing recommendation request")
        raise HTTPException(status_code=500, detail="Internal server error")
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routes import resume_router, ai_analyzer_router
from .database import init_db

init_db()

app = FastAPI(
    title="AI Resume Analyzer API",
    description="Analyze resumes, match with jobs, and generate reports",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000",
        "https://ai-resume-analyzer-three-ruddy.vercel.app/"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(resume_router)
app.include_router(ai_analyzer_router)

@app.get("/")
async def root():
    return {"message": "AI Resume Analyzer API operational"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}
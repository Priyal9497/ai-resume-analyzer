from pydantic import BaseModel
from typing import List, Dict, Optional, Any
from datetime import datetime

class AnalysisRequest(BaseModel):
    resume_id: int
    job_description: Optional[str] = None

class JobMatchRequest(BaseModel):
    resume_id: int
    job_description: str
    job_title: Optional[str] = "Target Role"
    company: Optional[str] = "Target Company"

class RewriteRequest(BaseModel):
    section_text: str
    section_type: Optional[str] = "experience"
    style: Optional[str] = "professional"

class CoverLetterRequest(BaseModel):
    resume_id: int
    job_title: str
    company: str
    job_description: str

class SkillGapRequest(BaseModel):
    resume_id: int
    job_skills: List[str]

class RoadmapRequest(BaseModel):
    resume_id: int
    target_role: str

class InterviewQuestionsRequest(BaseModel):
    resume_id: int
    job_title: str
    job_description: str

class GitHubAnalysisRequest(BaseModel):
    username: str
    user_id: Optional[int] = None

class ChatRequest(BaseModel):
    resume_id: int
    message: str

class AnalyticsTrackRequest(BaseModel):
    user_id: Optional[int] = None
    event_type: str
    event_data: Optional[Dict[str, Any]] = {}

class SaveVersionRequest(BaseModel):
    resume_id: int
    content: str
    changes: Optional[Dict[str, Any]] = {}

# The new endpoints you added
class BulkAnalysisRequest(BaseModel):
    resume_ids: List[int]
    job_description: Optional[str] = None

class CompareResumesRequest(BaseModel):
    resume_id_1: int
    resume_id_2: int

# ✅ Add these new schemas
class JobSearchRequest(BaseModel):
    resume_id: int
    job_title: Optional[str] = None
    location: Optional[str] = ""
    limit: Optional[int] = 10
    source: Optional[str] = "all"  # all, github, indeed, linkedin, remote

class JobListing(BaseModel):
    title: str
    company: str
    location: str
    description: str
    url: str
    source: str
    posted_at: str
    apply_url: str
    match_score: Optional[int] = None
    match_percentage: Optional[str] = None

class JobSearchResponse(BaseModel):
    success: bool
    jobs: List[JobListing]
    total_found: int
    search_query: str

class SaveJobRequest(BaseModel):  # ✅ ADD THIS
    resume_id: int
    job_title: str
    company: str
    job_url: str
    match_score: Optional[int] = None
    location: Optional[str] = None
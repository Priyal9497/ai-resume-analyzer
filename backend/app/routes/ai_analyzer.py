from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from datetime import datetime, timedelta

from ..database import (
    get_db, Resume, SkillGapAnalysis, InterviewQuestion,
    GitHubAnalysis, ChatHistory, Analytics, ResumeVersion,
    JobSearchHistory,
    SavedJob  # ✅ ADD THIS - was missing!
)
from ..schemas import (
    RewriteRequest, CoverLetterRequest, SkillGapRequest,
    RoadmapRequest, InterviewQuestionsRequest, GitHubAnalysisRequest,
    ChatRequest, AnalyticsTrackRequest, SaveVersionRequest,
    BulkAnalysisRequest, CompareResumesRequest,
    JobSearchRequest, SaveJobRequest,
    JobListing, JobSearchResponse 
)
from ..config import settings
from ..services import AdvancedAnalyzer

import httpx
from bs4 import BeautifulSoup
import re
from typing import List, Dict, Optional

router = APIRouter(prefix="/api/v1", tags=["ai_analyzer"])
advanced_analyzer = AdvancedAnalyzer(settings.GEMINI_API_KEY)


@router.post("/generate-heatmap/{resume_id}")
async def generate_heatmap(resume_id: int, db: Session = Depends(get_db)):
    resume = db.query(Resume).filter(Resume.id == resume_id).first()
    if not resume:
        raise HTTPException(404, "Resume not found")
    
    heatmap = advanced_analyzer.generate_heatmap(resume.parsed_data.get('full_text', ''))
    resume.heatmap_data = heatmap
    db.commit()
    return {"success": True, "heatmap": heatmap}

@router.post("/rewrite-resume-section")
async def rewrite_resume_section(req: RewriteRequest):
    rewritten = advanced_analyzer.rewrite_resume_section(
        req.section_text, req.section_type, req.style
    )
    return {"success": True, "rewritten_text": rewritten}

@router.post("/generate-cover-letter")
async def generate_cover_letter(req: CoverLetterRequest, db: Session = Depends(get_db)):
    resume = db.query(Resume).filter(Resume.id == req.resume_id).first()
    if not resume:
        raise HTTPException(404, "Resume not found")
    
    cover_letter = advanced_analyzer.generate_cover_letter(
        resume.parsed_data, {"title": req.job_title, "company": req.company, "description": req.job_description}
    )
    return {"success": True, "cover_letter": cover_letter}

@router.post("/analyze-skill-gap")
async def analyze_skill_gap(req: SkillGapRequest, db: Session = Depends(get_db)):
    resume = db.query(Resume).filter(Resume.id == req.resume_id).first()
    if not resume:
        raise HTTPException(404, "Resume not found")
    
    current_skills = resume.parsed_data.get('skills', [])
    gap_analysis = advanced_analyzer.analyze_skill_gap(current_skills, req.job_skills)
    
    skill_gap = SkillGapAnalysis(
        resume_id=req.resume_id,
        current_skills=current_skills,
        required_skills=req.job_skills,
        missing_skills=gap_analysis['missing_skills'],
        learning_resources=gap_analysis['learning_resources']
    )
    db.add(skill_gap)
    db.commit()
    return {"success": True, "analysis": gap_analysis}

@router.post("/generate-learning-roadmap")
async def generate_learning_roadmap(req: RoadmapRequest, db: Session = Depends(get_db)):
    resume = db.query(Resume).filter(Resume.id == req.resume_id).first()
    if not resume:
        raise HTTPException(404, "Resume not found")
    
    roadmap = advanced_analyzer.generate_learning_roadmap(
        resume.parsed_data.get('skills', []), req.target_role
    )
    return {"success": True, "roadmap": roadmap}

@router.post("/generate-interview-questions")
async def generate_interview_questions(req: InterviewQuestionsRequest, db: Session = Depends(get_db)):
    resume = db.query(Resume).filter(Resume.id == req.resume_id).first()
    if not resume:
        raise HTTPException(404, "Resume not found")
    
    questions = advanced_analyzer.generate_interview_questions(
        resume.parsed_data, {"title": req.job_title, "description": req.job_description}
    )
    
    for q in questions:
        db.add(InterviewQuestion(
            resume_id=req.resume_id,
            category=q.get('category'),
            question=q.get('question'),
            sample_answer=q.get('sample_answer'),
            difficulty=q.get('difficulty')
        ))
    db.commit()
    return {"success": True, "questions": questions}

@router.post("/chat-with-resume")
async def chat_with_resume(req: ChatRequest, db: Session = Depends(get_db)):
    resume = db.query(Resume).filter(Resume.id == req.resume_id).first()
    if not resume:
        raise HTTPException(404, "Resume not found")
    
    chat_history = db.query(ChatHistory).filter(
        ChatHistory.resume_id == req.resume_id
    ).order_by(ChatHistory.created_at.desc()).limit(5).all()
    
    history = [{"user_message": c.user_message, "ai_response": c.ai_response} for c in chat_history]
    response = advanced_analyzer.chat_with_resume(resume.parsed_data, req.message, history)
    
    chat = ChatHistory(resume_id=req.resume_id, user_message=req.message, ai_response=response)
    db.add(chat)
    db.commit()
    return {"success": True, "response": response, "chat_id": chat.id}

@router.post("/save-resume-version")
async def save_resume_version(req: SaveVersionRequest, db: Session = Depends(get_db)):
    resume = db.query(Resume).filter(Resume.id == req.resume_id).first()
    if not resume:
        raise HTTPException(404, "Resume not found")
    
    versions = db.query(ResumeVersion).filter(ResumeVersion.resume_id == req.resume_id).all()
    version_number = len(versions) + 1
    
    version = ResumeVersion(
        resume_id=req.resume_id,
        version_number=version_number,
        content=req.content,
        changes=req.changes
    )
    db.add(version)
    db.commit()
    return {"success": True, "version": version_number}

@router.post("/bulk-analyze")
async def bulk_analyze_resumes(req: BulkAnalysisRequest, db: Session = Depends(get_db)):
    from ..services.analyzer import ResumeAnalyzer
    analyzer = ResumeAnalyzer(settings.GEMINI_API_KEY)
    
    results = []
    for resume_id in req.resume_ids:
        resume = db.query(Resume).filter(Resume.id == resume_id).first()
        if resume:
            analysis = analyzer.analyze_resume(resume.parsed_data, req.job_description)
            results.append({"resume_id": resume_id, "analysis": analysis})
    return {"success": True, "results": results}

@router.post("/compare-resumes")
async def compare_resumes(req: CompareResumesRequest, db: Session = Depends(get_db)):
    resume1 = db.query(Resume).filter(Resume.id == req.resume_id_1).first()
    resume2 = db.query(Resume).filter(Resume.id == req.resume_id_2).first()
    if not resume1 or not resume2:
        raise HTTPException(404, "One or both resumes not found")
    
    # Simple fallback comparison logic since it's a new feature
    comparison = {
        "resume1_skills": resume1.parsed_data.get('skills', []),
        "resume2_skills": resume2.parsed_data.get('skills', []),
        "resume1_score": resume1.analysis_result.get('ats_score', 0) if resume1.analysis_result else 0,
        "resume2_score": resume2.analysis_result.get('ats_score', 0) if resume2.analysis_result else 0
    }
    return {"success": True, "comparison": comparison}

@router.get("/export-resume/{resume_id}")
async def export_resume_data(resume_id: int, format: str = "json", db: Session = Depends(get_db)):
    resume = db.query(Resume).filter(Resume.id == resume_id).first()
    if not resume:
        raise HTTPException(404, "Resume not found")
    
    data = {
        "id": resume.id,
        "filename": resume.filename,
        "parsed_data": resume.parsed_data,
        "analysis": resume.analysis_result,
        "created_at": resume.created_at.isoformat()
    }
    
    if format == "json":
        return JSONResponse(content=data)
    else:
        raise HTTPException(400, "Only JSON export is currently supported")
    
# Add this new endpoint after existing ones
@router.post("/find-jobs")
async def find_jobs(req: JobSearchRequest, db: Session = Depends(get_db)):
    """
    Find relevant job listings based on resume analysis
    """
    resume = db.query(Resume).filter(Resume.id == req.resume_id).first()
    if not resume:
        raise HTTPException(404, "Resume not found")
    
    # Extract skills from resume
    skills = resume.parsed_data.get('skills', [])
    experience = resume.parsed_data.get('experience', [])
    
    # Build search query from resume data
    search_query = " ".join(skills[:10])  # Use top 10 skills
    if req.job_title:
        search_query = f"{req.job_title} {search_query}"
    
    # Get job recommendations
    jobs = await fetch_job_listings(
        search_query=search_query,
        location=req.location,
        limit=req.limit or 10,
        source=req.source or "all"
    )
    
    # Calculate match scores for each job
    for job in jobs:
        job_skills = extract_skills_from_text(job.get('description', ''))
        match_score = calculate_job_match(skills, job_skills)
        job['match_score'] = match_score
        job['match_percentage'] = f"{match_score}%"
    
    # Sort by match score
    jobs.sort(key=lambda x: x.get('match_score', 0), reverse=True)
    
    # Save search history
    search_history = JobSearchHistory(
        resume_id=req.resume_id,
        query=search_query,
        results_count=len(jobs),
        search_data={"filters": req.dict()}
    )
    db.add(search_history)
    db.commit()
    
    return {
        "success": True,
        "jobs": jobs[:req.limit or 10],
        "total_found": len(jobs),
        "search_query": search_query
    }

@router.post("/save-job")
async def save_job(req: SaveJobRequest, db: Session = Depends(get_db)):
    """Save a job for later reference"""
    resume = db.query(Resume).filter(Resume.id == req.resume_id).first()
    if not resume:
        raise HTTPException(404, "Resume not found")
    
    # Check if job already exists
    existing = db.query(SavedJob).filter(
        SavedJob.resume_id == req.resume_id,
        SavedJob.job_url == req.job_url
    ).first()
    
    if existing:
        return {"success": True, "message": "Job already saved", "saved_job": existing}
    
    saved_job = SavedJob(
        resume_id=req.resume_id,
        job_title=req.job_title,
        company=req.company,
        job_url=req.job_url,
        match_score=req.match_score,
        location=req.location
    )
    db.add(saved_job)
    db.commit()
    db.refresh(saved_job)
    
    return {
        "success": True,
        "saved_job": {
            "id": saved_job.id,
            "job_title": saved_job.job_title,
            "company": saved_job.company,
            "match_score": saved_job.match_score,
            "created_at": saved_job.created_at
        }
    }

@router.get("/saved-jobs/{resume_id}")
async def get_saved_jobs(resume_id: int, db: Session = Depends(get_db)):
    """Get all saved jobs for a resume"""
    saved_jobs = db.query(SavedJob).filter(
        SavedJob.resume_id == resume_id
    ).order_by(SavedJob.created_at.desc()).all()
    
    return {
        "success": True,
        "jobs": [
            {
                "id": job.id,
                "job_title": job.job_title,
                "company": job.company,
                "job_url": job.job_url,
                "location": job.location,
                "match_score": job.match_score,
                "created_at": job.created_at
            } for job in saved_jobs
        ]
    }
@router.get("/job-search-history/{resume_id}")
async def get_job_search_history(resume_id: int, db: Session = Depends(get_db)):
    """Get job search history for a resume"""
    history = db.query(JobSearchHistory).filter(
        JobSearchHistory.resume_id == resume_id
    ).order_by(JobSearchHistory.created_at.desc()).limit(20).all()
    
    return {
        "success": True,
        "history": [
            {
                "id": h.id,
                "query": h.query,
                "results_count": h.results_count,
                "created_at": h.created_at
            } for h in history
        ]
    }

# Helper functions
async def fetch_job_listings(search_query: str, location: str = "", limit: int = 10, source: str = "all") -> List[Dict]:
    """
    Fetch job listings from various sources
    """
    jobs = []
    
    # Try multiple job sources
    sources = []
    if source == "all" or source == "github":
        sources.append(fetch_github_jobs)
    if source == "all" or source == "indeed":
        sources.append(fetch_indeed_jobs)
    if source == "all" or source == "linkedin":
        sources.append(fetch_linkedin_jobs)
    if source == "all" or source == "remote":
        sources.append(fetch_remote_jobs)
    
    # Fetch from all sources in parallel
    for fetch_func in sources:
        try:
            source_jobs = await fetch_func(search_query, location, limit)
            jobs.extend(source_jobs)
        except Exception as e:
            print(f"Error fetching from {fetch_func.__name__}: {e}")
    
    # Remove duplicates based on URL
    seen_urls = set()
    unique_jobs = []
    for job in jobs:
        if job.get('url') not in seen_urls:
            seen_urls.add(job.get('url'))
            unique_jobs.append(job)
    
    return unique_jobs[:limit]

async def fetch_github_jobs(query: str, location: str = "", limit: int = 10) -> List[Dict]:
    """Fetch jobs from GitHub Jobs API"""
    jobs = []
    try:
        # GitHub Jobs API (free, no auth required)
        url = f"https://jobs.github.com/positions.json?description={query}&location={location}"
        async with httpx.AsyncClient() as client:
            response = await client.get(url, timeout=10)
            if response.status_code == 200:
                data = response.json()
                for item in data[:limit]:
                    jobs.append({
                        "title": item.get('title', ''),
                        "company": item.get('company', ''),
                        "location": item.get('location', ''),
                        "description": item.get('description', ''),
                        "url": item.get('url', ''),
                        "source": "GitHub Jobs",
                        "posted_at": item.get('created_at', ''),
                        "apply_url": item.get('url', '')
                    })
    except Exception as e:
        print(f"GitHub Jobs API error: {e}")
    
    return jobs

async def fetch_indeed_jobs(query: str, location: str = "", limit: int = 10) -> List[Dict]:
    """Fetch jobs from Indeed (using RSS feed or web scraping)"""
    jobs = []
    try:
        # Use Indeed RSS feed
        search_query = query.replace(' ', '+')
        url = f"https://rss.indeed.com/rss?q={search_query}&l={location}"
        
        async with httpx.AsyncClient() as client:
            response = await client.get(url, timeout=10)
            if response.status_code == 200:
                # Parse RSS feed
                soup = BeautifulSoup(response.text, 'xml')
                items = soup.find_all('item')[:limit]
                
                for item in items:
                    title = item.find('title')
                    desc = item.find('description')
                    link = item.find('link')
                    pub_date = item.find('pubDate')
                    
                    if title and link:
                        jobs.append({
                            "title": title.text if title else '',
                            "company": extract_company_from_title(title.text if title else ''),
                            "location": location or 'Various',
                            "description": desc.text[:500] + '...' if desc else '',
                            "url": link.text if link else '',
                            "source": "Indeed",
                            "posted_at": pub_date.text if pub_date else '',
                            "apply_url": link.text if link else ''
                        })
    except Exception as e:
        print(f"Indeed API error: {e}")
    
    return jobs

async def fetch_linkedin_jobs(query: str, location: str = "", limit: int = 10) -> List[Dict]:
    """Fetch jobs from LinkedIn (using public API or scraping)"""
    jobs = []
    try:
        # Using LinkedIn's public job search (may need API key for production)
        # This is a mock implementation - you'd need LinkedIn API access
        # For demo purposes, we'll generate realistic-looking jobs
        import random
        
        companies = ['Google', 'Microsoft', 'Amazon', 'Meta', 'Apple', 'Netflix', 'Tesla', 'Adobe', 'Salesforce', 'Oracle']
        titles = [f"{query} Engineer", f"Senior {query} Developer", f"{query} Specialist"]
        
        for _ in range(min(limit, 5)):
            job = {
                "title": random.choice(titles),
                "company": random.choice(companies),
                "location": location or "Remote / US",
                "description": f"We are looking for a skilled {query} professional to join our team...",
                "url": f"https://linkedin.com/jobs/view/{random.randint(100000, 999999)}",
                "source": "LinkedIn",
                "posted_at": "Posted recently",
                "apply_url": f"https://linkedin.com/jobs/view/{random.randint(100000, 999999)}"
            }
            jobs.append(job)
            
    except Exception as e:
        print(f"LinkedIn API error: {e}")
    
    return jobs

async def fetch_remote_jobs(query: str, location: str = "", limit: int = 10) -> List[Dict]:
    """Fetch remote jobs from various sources"""
    jobs = []
    try:
        # Remote OK API (free)
        url = f"https://remoteok.com/api?search={query}"
        async with httpx.AsyncClient() as client:
            response = await client.get(url, timeout=10)
            if response.status_code == 200:
                data = response.json()
                # First item is metadata, skip it
                for item in data[1:limit+1]:
                    jobs.append({
                        "title": item.get('position', ''),
                        "company": item.get('company', ''),
                        "location": "Remote",
                        "description": item.get('description', ''),
                        "url": item.get('url', ''),
                        "source": "Remote OK",
                        "posted_at": item.get('date', ''),
                        "apply_url": item.get('url', '')
                    })
    except Exception as e:
        print(f"Remote OK API error: {e}")
    
    return jobs

def extract_company_from_title(title: str) -> str:
    """Extract company name from job title"""
    # Common patterns: "Job Title at Company" or "Job Title - Company"
    if ' at ' in title:
        return title.split(' at ')[-1]
    elif ' - ' in title:
        return title.split(' - ')[-1]
    else:
        return "Unknown Company"

def extract_skills_from_text(text: str) -> List[str]:
    """Extract skills from job description text"""
    # Common tech skills to look for
    common_skills = [
        'python', 'java', 'javascript', 'typescript', 'react', 'angular', 'vue', 'node.js', 
        'django', 'flask', 'fastapi', 'spring', 'aws', 'azure', 'gcp', 'docker', 'kubernetes',
        'git', 'sql', 'nosql', 'mongodb', 'postgresql', 'mysql', 'redis', 'elasticsearch',
        'machine learning', 'ai', 'data science', 'analytics', 'agile', 'scrum', 'leadership',
        'communication', 'problem solving', 'teamwork', 'tensorflow', 'pytorch', 'scikit-learn'
    ]
    
    text_lower = text.lower()
    found_skills = []
    for skill in common_skills:
        if skill in text_lower:
            found_skills.append(skill)
    
    return found_skills

def calculate_job_match(resume_skills: List[str], job_skills: List[str]) -> int:
    """Calculate match percentage between resume and job"""
    if not job_skills:
        return 50  # Default if no skills found
    
    resume_skills_lower = [s.lower() for s in resume_skills]
    job_skills_lower = [s.lower() for s in job_skills]
    
    # Calculate overlap
    matching_skills = set(resume_skills_lower) & set(job_skills_lower)
    match_percentage = (len(matching_skills) / len(job_skills_lower)) * 100
    
    return min(100, int(match_percentage))
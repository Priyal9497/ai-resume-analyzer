from fastapi import APIRouter, UploadFile, File, HTTPException, Depends, Response
from sqlalchemy.orm import Session
import os
from datetime import datetime

from ..database import get_db, Resume, MatchResult
from ..schemas import AnalysisRequest, JobMatchRequest
from ..services import ResumeParser, ResumeAnalyzer, JobMatcher, ReportGenerator
from ..config import settings

router = APIRouter(prefix="/api/v1", tags=["resume"])

parser = ResumeParser()
analyzer = ResumeAnalyzer(settings.GEMINI_API_KEY)
matcher = JobMatcher()
report_gen = ReportGenerator()

@router.post("/upload-resume")
async def upload_resume(file: UploadFile = File(...), db: Session = Depends(get_db)):
    try:
        ext = os.path.splitext(file.filename)[1].lower()
        if ext not in settings.ALLOWED_EXTENSIONS:
            raise HTTPException(400, "File extension not allowed")

        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        safe_filename = f"{timestamp}_{file.filename}"
        file_path = os.path.join(settings.UPLOAD_DIR, safe_filename)

        with open(file_path, "wb") as buffer:
            buffer.write(await file.read())

        parsed_data = parser.parse_resume(file_path)

        db_resume = Resume(
            filename=file.filename,
            file_path=file_path,
            parsed_data=parsed_data
        )
        db.add(db_resume)
        db.commit()
        db.refresh(db_resume)

        return {
            "success": True,
            "message": "Resume uploaded and parsed successfully",
            "resume_id": db_resume.id,
            "parsed_data": parsed_data
        }
    except Exception as e:
        raise HTTPException(500, detail=str(e))

@router.get("/resumes")
async def get_resumes(db: Session = Depends(get_db)):
    resumes = db.query(Resume).order_by(Resume.created_at.desc()).all()
    return [{
        "id": r.id,
        "filename": r.filename,
        "created_at": r.created_at,
        "has_analysis": bool(r.analysis_result),
        "skills": r.parsed_data.get("skills", [])[:5] if r.parsed_data else []
    } for r in resumes]

@router.get("/resume/{resume_id}")
async def get_resume(resume_id: int, db: Session = Depends(get_db)):
    resume = db.query(Resume).filter(Resume.id == resume_id).first()
    if not resume:
        raise HTTPException(404, "Resume not found")
    return {
        "id": resume.id,
        "filename": resume.filename,
        "parsed_data": resume.parsed_data,
        "analysis": resume.analysis_result,
        "created_at": resume.created_at
    }

@router.post("/analyze-resume")
async def analyze_resume(req: AnalysisRequest, db: Session = Depends(get_db)):
    resume = db.query(Resume).filter(Resume.id == req.resume_id).first()
    if not resume:
        raise HTTPException(404, "Resume not found")

    analysis = analyzer.analyze_resume(resume.parsed_data, req.job_description)
    resume.analysis_result = analysis
    db.commit()

    return {"success": True, "analysis": analysis}

@router.post("/match-job")
async def match_job(req: JobMatchRequest, db: Session = Depends(get_db)):
    resume = db.query(Resume).filter(Resume.id == req.resume_id).first()
    if not resume:
        raise HTTPException(404, "Resume not found")

    resume_skills = resume.parsed_data.get("skills", [])
    job_skills = parser._extract_skills(req.job_description)

    match_res = matcher.match(
        resume.parsed_data.get("full_text", ""),
        req.job_description,
        resume_skills,
        job_skills
    )

    db_match = MatchResult(
        resume_id=resume.id,
        job_title=req.job_title,
        company=req.company,
        match_score=match_res['overall_match'],
        matching_skills=match_res['matching_skills'],
        missing_skills=match_res['missing_skills'],
        analysis=match_res
    )
    db.add(db_match)
    db.commit()

    return {"success": True, "match": match_res}

@router.get("/generate-report/{resume_id}")
async def generate_report(resume_id: int, db: Session = Depends(get_db)):
    resume = db.query(Resume).filter(Resume.id == resume_id).first()
    if not resume:
        raise HTTPException(404, "Resume not found")

    pdf_bytes = report_gen.generate_pdf_report(resume.analysis_result or {})
    return Response(content=pdf_bytes, media_type="application/pdf", headers={
        "Content-Disposition": f"attachment; filename=Resume_Analysis_{resume_id}.pdf"
    })
from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime, Text, JSON, Boolean, ForeignKey
from sqlalchemy.orm import declarative_base, sessionmaker, relationship
from datetime import datetime
from .config import settings

engine = create_engine(
    settings.DATABASE_URL,
    connect_args={"check_same_thread": False} if "sqlite" in settings.DATABASE_URL else {}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    full_name = Column(String)
    is_active = Column(Boolean, default=True)
    is_recruiter = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    resumes = relationship("Resume", back_populates="user")
    saved_jobs = relationship("SavedJob", back_populates="user")  # ✅ Keep this one

class Resume(Base):
    __tablename__ = "resumes"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    filename = Column(String, index=True)
    file_path = Column(String)
    version = Column(Integer, default=1)
    parsed_data = Column(JSON, default={})
    analysis_result = Column(JSON, default={})
    heatmap_data = Column(JSON, default={})
    rewritten_version = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    user = relationship("User", back_populates="resumes")
    versions = relationship("ResumeVersion", back_populates="resume")
    chats = relationship("ChatHistory", back_populates="resume")
    matches = relationship("MatchResult", back_populates="resume")
    job_searches = relationship("JobSearchHistory", back_populates="resume")  # ✅ ADD THIS
    saved_jobs = relationship("SavedJob", back_populates="resume")  # ✅ ADD THIS

class MatchResult(Base):
    __tablename__ = "match_results"
    
    id = Column(Integer, primary_key=True, index=True)
    resume_id = Column(Integer, ForeignKey("resumes.id"))
    job_id = Column(String, nullable=True)
    job_title = Column(String, nullable=True)
    company = Column(String, nullable=True)
    match_score = Column(Float)
    matching_skills = Column(JSON)
    missing_skills = Column(JSON)
    analysis = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    resume = relationship("Resume", back_populates="matches")

class ResumeVersion(Base):
    __tablename__ = "resume_versions"
    
    id = Column(Integer, primary_key=True, index=True)
    resume_id = Column(Integer, ForeignKey("resumes.id"))
    version_number = Column(Integer)
    content = Column(Text)
    changes = Column(JSON)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    resume = relationship("Resume", back_populates="versions")

class ChatHistory(Base):
    __tablename__ = "chat_histories"
    
    id = Column(Integer, primary_key=True, index=True)
    resume_id = Column(Integer, ForeignKey("resumes.id"))
    user_message = Column(Text)
    ai_response = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    resume = relationship("Resume", back_populates="chats")

# ✅ Remove duplicate SavedJob - keep only ONE definition
class SavedJob(Base):
    __tablename__ = "saved_jobs"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)  # ✅ Made nullable
    resume_id = Column(Integer, ForeignKey("resumes.id"), nullable=True)  # ✅ Added this
    job_title = Column(String)
    company = Column(String)
    job_description = Column(Text, nullable=True)
    job_url = Column(String, nullable=True)  # ✅ Added this
    location = Column(String, nullable=True)  # ✅ Added this
    match_score = Column(Float, nullable=True)
    applied = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    user = relationship("User", back_populates="saved_jobs")
    resume = relationship("Resume", back_populates="saved_jobs")  # ✅ Add this

class SkillGapAnalysis(Base):
    __tablename__ = "skill_gap_analyses"
    
    id = Column(Integer, primary_key=True, index=True)
    resume_id = Column(Integer, ForeignKey("resumes.id"))
    current_skills = Column(JSON)
    required_skills = Column(JSON)
    missing_skills = Column(JSON)
    learning_resources = Column(JSON)
    created_at = Column(DateTime, default=datetime.utcnow)

class InterviewQuestion(Base):
    __tablename__ = "interview_questions"
    
    id = Column(Integer, primary_key=True, index=True)
    resume_id = Column(Integer, ForeignKey("resumes.id"))
    category = Column(String)
    question = Column(Text)
    sample_answer = Column(Text)
    difficulty = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)

class GitHubAnalysis(Base):
    __tablename__ = "github_analyses"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    github_username = Column(String)
    repositories = Column(JSON)
    languages = Column(JSON)
    contributions = Column(JSON)
    analysis_result = Column(JSON)
    created_at = Column(DateTime, default=datetime.utcnow)

class Analytics(Base):
    __tablename__ = "analytics"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    event_type = Column(String)
    event_data = Column(JSON)
    created_at = Column(DateTime, default=datetime.utcnow)

class JobSearchHistory(Base):
    __tablename__ = "job_search_history"
    
    id = Column(Integer, primary_key=True, index=True)
    resume_id = Column(Integer, ForeignKey("resumes.id"))
    query = Column(String)
    results_count = Column(Integer, default=0)
    search_data = Column(JSON, default={})
    created_at = Column(DateTime, default=datetime.utcnow)
    
    resume = relationship("Resume", back_populates="job_searches")  # ✅ Fixed this

def init_db():
    Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
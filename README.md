<div align="center">

# AI Resume Analyzer

### *Intelligent Resume Analysis Powered by Google Gemini AI*

[![Live Demo](https://img.shields.io/badge/_Live_Demo-Visit_App-6C3CE1?style=for-the-badge)](https://ai-resume-analyzer-frontend-lil0.onrender.com)
[![GitHub](https://img.shields.io/badge/GitHub-Repository-181717?style=for-the-badge&logo=github)](https://github.com/Priyal9497/ai-resume-analyzer)
[![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![Python](https://img.shields.io/badge/Python_3.12-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://python.org)

![AI Resume Analyzer Banner](https://img.shields.io/badge/AI_Powered-Resume_Analysis-6C3CE1?style=for-the-badge&labelColor=0a0a0f)

</div>

---

## Table of Contents

- [Overview](#-overview)
- [Live Demo](#-live-demo)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [API Endpoints](#-api-endpoints)
- [Screenshots](#-screenshots)
- [Contributing](#-contributing)

---

## Overview

**AI Resume Analyzer** is a full-stack web application that uses **Google Gemini AI** to provide intelligent resume analysis, ATS scoring, job matching, and personalized career recommendations. Upload your resume and get instant insights to help you land your dream job.

Built with a modern dark glassmorphism UI design, the app offers a seamless experience from resume upload to detailed AI-powered feedback.

---

## Live Demo

**[https://ai-resume-analyzer-frontend-lil0.onrender.com](https://ai-resume-analyzer-frontend-lil0.onrender.com)**

---

## Features

### Resume Management
- **Upload Resumes** — PDF, DOCX, and TXT formats supported (up to 10MB)
- **Auto Parsing** — Extracts name, email, phone, skills, education, experience, projects, and certifications
- **Resume History** — View and manage all uploaded resumes
- **Version Control** — Save and track multiple versions of your resume

### AI-Powered Analysis (Google Gemini)
- **ATS Score** — Get an Applicant Tracking System compatibility score (0–100)
- **Strengths & Improvements** — Detailed feedback on what's working and what needs work
- **Section Scores** — Individual scores for Experience, Education, Skills, Projects, Certifications
- **AI Improved Summary** — Automatically rewritten professional summary
- **Suggested Roles** — AI-recommended job titles based on your profile

### Advanced AI Features
- **Skill Heatmap** — Visual representation of skill frequency and importance
- **AI Resume Rewriter** — Rewrite any section in 4 styles: Professional, Creative, Technical, Executive
- **Cover Letter Generator** — Personalized cover letters for any job and company
- **Interview Questions** — AI-generated technical, behavioral, situational, and culture-fit questions
- **AI Resume Chat** — Interactive chat to ask questions about your resume

### Job Matching
- **Smart Job Matching** — Multi-strategy matching using TF-IDF and keyword analysis
- **Skill Gap Analysis** — Identify missing skills with curated learning resources
- **Learning Roadmap** — Personalized phase-based roadmap to reach your target role
- **Match History** — Track all your job match results

### Reports & Analytics
- **PDF Report Generation** — Download professional analysis reports
- **Analytics Dashboard** — Track uploads, analyses, matches, and downloads
- **GitHub Profile Analyzer** — Analyze GitHub repositories, languages, and contributions

---

## Tech Stack

### Backend
| Technology | Purpose |
|---|---|
| **FastAPI** | REST API framework |
| **Python 3.12** | Core language |
| **Google Gemini AI** | AI analysis, rewriting, chat |
| **SQLAlchemy** | ORM and database management |
| **SQLite** | Database (development) |
| **pdfplumber** | PDF text extraction |
| **python-docx** | DOCX file parsing |
| **scikit-learn** | TF-IDF vectorization and cosine similarity |
| **ReportLab** | PDF report generation |
| **Uvicorn** | ASGI server |

### Frontend
| Technology | Purpose |
|---|---|
| **React 18** | UI framework |
| **Vite** | Build tool and dev server |
| **Tailwind CSS** | Utility-first styling |
| **Framer Motion** | Animations |
| **Axios** | HTTP client |
| **React Router DOM** | Client-side routing |
| **React Hot Toast** | Notifications |
| **React Dropzone** | File upload drag & drop |
| **Heroicons** | Icon library |
| **Plus Jakarta Sans** | Primary font |
| **Space Grotesk** | Heading font |

---

## Project Structure

```text
ai-resume-analyzer/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py                 # FastAPI application entry point
│   │   ├── config.py               # Configuration and environment variables
│   │   ├── database.py             # Database connection and SQLAlchemy setup
│   │   ├── schemas.py              # Pydantic request/response models
│   │   ├── routes/
│   │   │   ├── __init__.py
│   │   │   ├── resume.py           # Resume upload, parsing, analysis, and job matching APIs
│   │   │   └── ai_analyzer.py      # AI-powered resume features and chat APIs
│   │   └── services/
│   │       ├── __init__.py
│   │       ├── resume_parser.py    # Extract text from PDF, DOCX, and TXT files
│   │       ├── analyzer.py         # Gemini AI resume analysis
│   │       ├── matcher.py          # TF-IDF based job matching
│   │       ├── advanced_analyzer.py# Heatmap, cover letter, interview questions, and GitHub analysis
│   │       └── report_generator.py # PDF report generation
│   ├── uploads/                    # Uploaded resume files
│   ├── requirements.txt            # Python dependencies
│   └── .env                        # Environment variables
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Layout/
│   │   │   │   ├── Navbar.jsx
│   │   │   │   └── Footer.jsx
│   │   │   ├── Upload/
│   │   │   │   └── FileUpload.jsx
│   │   │   └── Analysis/
│   │   │       ├── Heatmap.jsx
│   │   │       ├── ResumeRewriter.jsx
│   │   │       ├── CoverLetterGenerator.jsx
│   │   │       └── InterviewQuestions.jsx
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── Upload.jsx
│   │   │   ├── Analysis.jsx
│   │   │   ├── Match.jsx
│   │   │   └── History.jsx
│   │   ├── services/
│   │   │   └── api.js              # Axios API service
│   │   ├── App.jsx                 # Root React component
│   │   ├── main.jsx                # React application entry point
│   │   └── index.css               # Global styles and Tailwind CSS
│   ├── index.html
│   ├── tailwind.config.js
│   ├── vite.config.js
│   ├── package.json
│   └── .env
│
└── README.md
```
---

## Getting Started

### Prerequisites
- Python 3.12+
- Node.js 18+
- Google Gemini API key ([get one free](https://aistudio.google.com/apikey))

### 1. Clone
```bash
git clone https://github.com/Priyal9497/ai-resume-analyzer.git
cd ai-resume-analyzer
```

### 2. Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

Create `backend/.env`:
```env
DATABASE_URL=sqlite:///./resume.db
GEMINI_API_KEY=your_gemini_api_key_here
UPLOAD_DIR=./uploads
```

Run:
```bash
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```
Backend: http://127.0.0.1:8000 · Docs: http://127.0.0.1:8000/docs

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Frontend: http://localhost:5173

Create `frontend/.env`:
```env
VITE_API_URL=http://localhost:8000/api/v1
```

Both servers must run simultaneously.

---

## Key API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/upload-resume` | Upload and parse a resume |
| POST | `/api/v1/analyze-resume` | AI analysis of resume |
| POST | `/api/v1/match-job` | Match resume to job description |
| GET | `/api/v1/generate-report/{id}` | Download PDF report |
| POST | `/api/v1/rewrite-resume-section` | Rewrite resume section with AI |
| POST | `/api/v1/generate-cover-letter` | Generate cover letter |
| POST | `/api/v1/generate-interview-questions` | Generate interview questions |
| POST | `/api/v1/chat-with-resume` | AI chat about resume |
| POST | `/api/v1/analyze-github` | Analyze GitHub profile |

Full endpoint list available at `/docs` once the backend is running.

---

## Contributing

```bash
git checkout -b feature/amazing-feature
git commit -m "Add amazing feature"
git push origin feature/amazing-feature
```
Then open a Pull Request.

---

## License

MIT License

## Author

**Priyal Aggarwal** — [GitHub](https://github.com/Priyal9497)

---

<div align="center">
If you found this helpful, please star the repository!

Built with ❤️ using FastAPI + React + Google Gemini AI

</div> ```
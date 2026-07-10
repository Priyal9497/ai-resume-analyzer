import spacy
import pdfplumber
from docx import Document
import re
import os
from typing import Dict, List, Optional

class ResumeParser:
    def __init__(self):
        try:
            self.nlp = spacy.load("en_core_web_sm")
        except Exception:
            self.nlp = None

        self.skill_keywords = {
            'python', 'java', 'javascript', 'typescript', 'c++', 'c#', 'ruby', 'php',
            'sql', 'nosql', 'mongodb', 'postgresql', 'mysql', 'redis', 'elasticsearch',
            'react', 'angular', 'vue', 'node.js', 'django', 'flask', 'fastapi',
            'tensorflow', 'pytorch', 'scikit-learn', 'pandas', 'numpy',
            'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'jenkins', 'git',
            'ci/cd', 'terraform', 'linux', 'nginx', 'agile', 'scrum', 'leadership',
            'communication', 'project management', 'machine learning', 'ai', 'html', 'css'
        }

    def extract_text(self, file_path: str) -> str:
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"File not found: {file_path}")

        ext = os.path.splitext(file_path)[1].lower()
        if ext == '.pdf':
            text = ""
            with pdfplumber.open(file_path) as pdf:
                for page in pdf.pages:
                    t = page.extract_text()
                    if t:
                        text += t + "\n"
            return text
        elif ext == '.docx':
            doc = Document(file_path)
            return '\n'.join([para.text for para in doc.paragraphs])
        elif ext == '.txt':
            with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                return f.read()
        else:
            raise ValueError(f"Unsupported extension: {ext}")

    def parse_resume(self, file_path: str) -> Dict:
        text = self.extract_text(file_path)
        
        doc = self.nlp(text[:500000]) if self.nlp else None

        return {
            'name': self._extract_name(doc, text),
            'email': self._extract_email(text),
            'phone': self._extract_phone(text),
            'skills': self._extract_skills(text),
            'experience': self._extract_experience(text),
            'education': self._extract_education(text),
            'projects': self._extract_projects(text),
            'certifications': self._extract_certifications(text),
            'full_text': text
        }

    def _extract_name(self, doc, text: str) -> Optional[str]:
        if doc:
            for ent in doc.ents:
                if ent.label_ == "PERSON":
                    return ent.text.strip()
        lines = [line.strip() for line in text.split('\n') if line.strip()]
        return lines[0] if lines else "Candidate"

    def _extract_email(self, text: str) -> Optional[str]:
        match = re.search(r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b', text)
        return match.group(0) if match else None

    def _extract_phone(self, text: str) -> Optional[str]:
        match = re.search(r'\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}', text)
        return match.group(0) if match else None

    def _extract_skills(self, text: str) -> List[str]:
        text_lower = text.lower()
        found = [skill for skill in self.skill_keywords if skill in text_lower]
        return sorted(found)

    def _extract_experience(self, text: str) -> List[Dict]:
        exp = []
        matches = re.findall(r'(\d+)\s*(?:years?|yrs?)\s*(?:of\s*)?(?:experience|exp)', text, re.IGNORECASE)
        for m in matches:
            exp.append({'years': int(m), 'description': f"{m} years of experience"})
        return exp if exp else [{'years': 1, 'description': 'Work experience'}]

    def _extract_education(self, text: str) -> List[str]:
        keywords = ['bachelor', 'master', 'phd', 'b.s.', 'm.s.', 'b.tech', 'university', 'college']
        results = []
        for line in text.split('\n'):
            if any(kw in line.lower() for kw in keywords):
                clean = line.strip()
                if clean and len(clean) < 150:
                    results.append(clean)
        return results[:3]

    def _extract_projects(self, text: str) -> List[str]:
        keywords = ['project', 'developed', 'built', 'created', 'designed']
        results = []
        for s in text.split('.'):
            if any(kw in s.lower() for kw in keywords) and len(s.strip()) > 20:
                results.append(s.strip())
        return results[:3]

    def _extract_certifications(self, text: str) -> List[str]:
        keywords = ['certified', 'certification', 'certificate', 'coursera', 'udemy', 'aws certified']
        results = []
        for s in text.split('.'):
            if any(kw in s.lower() for kw in keywords) and len(s.strip()) > 10:
                results.append(s.strip())
        return results[:3]
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from typing import Dict, List

class JobMatcher:
    def __init__(self):
        self.vectorizer = TfidfVectorizer(max_features=1000, stop_words='english')

    def match(self, resume_text: str, job_text: str, resume_skills: List[str], job_skills: List[str]) -> Dict:
        try:
            tfidf_mat = self.vectorizer.fit_transform([resume_text, job_text])
            tfidf_score = float(cosine_similarity(tfidf_mat[0:1], tfidf_mat[1:2])[0][0])
        except Exception:
            tfidf_score = 0.5

        res_skills = set([s.lower() for s in resume_skills])
        j_skills = set([s.lower() for s in job_skills])

        matching_skills = list(res_skills & j_skills)
        missing_skills = list(j_skills - res_skills)

        skill_overlap = (len(matching_skills) / len(j_skills)) if j_skills else 0.5
        final_score = round(((tfidf_score * 0.5) + (skill_overlap * 0.5)) * 100, 2)

        return {
            'overall_match': final_score,
            'tfidf_score': round(tfidf_score * 100, 2),
            'skill_overlap': round(skill_overlap * 100, 2),
            'matching_skills': matching_skills,
            'missing_skills': missing_skills,
            'match_percentage': f"{round(final_score)}%"
        }
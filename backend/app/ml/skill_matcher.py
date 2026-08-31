"""
Doable! Backend — AI/ML: Skill Matcher

Matches freelancers to projects based on skill similarity using scikit-learn.

Usage:
    from app.ml.skill_matcher import SkillMatcher

    matcher = SkillMatcher()
    matcher.fit(freelancer_skills_data)
    matches = matcher.find_matches(project_required_skills, top_k=5)
"""

import numpy as np

try:
    from sklearn.feature_extraction.text import TfidfVectorizer
    from sklearn.metrics.pairwise import cosine_similarity

    ML_AVAILABLE = True
except ImportError:
    ML_AVAILABLE = False


class SkillMatcher:
    """
    Matches freelancers to projects based on skill overlap and similarity.

    Uses TF-IDF vectorization + cosine similarity to rank freelancers
    by how well their skills match a project's requirements.
    """

    def __init__(self):
        if not ML_AVAILABLE:
            raise ImportError(
                "scikit-learn is required for skill matching. "
                "Install with: pip install scikit-learn"
            )
        self.vectorizer = TfidfVectorizer()
        self.freelancer_vectors = None
        self.freelancer_ids: list[str] = []

    def fit(self, freelancer_data: list[dict]) -> None:
        """
        Fit the matcher with freelancer skill data.

        Args:
            freelancer_data: List of dicts with 'id' and 'skills' (list[str]) keys.

        Example:
            matcher.fit([
                {"id": "uuid-1", "skills": ["python", "fastapi", "postgresql"]},
                {"id": "uuid-2", "skills": ["react", "nextjs", "typescript"]},
            ])
        """
        self.freelancer_ids = [f["id"] for f in freelancer_data]
        skill_texts = [" ".join(f.get("skills", [])) for f in freelancer_data]
        self.freelancer_vectors = self.vectorizer.fit_transform(skill_texts)

    def find_matches(
        self,
        required_skills: list[str],
        top_k: int = 5,
        min_score: float = 0.1,
    ) -> list[dict]:
        """
        Find the top-k freelancers matching the required skills.

        Args:
            required_skills: Skills required for the project.
            top_k: Number of top matches to return.
            min_score: Minimum similarity score to include.

        Returns:
            List of dicts with 'freelancer_id' and 'score' keys,
            sorted by score descending.
        """
        if self.freelancer_vectors is None:
            raise ValueError("Matcher not fitted. Call fit() first.")

        query_vector = self.vectorizer.transform([" ".join(required_skills)])
        similarities = cosine_similarity(query_vector, self.freelancer_vectors)[0]

        # Rank and filter
        ranked_indices = np.argsort(similarities)[::-1][:top_k]
        matches = []
        for idx in ranked_indices:
            score = float(similarities[idx])
            if score >= min_score:
                matches.append({
                    "freelancer_id": self.freelancer_ids[idx],
                    "score": round(score, 4),
                })

        return matches

"""
Doable! Backend — AI/ML: Scam Detector

Detects potentially fraudulent or scam proposals using rule-based
keyword filtering and basic NLP heuristics.

Usage:
    from app.ml.scam_detector import ScamDetector

    detector = ScamDetector()
    result = detector.analyze("Send payment to my personal account...")
"""
import re
from dataclasses import dataclass, field


@dataclass
class ScamAnalysis:
    """Result of a scam detection analysis."""
    is_suspicious: bool = False
    confidence: float = 0.0  # 0.0 to 1.0
    flags: list[str] = field(default_factory=list)
    details: str = ""


class ScamDetector:
    """
    Rule-based scam detection for freelancer proposals.

    Uses keyword matching, pattern detection, and basic heuristics
    to flag suspicious content. This is a baseline detector —
    can be enhanced with ML classifiers trained on labeled data.
    """

    # Suspicious keywords and phrases
    SCAM_KEYWORDS = [
        "send money",
        "wire transfer",
        "western union",
        "personal account",
        "pay upfront",
        "advance payment",
        "guaranteed income",
        "earn money fast",
        "no experience needed",
        "work from home guaranteed",
        "click this link",
        "verify your account",
        "share your password",
        "social security",
        "bank details",
        "crypto wallet",
        "bitcoin payment",
        "whatsapp me",
        "telegram me",
        "contact outside",
    ]

    # Suspicious URL patterns
    URL_PATTERN = re.compile(
        r"https?://(?!(?:www\.)?(?:github\.com|linkedin\.com|portfolio))[^\s]+"
    )

    # Excessive caps pattern
    CAPS_PATTERN = re.compile(r"[A-Z]{5,}")

    def analyze(self, text: str) -> ScamAnalysis:
        """
        Analyze text for scam indicators.

        Args:
            text: The proposal text to analyze.

        Returns:
            ScamAnalysis with flags and confidence score.
        """
        if not text or not text.strip():
            return ScamAnalysis(details="Empty text provided")

        flags: list[str] = []
        text_lower = text.lower()

        # Check keywords
        for keyword in self.SCAM_KEYWORDS:
            if keyword in text_lower:
                flags.append(f"Suspicious keyword: '{keyword}'")

        # Check for suspicious URLs
        urls = self.URL_PATTERN.findall(text)
        if urls:
            flags.append(f"Contains {len(urls)} external URL(s)")

        # Check for excessive capitalization (shouting)
        caps_matches = self.CAPS_PATTERN.findall(text)
        if len(caps_matches) > 2:
            flags.append("Excessive capitalization detected")

        # Check for very short proposals (low effort)
        word_count = len(text.split())
        if word_count < 10:
            flags.append("Very short proposal (less than 10 words)")

        # Check for contact info outside platform
        email_pattern = re.compile(r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b")
        if email_pattern.search(text):
            flags.append("Contains email address (potential off-platform contact)")

        phone_pattern = re.compile(r"(?:\+62|08)\d{8,12}")
        if phone_pattern.search(text):
            flags.append("Contains phone number (potential off-platform contact)")

        # Calculate confidence
        confidence = min(len(flags) * 0.2, 1.0)
        is_suspicious = confidence >= 0.3

        details_text = (
            f"Found {len(flags)} suspicious indicator(s)"
            if flags
            else "No issues detected"
        )
        return ScamAnalysis(
            is_suspicious=is_suspicious,
            confidence=round(confidence, 2),
            flags=flags,
            details=details_text,
        )


# Singleton
scam_detector = ScamDetector()

"""
Doable! Backend — Basic Tests
"""
import pytest
from app.ml.scam_detector import ScamDetector


class TestScamDetector:
    """Tests for the scam detection module."""

    def setup_method(self):
        self.detector = ScamDetector()

    def test_clean_proposal(self):
        result = self.detector.analyze(
            "I have 5 years of experience in React and Next.js. "
            "I would love to work on your project. My portfolio includes "
            "several marketplace applications built with similar tech stacks."
        )
        assert result.is_suspicious is False
        assert result.confidence < 0.3

    def test_suspicious_proposal(self):
        result = self.detector.analyze(
            "SEND MONEY to my personal account via western union. "
            "Contact me on whatsapp me at +6281234567890. "
            "Guaranteed income no experience needed."
        )
        assert result.is_suspicious is True
        assert result.confidence >= 0.3
        assert len(result.flags) > 0

    def test_empty_text(self):
        result = self.detector.analyze("")
        assert result.is_suspicious is False

    def test_short_proposal(self):
        result = self.detector.analyze("I can do it.")
        assert any("short" in f.lower() for f in result.flags)

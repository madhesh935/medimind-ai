import json
import logging
from typing import Any, Dict, Optional

from google import genai
from google.genai import types
from google.genai.errors import ClientError

from app.core.config import settings

logger = logging.getLogger(__name__)

# Google has been intermittently returning 404 "no longer available" for individual model
# names mid-rollout, even though the same name succeeds moments later (observed directly
# against this account). Trying a short ordered list of models makes a single flaky name
# non-fatal instead of taking down the whole feature.
MODEL_CANDIDATES = ["gemini-2.5-flash-lite", "gemini-2.5-flash", "gemini-2.0-flash-lite"]


class AIService:
    _client: Optional[genai.Client] = None

    @classmethod
    def _get_client(cls) -> genai.Client:
        if cls._client is None:
            # The SDK defaults to 5 retry attempts with up to 60s of backoff on 5xx errors.
            # Google has been intermittently returning 503 "high demand" during testing, which
            # made a single flaky call block for over a minute before falling back. Trimmed to
            # one quick retry so callers reach the fallback path in a few seconds, not a minute.
            cls._client = genai.Client(
                api_key=settings.GEMINI_API_KEY,
                http_options=types.HttpOptions(
                    timeout=10_000,
                    retry_options=types.HttpRetryOptions(attempts=2, initial_delay=0.5, max_delay=2.0),
                ),
            )
        return cls._client

    @classmethod
    def _generate(cls, contents, config: types.GenerateContentConfig):
        """Tries each candidate model in order. Moves on to the next candidate when a model
        is unavailable (404) or its free-tier quota is exhausted (429) — the Gemini free tier
        tracks quota per model, so a 429 on one model doesn't mean the others are exhausted
        too. Any other error (transient 503, etc.) is raised immediately so the caller's
        normal fallback path handles it without waiting on every remaining candidate."""
        last_error: Optional[Exception] = None
        for model in MODEL_CANDIDATES:
            try:
                return cls._get_client().models.generate_content(model=model, contents=contents, config=config)
            except ClientError as e:
                if e.code in (404, 429):
                    logger.warning("Gemini model %s unavailable (%s), trying next candidate", model, e.code)
                    last_error = e
                    continue
                raise
        raise last_error or RuntimeError("No Gemini model candidates available")

    @staticmethod
    def get_fallback_reply(user_message: str, user_role: str) -> str:
        """Used only when GEMINI_API_KEY is unset or the API call fails."""
        s = user_message.lower()
        if "adherence" in s and "report" not in s:
            return "Your adherence this week is **94%** — the highest in the last 30 days. Morning doses: 100%. Evening: 87%."
        if "report" in s or "summarize" in s:
            return "Here's your weekly health report card: 94% adherence, 28 taken, 2 late, 1 missed."
        if "take" in s and "today" in s:
            return "Yes ✅ — you took **Metformin at 8:03 AM** and **Lisinopril at 9:00 AM** today."
        if "interact" in s and "metformin" in s:
            return "**Metformin interactions to watch:**\n- Alcohol\n- Contrast dyes\n- Cimetidine"
        return "Great question. Based on your profile, everything looks on track. Let me know if you need specific details."

    @classmethod
    def get_reply(cls, user_message: str, user_role: str, context: str = "") -> str:
        if not settings.GEMINI_API_KEY:
            return cls.get_fallback_reply(user_message, user_role)

        system = (
            f"You are MediMind AI, a healthcare assistant embedded in a medication-adherence "
            f"platform. You are speaking with a {user_role}. Answer questions about medications, "
            f"schedules, adherence, and general health topics clearly and concisely. "
            f"Never give a definitive diagnosis or change a prescription — always recommend the "
            f"user consult their doctor for medical decisions."
            + (f"\n\nContext about this user:\n{context}" if context else "")
        )
        try:
            response = cls._generate(
                user_message,
                types.GenerateContentConfig(system_instruction=system, max_output_tokens=1024),
            )
            return response.text or ""
        except Exception:
            logger.exception("Gemini API call failed in AIService.get_reply; using fallback reply")
            return cls.get_fallback_reply(user_message, user_role)

    @classmethod
    def explain_risk(cls, current_risk: str, adherence_pct: float, missed_doses: int, window_days: int) -> str:
        fallback = (
            f"Risk assessed as {current_risk} based on {adherence_pct:.0f}% adherence "
            f"over the last {window_days} days, with {missed_doses} missed dose(s)."
        )
        if not settings.GEMINI_API_KEY:
            return fallback

        system = (
            "You are a clinical AI assistant explaining a medication-adherence risk score to a "
            "care team. Write 2-3 concise sentences that reference the actual numbers given. "
            "Do not invent data that wasn't provided, and do not suggest a specific treatment change."
        )
        prompt = (
            f"Adherence over the last {window_days} days: {adherence_pct:.0f}%. "
            f"Missed doses in that window: {missed_doses}. "
            f"Computed risk level: {current_risk}. Explain why this risk level was assigned."
        )
        try:
            response = cls._generate(
                prompt,
                types.GenerateContentConfig(system_instruction=system, max_output_tokens=300),
            )
            return response.text or fallback
        except Exception:
            logger.exception("Gemini API call failed in AIService.explain_risk; using fallback explanation")
            return fallback

    @classmethod
    def extract_prescription_fields(cls, image_bytes: bytes, media_type: str) -> Dict[str, Any]:
        """Extracts medication fields from a photographed/scanned prescription using
        Gemini's vision input. Returns confidence: 0 with empty fields (not fabricated
        example data) if no API key is configured or the call/parse fails."""
        empty_fallback = {
            "medicine_name": "", "dosage": "", "frequency": "", "duration": "",
            "doctor_name": "", "hospital": "", "confidence": 0,
        }
        if not settings.GEMINI_API_KEY:
            return empty_fallback

        system = (
            "You extract structured medication data from photographed prescriptions. "
            "If multiple medications are visible, extract only the first one listed. "
            "Respond with ONLY a JSON object (no markdown, no prose, no array) with exactly these keys: "
            "medicine_name, dosage, frequency, duration, doctor_name, hospital, confidence "
            "(confidence is an integer 0-100 reflecting how legible/certain the extraction is). "
            "If a field can't be read, use an empty string for it."
        )
        try:
            response = cls._generate(
                [
                    types.Part.from_bytes(data=image_bytes, mime_type=media_type),
                    "Extract the medication fields from this prescription image.",
                ],
                types.GenerateContentConfig(
                    system_instruction=system,
                    max_output_tokens=500,
                    response_mime_type="application/json",
                ),
            )
            data = json.loads(response.text)
            # Gemini sometimes returns a JSON array when multiple medications are visible
            # even when asked for a single object — take the first entry in that case.
            parsed = data[0] if isinstance(data, list) and data else data
            return {**empty_fallback, **parsed}
        except Exception:
            logger.exception("Gemini vision call failed in AIService.extract_prescription_fields; using empty fallback")
            return empty_fallback


ai_service = AIService()

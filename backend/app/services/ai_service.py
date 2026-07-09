from typing import Dict, Any

class AIService:
    @staticmethod
    def get_mock_reply(user_message: str, user_role: str) -> str:
        s = user_message.lower()
        if "adherence" in s and "report" not in s:
            return "Your adherence this week is **94%** — the highest in the last 30 days. Morning doses: 100%. Evening: 87%."
        if "report" in s or "summarize" in s:
            return "Here's your weekly health report card: 94% adherence, 28 taken, 2 late, 1 missed."
        if "take" in s and "today" in s:
            return "Yes ✅ — you took **Metformin at 8:03 AM** and **Lisinopril at 9:00 AM** today."
        if "interact" in s and "metformin" in s:
            return "**Metformin interactions to watch:**\n- Alcohol\n- Contrast dyes\n- Cimetidine"
        return f"Great question. Based on your profile, everything looks on track. Let me know if you need specific details."

ai_service = AIService()

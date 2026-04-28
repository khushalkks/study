# backend/summarizer_app/interview_service.py

import os
from groq import AsyncGroq

SYSTEM_PROMPT = """You are an expert technical interviewer conducting a professional mock interview.

Your role:
- Ask one clear, relevant interview question at a time
- Evaluate the candidate's answers critically but fairly
- Give detailed, constructive feedback after each answer
- Track interview progress and adjust difficulty accordingly
- After 5 questions, provide a comprehensive final evaluation

Rules:
- Be professional but conversational
- Ask follow-up questions if the answer is vague
- Provide specific, actionable feedback clearly separated into:
    ✅ Strengths
    ❌ Areas of Improvement
- When giving final evaluation, include:
    Overall Score: X/10
    Strengths, Weaknesses, and Tips for improvement

Start by greeting the candidate warmly and asking:
1. Their name
2. The role/topic they want to practice for
"""


class InterviewService:
    def __init__(self):
        self.model = "llama-3.3-70b-versatile"
        # Correctly get the API key from environment
        api_key = os.getenv("GROQ_API_KEY")
        
        # Initialize AsyncGroq client with the correct key variable
        self.client = AsyncGroq(api_key=api_key)

    async def get_response(self, messages: list) -> tuple[str, int]:
        groq_messages = [  
            {"role": msg.role, "content": msg.content}
            for msg in messages
        ]

        # Use await with the AsyncGroq client
        completion = await self.client.chat.completions.create(
            model=self.model,
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                *groq_messages,
            ],
            temperature=0.7,
            max_tokens=1024,
        )

        reply = completion.choices[0].message.content
        # Track progress based on assistant messages
        question_count = sum(1 for m in messages if m.role == "assistant")

        return reply, question_count
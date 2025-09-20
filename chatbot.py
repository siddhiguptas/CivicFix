import os
import google.generativeai as genai
from fastapi import APIRouter
from pydantic import BaseModel
from dotenv import load_dotenv

load_dotenv()

# Configure Gemini
genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))
model = genai.GenerativeModel("gemini-1.5-flash")

# Router for chatbot
router = APIRouter()

# Pydantic model
class ChatMessage(BaseModel):
    message: str

# System instructions (acts as system prompt)
SYSTEM_PROMPT = """
You are CivicConnect Chatbot.
- Help users check their complaint status using complaint IDs.
- Answer FAQs about complaint submission and resolution.
- Be polite and concise.
- If a complaint ID is invalid or not found, suggest contacting support.
"""

# Endpoint
@router.post("/chatbot")
async def chatbot(msg: ChatMessage):
    try:
        response = model.generate_content(
            f"{SYSTEM_PROMPT}\nUser: {msg.message}\nAssistant:"
        )
        reply = response.text or "Sorry, I couldn’t generate a reply."
    except Exception as e:
        reply = f"Error with Gemini: {str(e)}"

    return {"reply": reply}

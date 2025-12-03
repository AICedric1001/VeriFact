import google.generativeai as genai
import os
from dotenv import load_dotenv
from google.generativeai.types import HarmCategory, HarmBlockThreshold

# Load .env file
load_dotenv()

# --- TEMPORARY DIAGNOSTIC LINE ---
if os.getenv("GEMINI_API_KEY"):
    print("✅ API Key loaded successfully.")
else:
    print("❌ ERROR: GEMINI_API_KEY is NOT set in the environment.")

# Define robust safety settings to block harmful content
# BLOCK_MEDIUM_AND_ABOVE is a strong filter.
safety_config = [
    {
        "category": HarmCategory.HARM_CATEGORY_HARASSMENT,
        "threshold": HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
        "category": HarmCategory.HARM_CATEGORY_HATE_SPEECH,
        "threshold": HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
        "category": HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
        "threshold": HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
        "category": HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
        "threshold": HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
]
    
# Configure API key
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

# Correct model instantiation
model = genai.GenerativeModel("models/gemini-2.0-flash", safety_settings=safety_config)  # NOTE: full path with "models/"
# You can also use: "models/gemini-pro" or just check with genai.list_models()


def summarize_with_gemini(text):
    if not text or len(text.strip()) < 100:
        return "❌ Not enough content to summarize."

    prompt = (
        "Summarize the following news text into a short, factual paragraph. "
        "Avoid opinions and speculation. Only summarize verified claims.\n\n"
        f"{text}"
    )

    try:
        response = model.generate_content(prompt)
        return response.text.strip()
    except Exception as e:
        print("❌ Gemini API Error (Content likely blocked by safety filter):", e)
        return "⚠️ Failed to generate summary."


def respond_with_gemini(prompt):
    """Generate a conversational response using Gemini."""
    if not prompt or len(prompt.strip()) < 20:
        return "⚠️ Prompt is too short to generate a meaningful response."

    try:
        response = model.generate_content(prompt)
        return response.text.strip()
    except Exception as e:
        print("❌ Gemini Chat Error:", e)
        return "⚠️ Failed to generate follow-up response."



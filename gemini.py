import google.generativeai as genai
import os
from dotenv import load_dotenv

# Load .env file
load_dotenv()

# Configure API key
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

# Correct model instantiation
model = genai.GenerativeModel("models/gemini-2.0-flash")  # NOTE: full path with "models/"
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
        print("❌ Gemini API Error:", e)
        return "⚠️ Failed to generate summary."
    

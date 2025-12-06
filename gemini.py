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
model = genai.GenerativeModel("models/gemini-2.0-flash", safety_settings=safety_config)


def summarize_with_gemini(text_or_prompt):
    """
    Enhanced summarization function that handles both simple text and complex prompts.
    Supports relevance checking and contextual analysis.
    """
    if not text_or_prompt or len(text_or_prompt.strip()) < 20:
        return "❌ Not enough content to summarize."

    # Check if this is already a formatted prompt (contains specific instructions)
    is_formatted_prompt = any(keyword in text_or_prompt for keyword in [
        "TASK:", "User Query:", "determine if", "respond with:"
    ])

    if is_formatted_prompt:
        # Use the prompt as-is (for relevance checking)
        prompt = text_or_prompt
    else:
        # Create a basic summarization prompt
        prompt = (
            "Summarize the following news text into a short, factual paragraph. "
            "Avoid opinions and speculation. Only summarize verified claims.\n\n"
            f"{text_or_prompt}"
        )

    try:
        response = model.generate_content(prompt)
        result = response.text.strip()
        
        # If result is empty or too short, provide fallback
        if not result or len(result) < 20:
            return "⚠️ Unable to generate a meaningful summary from the available sources."
        
        return result
    except Exception as e:
        print("❌ Gemini API Error:", e)
        # Check if it's a safety filter issue
        if "safety" in str(e).lower() or "blocked" in str(e).lower():
            return "⚠️ Content was blocked by safety filters. Unable to generate summary."
        return "⚠️ Failed to generate summary due to technical error."


def respond_with_gemini(prompt):
    """Generate a conversational response using Gemini."""
    if not prompt or len(prompt.strip()) < 20:
        return "⚠️ Prompt is too short to generate a meaningful response."

    try:
        response = model.generate_content(prompt)
        result = response.text.strip()
        
        # If result is empty, provide fallback
        if not result:
            return "⚠️ Unable to generate a response. Please try rephrasing your question."
        
        return result
    except Exception as e:
        print("❌ Gemini Chat Error:", e)
        if "safety" in str(e).lower() or "blocked" in str(e).lower():
            return "⚠️ Response was blocked by safety filters. Please rephrase your question."
        return "⚠️ Failed to generate follow-up response."

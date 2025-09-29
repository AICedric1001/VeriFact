from serpapi.google_search import GoogleSearch
from googlesearch import search
from newspaper import Article
import spacy
import os

# Load spaCy English model
nlp = spacy.load("en_core_web_sm")

# --- Function to search using SerpApi ---
def search_serpapi(query, api_key=None):
    effective_key = api_key or os.getenv("SERPAPI_API_KEY")
    if not effective_key:
        raise ValueError("SERPAPI_API_KEY not provided. Set env var or pass api_key.")

    params = {
        "engine": "google",
        "q": query,
        "api_key": effective_key,
        # We will slice to top 5 below to be explicit regardless of API defaults
    }

    search_instance = GoogleSearch(params)
    results = search_instance.get_dict()
    organic = results.get('organic_results', [])[:5]

    # Return structured results for top 5: title and link
    top_results = []
    for res in organic:
        link = res.get('link') or res.get('url')
        title = res.get('title')
        if link:
            top_results.append({
                "title": title,
                "url": link
            })

    return top_results

# --- Function to scrape and extract article text ---
def extract_article_text(url):
    try:
        article = Article(url)
        article.download()
        article.parse()
        return article.text
    except:
        return None

# --- NLP Entity Extraction ---
def analyze_text(text):
    doc = nlp(text)
    return [(ent.text, ent.label_) for ent in doc.ents]

# --- Full System Workflow ---
def main_system(query, api_key=None):
    print(f"\n🔎 Searching for: {query}")

    # Choose search method
    if api_key or os.getenv("SERPAPI_API_KEY"):
        top_results = search_serpapi(query, api_key)
        links_with_meta = top_results  # list of dicts with title, url
    else:
        # Fallback to simple google search (no API); limit to 5
        links_with_meta = [{"title": None, "url": url} for url in list(search(query, num_results=5))]

    results = []
    for item in links_with_meta:
        url = item["url"]
        title = item.get("title")
        content = extract_article_text(url)
        if content and len(content.strip()) > 50:
            analysis = analyze_text(content)
            results.append({
                "title": title,
                "url": url,
                "content": content,
                "entities": analysis
            })

    # Already limited to top 5 when using SerpAPI; ensure max 5 regardless
    return results[:5]

# --- User Input and Output ---
if __name__ == "__main__":
    query = input("Enter a topic or question to search: ")
    api_key = input("Enter your SerpApi key (leave blank to use default GoogleSearch scraping): ").strip()
    if api_key == "":
        api_key = None

    data = main_system(query, api_key)

    print("\n📄 Related Sources and Extracted Entities:\n")
    for item in data:
        print("🔗 URL:", item["url"])
        #print("🧠 Entities:", item["entities"])
        print("---")

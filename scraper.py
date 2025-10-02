from serpapi.google_search import GoogleSearch
from googlesearch import search
from newspaper import Article
import spacy
import os

# Load spaCy English model
nlp = spacy.load("en_core_web_sm")

# --- Function to search using SerpApi ---
def search_serpapi(query, api_key=None):
    # Accept either SERPAPI_API_KEY or SERPAPI_KEY
    effective_key = (
        api_key
        or os.getenv("SERPAPI_API_KEY")
        or os.getenv("SERPAPI_KEY")
    )
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
        print(f"  ⏳ Downloading: {url}")
        article = Article(url)
        article.download()
        article.parse()
        text = (article.text or '').strip()
        if not text:
            print(f"  ⚠️  No extractable text: {url}")
            return None
        print(f"  ✅ Parsed ({len(text)} chars): {url}")
        return text
    except Exception as e:
        print(f"  ❌ Extract failed: {url} :: {e}")
        return None

# --- NLP Entity Extraction ---
def analyze_text(text):
    doc = nlp(text)
    return [(ent.text, ent.label_) for ent in doc.ents]

# --- Full System Workflow ---
def main_system(query, api_key=None):
    print(f"\n🔎 Searching for: {query}")

    # Choose search method
    try:
        if api_key or os.getenv("SERPAPI_API_KEY"):
            print("🛰️  Using SerpAPI for search…")
            top_results = search_serpapi(query, api_key)
            links_with_meta = top_results  # list of dicts with title, url
        else:
            print("🧭 Using basic Google search fallback…")
            # Try new signature; if unsupported, fall back to older 'num_results'
            try:
                urls = list(search(query, tld="com", lang="en", num=10, stop=5, pause=2.0))
            except TypeError:
                # Older googlesearch versions use 'num_results'
                urls = list(search(query, num_results=5))
            links_with_meta = [{"title": None, "url": url} for url in urls]
    except Exception as e:
        print(f"❌ Search failed: {e}")
        links_with_meta = []

    print(f"🔗 Found {len(links_with_meta)} links")
    if len(links_with_meta) == 0:
        print("⚠️  No links from fallback. Consider setting SERPAPI_API_KEY or retrying with a more specific query.")

    results = []
    for idx, item in enumerate(links_with_meta[:5], start=1):
        url = item.get("url")
        title = item.get("title")
        if not url:
            continue
        print(f"\n[{idx}/5] ▶️  Fetching article")
        content = extract_article_text(url)
        if content and len(content.strip()) > 50:
            print("  🧠 Running NER…")
            analysis = analyze_text(content)
            print(f"  🧾 Entities extracted: {len(analysis)}")
            results.append({
                "title": title,
                "url": url,
                "content": content,
                "entities": analysis
            })
        else:
            print("  ⏭️  Skipped: insufficient content")

    print(f"✅ Completed. Articles kept: {len(results)}")
    # Ensure max 5
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

from serpapi.google_search import GoogleSearch
from googlesearch import search
from newspaper import Article
import spacy

# Load spaCy English model
nlp = spacy.load("en_core_web_sm")

# --- Function to search using SerpApi ---
def search_serpapi(query, api_key):
    params = {
        "engine": "google",
        "q": query,
        "api_key": "4d66b06242419175b6cb80a5f445bf8e5c71a35c22d9a4c2da3ba22956aed69a"
    }
    search_instance = GoogleSearch(params)
    results = search_instance.get_dict()
    return [res['link'] for res in results.get('organic_results', []) if 'link' in res]

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
    if api_key:
        links = search_serpapi(query, api_key)
    else:
        links = list(search(query, num_results=5))
    
    results = []
    for link in links:
        content = extract_article_text(link)
        if content and len(content.strip()) > 50:
            analysis = analyze_text(content)
            results.append({
                "url": link,
                "entities": analysis
            })
    
    return results

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

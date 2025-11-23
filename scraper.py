from serpapi.google_search import GoogleSearch
from googlesearch import search
import newspaper
from newspaper import Article
from newspaper import Config
import spacy
import os
import time
import random
from trusted_sources import FILTERED_DOMAINS

# Load spaCy English model
nlp = spacy.load("en_core_web_sm")

# --- Function to search using SerpApi ---
def search_serpapi(query, api_key=None, site_filter=None):
    # Accept either SERPAPI_API_KEY or SERPAPI_KEY
    effective_key = (
        api_key
        or "b78924b4496d3e2abba8b33f9e89fa5eb443f8e5ba0db605c98b5b6bae37e50c"  # Fallback to your key
    )
    if not effective_key:
        raise ValueError("SERPAPI_API_KEY not provided. Set env var or pass api_key.")

    # Build search query with site filter if provided
    search_query = query
    if site_filter:
        # Convert trusted source URLs to domain names for site: filter
        if isinstance(site_filter, list):
            # Multiple sites - use OR operator
            site_domains = []
            for site in site_filter:
                if site.startswith('https://'):
                    domain = site.replace('https://', '').replace('http://', '').rstrip('/')
                    site_domains.append(f"site:{domain}")
            if site_domains:
                search_query = f"{query} ({' OR '.join(site_domains)})"
        else:
            # Single site
            if site_filter.startswith('https://'):
                domain = site_filter.replace('https://', '').replace('http://', '').rstrip('/')
                search_query = f"{query} site:{domain}"

    params = {
        "engine": "google",
        "q": search_query,
        "api_key": effective_key,
        "num": 10,  # Explicitly request 10 results
        "gl": "us",  # Country code
        "hl": "en",  # Language
        # We will slice to top 5 below to be explicit regardless of API defaults
    }

    try:
        print(f"🔧 SerpAPI params: {params}")
        search_instance = GoogleSearch(params)
        results = search_instance.get_dict()
        
        # Debug: Print full response
        print(f"🔧 SerpAPI full response keys: {list(results.keys())}")
        
        # Check for API errors
        if 'error' in results:
            print(f"❌ SerpAPI Error: {results['error']}")
            return []
            
        organic = results.get('organic_results', [])
        print(f"🔍 SerpAPI returned {len(organic)} organic results")
        
        # Debug: Print first few results
        if organic:
            print(f"🔧 First result: {organic[0]}")
        else:
            print("🔧 No organic results found")
            # Check if there are other result types
            if 'search_information' in results:
                print(f"🔧 Search info: {results['search_information']}")
            if 'answer_box' in results:
                print(f"🔧 Answer box: {results['answer_box']}")

        # Return structured results for top 5: title and link
        top_results = []
        for res in organic[:5]:
            link = res.get('link') or res.get('url')
            title = res.get('title')
            if link:
                top_results.append({
                    "title": title,
                    "url": link
                })

        print(f"🔧 Final top_results: {len(top_results)} items")
        return top_results
    except Exception as e:
        print(f"❌ SerpAPI search failed: {e}")
        import traceback
        traceback.print_exc()
        return []

# Configure newspaper3k with a modern User-Agent and sane defaults
news_config = Config()
news_config.browser_user_agent = (
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 '
    '(KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
)
news_config.request_timeout = 10
# --- Function to scrape and extract article text ---
def extract_article_text(url):
    try:
        print(f"  ⏳ Downloading: {url}")
        article = Article(url, config=news_config)
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
def main_system(query, api_key=None, use_trusted_sources=True):
    print(f"\n🔎 Searching for: {query}")
    
    # Add a small random delay to prevent rapid successive requests
    delay = random.uniform(1, 3)
    print(f"⏱️  Waiting {delay:.1f}s to avoid rate limiting...")
    time.sleep(delay)
    
    # Use the original query for now to debug
    search_query = query
    print(f"🔍 Using original query: {search_query}")
    
    # Set up site filtering if requested
    site_filter = None
    if use_trusted_sources:
        # Use only the non-checked sources (rappler.com, inquirer.net, verafiles.org)
        site_filter = [
            "https://www.verafiles.org/",
            "https://www.rappler.com/",
            "https://www.inquirer.net/",
            "https://www.abs-cbn.com/",
            ""
        ]
        print(f"🏛️  Using trusted sources filter: {site_filter}")

    # Choose search method
    try:
        has_api_key = api_key or os.getenv("SERPAPI_API_KEY")
        print(f"🔧 Debug - has_api_key: {has_api_key}")
        print(f"🔧 Debug - api_key param: {api_key}")
        print(f"🔧 Debug - env SERPAPI_API_KEY: {os.getenv('SERPAPI_API_KEY')}")
        
        if has_api_key:
            print("🛰️  Using SerpAPI for search…")
            top_results = search_serpapi(search_query, api_key, site_filter)
            links_with_meta = top_results  # list of dicts with title, url
        else:
            print("🧭 Using basic Google search fallback…")
            # Try new signature; if unsupported, fall back to older 'num_results'
            try:
                # Increased pause time to avoid rate limiting
                urls = list(search(search_query, tld="com", lang="en", num=10, stop=5, pause=3.0))
                print(f"🔍 Google search returned {len(urls)} URLs")
            except TypeError:
                # Older googlesearch versions use 'num_results'
                try:
                    urls = list(search(search_query, num_results=5, pause=3.0))
                    print(f"🔍 Google search (legacy) returned {len(urls)} URLs")
                except Exception as e:
                    print(f"❌ Google search failed: {e}")
                    urls = []
            except Exception as e:
                print(f"❌ Google search failed: {e}")
                urls = []
            links_with_meta = [{"title": None, "url": url} for url in urls]
    except Exception as e:
        print(f"❌ Search failed: {e}")
        links_with_meta = []

    # If no results from primary method, try alternative approach
    if len(links_with_meta) == 0:
        print("🔄 No results from primary search, trying alternative approach...")
        try:
            # Try with different parameters
            if api_key or os.getenv("SERPAPI_API_KEY"):
                print("🛰️  Retrying SerpAPI with different parameters...")
                # Try with different country/language settings
                effective_key = api_key or os.getenv("SERPAPI_API_KEY") or os.getenv("SERPAPI_KEY")
                
                # Build search query with site filter if provided
                retry_query = search_query
                if site_filter:
                    if isinstance(site_filter, list):
                        site_domains = []
                        for site in site_filter:
                            if site.startswith('https://'):
                                domain = site.replace('https://', '').replace('http://', '').rstrip('/')
                                site_domains.append(f"site:{domain}")
                        if site_domains:
                            retry_query = f"{search_query} ({' OR '.join(site_domains)})"
                    else:
                        if site_filter.startswith('https://'):
                            domain = site_filter.replace('https://', '').replace('http://', '').rstrip('/')
                            retry_query = f"{search_query} site:{domain}"
                
                params = {
                    "engine": "google",
                    "q": retry_query,
                    "api_key": effective_key,
                    "num": 5,
                    "gl": "uk",  # Try different country
                    "hl": "en",
                }
                search_instance = GoogleSearch(params)
                results = search_instance.get_dict()
                if 'organic_results' in results:
                    organic = results.get('organic_results', [])[:5]
                    links_with_meta = []
                    for res in organic:
                        link = res.get('link') or res.get('url')
                        title = res.get('title')
                        if link:
                            links_with_meta.append({"title": title, "url": link})
                    print(f"🔄 Alternative search returned {len(links_with_meta)} results")
            else:
                print("🧭 Retrying Google search with different parameters...")
                # Try with different search parameters
                try:
                    urls = list(search(search_query, tld="co.uk", lang="en", num=5, stop=5, pause=4.0))
                    links_with_meta = [{"title": None, "url": url} for url in urls]
                    print(f"🔄 Alternative Google search returned {len(urls)} URLs")
                except Exception as e:
                    print(f"❌ Alternative Google search also failed: {e}")
        except Exception as e:
            print(f"❌ Alternative search failed: {e}")

    # If no results found from trusted sources, fallback to searching all sources
    if len(links_with_meta) == 0 and use_trusted_sources and site_filter:
        print("⚠️  No results from trusted sources. Falling back to searching all sources...")
        try:
            if api_key or os.getenv("SERPAPI_API_KEY"):
                print("🛰️  Retrying SerpAPI without trusted sources filter...")
                effective_key = api_key or os.getenv("SERPAPI_API_KEY") or os.getenv("SERPAPI_KEY")
                
                # Search without site filter
                params = {
                    "engine": "google",
                    "q": search_query,  # Original query without site filter
                    "api_key": effective_key,
                    "num": 10,
                    "gl": "us",
                    "hl": "en",
                }
                search_instance = GoogleSearch(params)
                results = search_instance.get_dict()
                
                if 'organic_results' in results:
                    organic = results.get('organic_results', [])[:5]
                    links_with_meta = []
                    for res in organic:
                        link = res.get('link') or res.get('url')
                        title = res.get('title')
                        if link:
                            links_with_meta.append({"title": title, "url": link})
                    print(f"✅ Fallback search returned {len(links_with_meta)} results from all sources")
            else:
                print("🧭 Retrying Google search without trusted sources filter...")
                try:
                    urls = list(search(search_query, tld="com", lang="en", num=10, stop=5, pause=3.0))
                    links_with_meta = [{"title": None, "url": url} for url in urls]
                    print(f"✅ Fallback Google search returned {len(urls)} URLs from all sources")
                except Exception as e:
                    print(f"❌ Fallback Google search failed: {e}")
        except Exception as e:
            print(f"❌ Fallback search failed: {e}")

    print(f"🔗 Found {len(links_with_meta)} links")
    if len(links_with_meta) == 0:
        print("⚠️  No links found. Consider retrying with a more specific query.")
        print(f"🔧 Debug - API key available: {bool(api_key or os.getenv('SERPAPI_API_KEY'))}")
        print(f"🔧 Debug - Using SerpAPI: {bool(api_key or os.getenv('SERPAPI_API_KEY'))}")

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

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

# Configure newspaper3k with a modern User-Agent and sane defaults
news_config = Config()
news_config.browser_user_agent = (
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 '
    '(KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
)
news_config.request_timeout = 10

# --- Function to search using SerpApi ---
def search_serpapi(query, api_key=None, site_filter=None):
    effective_key = (
        api_key
        or os.getenv("SERPAPI_API_KEY")
        or os.getenv("SERPAPI_KEY")
        or "e31eb0dbf79fdacef58132c6db8d929f98e1bbef3efe957b01853e2948b68083"
    )
    if not effective_key:
        raise ValueError("SERPAPI_API_KEY not provided. Set env var or pass api_key.")

    # Build search query with site filter for TRUSTED SOURCES ONLY
    search_query = query
    if site_filter and isinstance(site_filter, list):
        # Create site: filter for trusted domains
        site_domains = []
        for site in site_filter:
            if site.startswith('https://'):
                domain = site.replace('https://', '').replace('http://', '').rstrip('/')
                site_domains.append(f"site:{domain}")
        if site_domains:
            search_query = f"{query} ({' OR '.join(site_domains)})"

    params = {
        "engine": "google",
        "q": search_query,
        "api_key": effective_key,
        "num": 20,
        "gl": "us",
        "hl": "en",
    }

    try:
        print(f"🔧 SerpAPI params: {params}")
        search_instance = GoogleSearch(params)
        results = search_instance.get_dict()
        
        if 'error' in results:
            print(f"❌ SerpAPI Error: {results['error']}")
            return []
            
        organic = results.get('organic_results', [])
        print(f"🔍 SerpAPI returned {len(organic)} organic results")

        top_results = []
        for res in organic[:20]:
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

# --- Full System Workflow - VERIFIED SOURCES ONLY ---
def main_system(query, api_key=None, use_trusted_sources=True):
    print(f"\n🔎 Searching for: {query}")
    
    # Add a small random delay to prevent rapid successive requests
    delay = random.uniform(1, 3)
    print(f"⏱️  Waiting {delay:.1f}s to avoid rate limiting...")
    time.sleep(delay)
    
    search_query = query
    print(f"🔍 Using query: {search_query}")
    
    # **CRITICAL: ALWAYS search with trusted sources filter**
    print("🌐 Searching VERIFIED sources only...")

    try:
        has_api_key = api_key or os.getenv("SERPAPI_API_KEY") or os.getenv("SERPAPI_KEY")
        
        if has_api_key:
            print("🛰️  Using SerpAPI for verified sources search...")
            # **ALWAYS pass FILTERED_DOMAINS to ensure trusted sources only**
            top_results = search_serpapi(search_query, api_key, site_filter=FILTERED_DOMAINS)
            links_with_meta = top_results
        else:
            print("🧭 Using basic Google search fallback (verified sources)...")
            # For fallback, we'll manually filter after search
            try:
                urls = list(search(search_query, tld="com", lang="en", num=20, stop=20, pause=3.0))
                print(f"🔍 Google search returned {len(urls)} URLs")
            except TypeError:
                try:
                    urls = list(search(search_query, num_results=20, pause=3.0))
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

    # **RETRY LOGIC - STILL USE TRUSTED SOURCES FILTER**
    if len(links_with_meta) == 0:
        print("🔄 No results from primary search, trying alternative approach (VERIFIED SOURCES ONLY)...")
        try:
            if has_api_key:
                print("🛰️  Retrying SerpAPI with verified sources...")
                effective_key = api_key or os.getenv("SERPAPI_API_KEY") or os.getenv("SERPAPI_KEY")
                
                # **CRITICAL: Still use site filter for trusted domains**
                top_results = search_serpapi(search_query, effective_key, site_filter=FILTERED_DOMAINS)
                links_with_meta = top_results
            else:
                print("🧭 Retrying Google search with verified sources...")
                try:
                    urls = list(search(search_query, tld="co.uk", lang="en", num=20, stop=20, pause=4.0))
                    links_with_meta = [{"title": None, "url": url} for url in urls]
                    print(f"🔄 Alternative Google search returned {len(urls)} URLs")
                except Exception as e:
                    print(f"❌ Alternative Google search also failed: {e}")
        except Exception as e:
            print(f"❌ Alternative search failed: {e}")

    # **FINAL RETRY - STILL VERIFIED ONLY**
    if len(links_with_meta) == 0:
        print("⚠️  No results found. Final retry with verified sources...")
        try:
            if has_api_key:
                print("🛰️  Final retry SerpAPI (verified sources)...")
                effective_key = api_key or os.getenv("SERPAPI_API_KEY") or os.getenv("SERPAPI_KEY")
                top_results = search_serpapi(search_query, effective_key, site_filter=FILTERED_DOMAINS)
                links_with_meta = top_results
            else:
                print("🧭 Final retry Google search (verified sources)...")
                try:
                    urls = list(search(search_query, tld="com", lang="en", num=20, stop=20, pause=3.0))
                    links_with_meta = [{"title": None, "url": url} for url in urls]
                    print(f"✅ Retry search returned {len(urls)} URLs")
                except Exception as e:
                    print(f"❌ Retry Google search failed: {e}")
        except Exception as e:
            print(f"❌ Retry search failed: {e}")

    print(f"🔗 Found {len(links_with_meta)} links")

    # **FILTER: Keep ONLY verified trusted sources**
    def extract_domain(url):
        try:
            from urllib.parse import urlparse
            parsed = urlparse(url.lower())
            domain = parsed.netloc.replace("www.", "").split(":")[0]
            parts = domain.split(".")
            if len(parts) > 2:
                domain = ".".join(parts[-2:])
            return domain
        except Exception:
            return None
    
    verified_links = []
    seen_domains = set()
    
    for item in links_with_meta:
        url = item.get("url", "")
        if not url:
            continue
            
        url_lower = url.lower()
        
        # Exclude Wikipedia
        if "wikipedia.org" in url_lower or "wikipedia.com" in url_lower:
            print(f"🚫 Excluding Wikipedia: {url}")
            continue
        
        # **CRITICAL: Only keep trusted domains**
        is_verified = False
        for trusted_domain in FILTERED_DOMAINS:
            trusted_domain_clean = trusted_domain.replace("https://", "").replace("http://", "").replace("www.", "").rstrip("/")
            if trusted_domain_clean in url_lower:
                is_verified = True
                break
        
        # Skip if not verified
        if not is_verified:
            print(f"🚫 Skipping unverified source: {url}")
            continue
        
        # Check for unique domain
        domain = extract_domain(url)
        if domain and domain not in seen_domains:
            seen_domains.add(domain)
            item['verified'] = True
            item['is_trusted'] = True
            verified_links.append(item)
            if len(verified_links) >= 10:  # Max 10 verified sources
                break

    print(f"✅ Filtered to {len(verified_links)} verified sources (unique domains)")

    # **Scrape ONLY verified sources**
    results = []
    for idx, item in enumerate(verified_links, start=1):
        url = item.get("url")
        title = item.get("title")
        
        if not url:
            continue
            
        print(f"\n[{idx}/{len(verified_links)}] ▶️  Fetching VERIFIED article: {url}")
        content = extract_article_text(url)
        
        if content and len(content.strip()) > 50:
            print("  🧠 Running NER…")
            analysis = analyze_text(content)
            print(f"  🧾 Entities extracted: {len(analysis)}")
            results.append({
                "title": title,
                "url": url,
                "content": content,
                "entities": analysis,
                "verified": True,
                "is_trusted": True
            })
        else:
            print("  ⏭️  Skipped: insufficient content")

    print(f"✅ Completed. VERIFIED articles kept: {len(results)}")
    return results

if __name__ == "__main__":
    query = input("Enter a topic or question to search: ")
    api_key = input("Enter your SerpApi key (leave blank to use default GoogleSearch scraping): ").strip()
    if api_key == "":
        api_key = None

    data = main_system(query, api_key)

    print("\n📄 Related Sources and Extracted Entities:\n")
    for item in data:
        print("🔗 URL:", item["url"])
        print("---")
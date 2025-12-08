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

# --- CONFIGURATION ---
SCRAPER_CONFIG = {
    "target_articles": 5,           # Target number of articles to extract
    "max_search_results": 30,       # Increased from 20 to have more candidates
    "min_content_length": 100,      # Minimum characters (reduced from implicit 50)
    "allow_duplicate_domains": False, # Changed: Only one article per domain
    "max_articles_per_domain": 1,   # Only 1 article per domain
    "max_retry_attempts": 2,        # Number of retry attempts for failed extractions
    "retry_delay": 2.0              # Seconds to wait before retry
}

# --- Function to search using SerpApi ---
def search_serpapi(query, api_key=None, site_filter=None, num_results=20):
    effective_key = (
        api_key
        or os.getenv("SERPAPI_API_KEY")
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
        "num": num_results,
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
        print(f"📊 SerpAPI returned {len(organic)} organic results")

        top_results = []
        for res in organic[:num_results]:
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

# --- Function to scrape and extract article text with retry logic ---
def extract_article_text(url, max_retries=1):
    """Extract article text with retry logic for robustness"""
    for attempt in range(max_retries + 1):
        try:
            if attempt > 0:
                print(f"  🔄 Retry attempt {attempt}/{max_retries} for: {url}")
                time.sleep(SCRAPER_CONFIG["retry_delay"])
            
            print(f"  ⏳ Downloading: {url}")
            article = Article(url, config=news_config)
            article.download()
            article.parse()
            text = (article.text or '').strip()
            
            if not text:
                print(f"  ⚠️  No extractable text: {url}")
                if attempt < max_retries:
                    continue
                return None
            
            print(f"  ✅ Parsed ({len(text)} chars): {url}")
            return text
        except Exception as e:
            print(f"  ❌ Extract failed (attempt {attempt + 1}): {url} :: {e}")
            if attempt >= max_retries:
                import traceback
                traceback.print_exc()
                return None
    return None


def build_combined_text(url_list):
    combined = ""
    successful_extractions = 0
    for i, link in enumerate(url_list, 1):
        print(f"   [{i}/{len(url_list)}] Extracting from: {link}")
        try:
            article_text = extract_article_text(link, max_retries=SCRAPER_CONFIG["max_retry_attempts"])
            print(f"       📊 Extracted article type: {type(article_text)}, length: {len(str(article_text)) if article_text else 0}")
            
            if article_text and len(str(article_text).strip()) > SCRAPER_CONFIG["min_content_length"]:
                combined += f"\n\n[Source: {link}]\n{article_text}"
                successful_extractions += 1
                print(f"       ✅ Extracted {len(article_text)} characters")
            else:
                print(f"       ⚠️ Article too short or empty: {article_text}")
        except Exception as e:
            print(f"       ❌ Failed to extract: {type(e).__name__}: {e}")
            import traceback
            traceback.print_exc()
    
    print(f"✅ Successfully extracted from {successful_extractions}/{len(url_list)} sources")
    return combined.strip()

# --- NLP Entity Extraction ---
def analyze_text(text):
    doc = nlp(text)
    return [(ent.text, ent.label_) for ent in doc.ents]

# --- Helper function to extract domain ---
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

# --- Full System Workflow - VERIFIED SOURCES ONLY ---
def main_system(query, api_key=None, use_trusted_sources=True, target_articles=None):
    # Allow override of target articles
    if target_articles is None:
        target_articles = SCRAPER_CONFIG["target_articles"]
    
    print(f"\n🔎 Searching for: {query}")
    print(f"🎯 Target: {target_articles} articles")
    
    # Add a small random delay to prevent rapid successive requests
    delay = random.uniform(1, 3)
    print(f"⏱️  Waiting {delay:.1f}s to avoid rate limiting...")
    time.sleep(delay)
    
    search_query = query
    print(f"📝 Using query: {search_query}")
    
    # **CRITICAL: ALWAYS search with trusted sources filter**
    print("🌐 Searching VERIFIED sources only...")

    try:
        has_api_key = api_key or os.getenv("SERPAPI_API_KEY") or os.getenv("SERPAPI_KEY")
        
        if has_api_key:
            print("🛰️  Using SerpAPI for verified sources search...")
            # Fetch more results to account for failures
            top_results = search_serpapi(
                search_query, 
                api_key, 
                site_filter=FILTERED_DOMAINS,
                num_results=SCRAPER_CONFIG["max_search_results"]
            )
            links_with_meta = top_results
        else:
            print("🧭 Using basic Google search fallback (verified sources)...")
            try:
                urls = list(search(
                    search_query, 
                    tld="com", 
                    lang="en", 
                    num=SCRAPER_CONFIG["max_search_results"], 
                    stop=SCRAPER_CONFIG["max_search_results"], 
                    pause=3.0
                ))
                print(f"📊 Google search returned {len(urls)} URLs")
            except TypeError:
                try:
                    urls = list(search(
                        search_query, 
                        num_results=SCRAPER_CONFIG["max_search_results"], 
                        pause=3.0
                    ))
                    print(f"📊 Google search (legacy) returned {len(urls)} URLs")
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
                top_results = search_serpapi(
                    search_query, 
                    effective_key, 
                    site_filter=FILTERED_DOMAINS,
                    num_results=SCRAPER_CONFIG["max_search_results"]
                )
                links_with_meta = top_results
            else:
                print("🧭 Retrying Google search with verified sources...")
                try:
                    urls = list(search(
                        search_query, 
                        tld="co.uk", 
                        lang="en", 
                        num=SCRAPER_CONFIG["max_search_results"], 
                        stop=SCRAPER_CONFIG["max_search_results"], 
                        pause=4.0
                    ))
                    links_with_meta = [{"title": None, "url": url} for url in urls]
                    print(f"🔄 Alternative Google search returned {len(urls)} URLs")
                except Exception as e:
                    print(f"❌ Alternative Google search also failed: {e}")
        except Exception as e:
            print(f"❌ Alternative search failed: {e}")

    print(f"🔗 Found {len(links_with_meta)} links")

    # **FILTER: Keep ONLY verified trusted sources with unique domains**
    verified_links = []
    seen_domains = set()  # Track unique domains only
    
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
        
        # Get domain and check uniqueness
        domain = extract_domain(url)
        
        if not domain:
            print(f"⚠️  Could not extract domain from: {url}")
            continue
            
        # Only add if domain hasn't been seen before
        if domain in seen_domains:
            print(f"🚫 Skipping duplicate domain ({domain}): {url}")
            continue
        
        # Add to verified links and mark domain as seen
        seen_domains.add(domain)
        item['verified'] = True
        item['is_trusted'] = True
        item['domain'] = domain
        verified_links.append(item)
        print(f"✅ Added unique domain ({domain}): {url}")
        
        # Stop when we have enough unique domain candidates
        if len(verified_links) >= target_articles * 2:
            print(f"📦 Collected {len(verified_links)} unique domain candidates")
            break

    print(f"✅ Filtered to {len(verified_links)} verified sources with UNIQUE domains")

    # **Scrape verified sources until we reach target - ONE PER DOMAIN**
    results = []
    successful_domains = set()  # Track domains we've successfully scraped
    
    for idx, item in enumerate(verified_links, start=1):
        # Stop if we've reached our target
        if len(results) >= target_articles:
            print(f"🎯 Target of {target_articles} articles reached!")
            break
            
        url = item.get("url")
        title = item.get("title")
        domain = item.get("domain")
        
        if not url:
            continue
        
        # Double-check domain uniqueness (safety check)
        if domain in successful_domains:
            print(f"⚠️  Skipping - already have article from {domain}")
            continue
            
        print(f"\n[{idx}/{len(verified_links)}] ▶️  Fetching from {domain}: {url}")
        content = extract_article_text(url, max_retries=SCRAPER_CONFIG["max_retry_attempts"])
        
        if content and len(content.strip()) > SCRAPER_CONFIG["min_content_length"]:
            print("  🧠 Running NER…")
            analysis = analyze_text(content)
            print(f"  🧾 Entities extracted: {len(analysis)}")
            results.append({
                "title": title,
                "url": url,
                "domain": domain,
                "content": content,
                "entities": analysis,
                "verified": True,
                "is_trusted": True
            })
            successful_domains.add(domain)  # Mark this domain as successfully scraped
            print(f"  ✅ Added {domain} to results ({len(results)}/{target_articles})")
        else:
            print(f"  ⭕️  Skipped: insufficient content (min: {SCRAPER_CONFIG['min_content_length']} chars)")
            print(f"     Will try next article from different domain")

    print(f"\n{'='*60}")
    print(f"✅ Completed. VERIFIED articles kept: {len(results)}/{target_articles}")
    if len(results) < target_articles:
        print(f"⚠️  Warning: Only retrieved {len(results)} of {target_articles} target articles")
        print(f"   Reasons: extraction failures, paywalls, or insufficient verified sources")
    print(f"{'='*60}\n")
    
    return results

if __name__ == "__main__":
    query = input("Enter a topic or question to search: ")
    api_key = input("Enter your SerpApi key (leave blank to use default GoogleSearch scraping): ").strip()
    if api_key == "":
        api_key = None
    
    # Optional: Allow user to specify target number of articles
    target_input = input(f"Target number of articles (default: {SCRAPER_CONFIG['target_articles']}): ").strip()
    target_articles = int(target_input) if target_input else None

    data = main_system(query, api_key, target_articles=target_articles)

    print("\n📄 Related Sources and Extracted Entities:\n")
    for i, item in enumerate(data, 1):
        print(f"\n[Article {i}]")
        print("🔗 URL:", item["url"])
        print("🌐 Domain:", item.get("domain", "N/A"))
        print("📰 Title:", item.get("title", "N/A"))
        print("📏 Content length:", len(item["content"]), "characters")
        print("🏷️  Entities found:", len(item["entities"]))
        print("---")
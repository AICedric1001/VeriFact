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
        "num": 20,  # Request more results to ensure we get 5 unique domains
        "gl": "us",  # Country code
        "hl": "en",  # Language
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

        # Return structured results (get more to ensure unique domains)
        top_results = []
        for res in organic[:20]:  # Get up to 20 results to filter for unique domains
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
    
    # Use the original query
    search_query = query
    print(f"🔍 Using query: {search_query}")
    
    # Search ALL sources (not just trusted) to get both verified and unverified sites
    # We'll categorize them later based on FILTERED_DOMAINS
    print("🌐 Searching all sources (verified and unverified)...")

    # Choose search method - search ALL sources, not filtered
    try:
        has_api_key = api_key or os.getenv("SERPAPI_API_KEY")
        print(f"🔧 Debug - has_api_key: {has_api_key}")
        print(f"🔧 Debug - api_key param: {api_key}")
        print(f"🔧 Debug - env SERPAPI_API_KEY: {os.getenv('SERPAPI_API_KEY')}")
        
        if has_api_key:
            print("🛰️  Using SerpAPI for search (all sources)...")
            # Search WITHOUT site filter to get all sources
            top_results = search_serpapi(search_query, api_key, site_filter=None)
            links_with_meta = top_results  # list of dicts with title, url
        else:
            print("🧭 Using basic Google search fallback…")
            # Try new signature; if unsupported, fall back to older 'num_results'
            try:
                # Increased pause time to avoid rate limiting, get more results for unique domain filtering
                urls = list(search(search_query, tld="com", lang="en", num=20, stop=20, pause=3.0))
                print(f"🔍 Google search returned {len(urls)} URLs")
            except TypeError:
                # Older googlesearch versions use 'num_results'
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

    # If no results from primary method, try alternative approach
    if len(links_with_meta) == 0:
        print("🔄 No results from primary search, trying alternative approach...")
        try:
            # Try with different parameters
            if api_key or os.getenv("SERPAPI_API_KEY"):
                print("🛰️  Retrying SerpAPI with different parameters...")
                # Try with different country/language settings
                effective_key = api_key or os.getenv("SERPAPI_API_KEY") or os.getenv("SERPAPI_KEY")
                
                # Use original query without site filter
                params = {
                    "engine": "google",
                    "q": search_query,
                    "api_key": effective_key,
                    "num": 20,  # Request more results for unique domain filtering
                    "gl": "uk",  # Try different country
                    "hl": "en",
                }
                search_instance = GoogleSearch(params)
                results = search_instance.get_dict()
                if 'organic_results' in results:
                    organic = results.get('organic_results', [])[:20]
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
                    urls = list(search(search_query, tld="co.uk", lang="en", num=20, stop=20, pause=4.0))
                    links_with_meta = [{"title": None, "url": url} for url in urls]
                    print(f"🔄 Alternative Google search returned {len(urls)} URLs")
                except Exception as e:
                    print(f"❌ Alternative Google search also failed: {e}")
        except Exception as e:
            print(f"❌ Alternative search failed: {e}")

    # If still no results, try one more time without any filters
    if len(links_with_meta) == 0:
        print("⚠️  No results found. Retrying search...")
        try:
            if api_key or os.getenv("SERPAPI_API_KEY"):
                print("🛰️  Retrying SerpAPI...")
                effective_key = api_key or os.getenv("SERPAPI_API_KEY") or os.getenv("SERPAPI_KEY")
                
                params = {
                    "engine": "google",
                    "q": search_query,
                    "api_key": effective_key,
                    "num": 20,
                    "gl": "us",
                    "hl": "en",
                }
                search_instance = GoogleSearch(params)
                results = search_instance.get_dict()
                
                if 'organic_results' in results:
                    organic = results.get('organic_results', [])[:20]
                    links_with_meta = []
                    for res in organic:
                        link = res.get('link') or res.get('url')
                        title = res.get('title')
                        if link:
                            links_with_meta.append({"title": title, "url": link})
                    print(f"✅ Retry search returned {len(links_with_meta)} results")
            else:
                print("🧭 Retrying Google search...")
                try:
                    urls = list(search(search_query, tld="com", lang="en", num=20, stop=20, pause=3.0))
                    links_with_meta = [{"title": None, "url": url} for url in urls]
                    print(f"✅ Retry Google search returned {len(urls)} URLs")
                except Exception as e:
                    print(f"❌ Retry Google search failed: {e}")
        except Exception as e:
            print(f"❌ Retry search failed: {e}")

    print(f"🔗 Found {len(links_with_meta)} links")
    if len(links_with_meta) == 0:
        print("⚠️  No links found. Consider retrying with a more specific query.")
        print(f"🔧 Debug - API key available: {bool(api_key or os.getenv('SERPAPI_API_KEY'))}")
        print(f"🔧 Debug - Using SerpAPI: {bool(api_key or os.getenv('SERPAPI_API_KEY'))}")

    # Filter out Wikipedia and ensure unique domains (one result per site)
    def extract_domain(url):
        """Extract the main domain from a URL"""
        try:
            from urllib.parse import urlparse
            parsed = urlparse(url.lower())
            domain = parsed.netloc.replace("www.", "").split(":")[0]
            # Remove subdomains that aren't www (e.g., news.rappler.com -> rappler.com)
            parts = domain.split(".")
            if len(parts) > 2:
                # Check if it's a known subdomain pattern or keep the main domain
                # For now, keep the last two parts (e.g., rappler.com)
                domain = ".".join(parts[-2:])
            return domain
        except Exception:
            return None
    
    filtered_links = []
    seen_domains = set()
    trusted_links = []
    other_links = []
    
    # First pass: separate trusted and other sources
    for item in links_with_meta:
        url = item.get("url", "")
        if not url:
            continue
            
        url_lower = url.lower()
        # Exclude Wikipedia
        if "wikipedia.org" in url_lower or "wikipedia.com" in url_lower:
            print(f"🚫 Excluding Wikipedia: {url}")
            continue
        
        # Extract domain
        domain = extract_domain(url)
        if not domain:
            continue
        
        # Check if it's a trusted source
        is_trusted = False
        for trusted_domain in FILTERED_DOMAINS:
            trusted_domain_clean = trusted_domain.replace("https://", "").replace("http://", "").replace("www.", "").rstrip("/")
            if trusted_domain_clean in url_lower:
                is_trusted = True
                break
        
        # Add domain info to item for later use
        item_with_domain = item.copy()
        item_with_domain['_domain'] = domain
        item_with_domain['_is_trusted'] = is_trusted
        
        if is_trusted:
            trusted_links.append(item_with_domain)
        else:
            other_links.append(item_with_domain)
    
    print(f"📊 Found {len(trusted_links)} trusted links and {len(other_links)} unverified links")
    
    # Second pass: select unique domains, prioritizing trusted sources but including unverified
    # First, add trusted sources (one per domain) - get up to 5 verified
    for item in trusted_links:
        domain = item.get('_domain')
        if domain and domain not in seen_domains:
            seen_domains.add(domain)
            # Keep verification status, remove internal tracking field
            is_trusted = item.get('_is_trusted', False)
            item.pop('_domain', None)
            item.pop('_is_trusted', None)
            item['verified'] = True  # Mark as verified
            item['is_trusted'] = is_trusted  # Keep for backward compatibility
            filtered_links.append(item)
            if len([x for x in filtered_links if x.get('verified')]) >= 5:
                break  # Stop when we have 5 verified sources
    
    # Then, add unverified sources (one per domain) - get up to 5 more (10 total)
    for item in other_links:
        domain = item.get('_domain')
        if domain and domain not in seen_domains:
            seen_domains.add(domain)
            # Mark as unverified
            item.pop('_domain', None)
            item.pop('_is_trusted', None)
            item['verified'] = False  # Mark as unverified
            item['is_trusted'] = False
            filtered_links.append(item)
            if len(filtered_links) >= 10:  # Get up to 10 total (5 verified + 5 unverified)
                break
    
    verified_count = len([x for x in filtered_links if x.get('verified')])
    unverified_count = len([x for x in filtered_links if not x.get('verified')])
    print(f"✅ Filtered to {len(filtered_links)} unique domain links ({verified_count} verified, {unverified_count} unverified)")

    results = []
    for idx, item in enumerate(filtered_links, start=1):
        url = item.get("url")
        title = item.get("title")
        verified = item.get("verified", False)
        if not url:
            continue
        status = "✅ Verified" if verified else "⚠️  Unverified"
        print(f"\n[{idx}/{len(filtered_links)}] ▶️  Fetching article {status}: {url}")
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
                "verified": verified,  # Add verification status
                "is_trusted": item.get("is_trusted", verified)  # Backward compatibility
            })
        else:
            print("  ⏭️  Skipped: insufficient content")

    verified_results = len([r for r in results if r.get('verified')])
    unverified_results = len([r for r in results if not r.get('verified')])
    print(f"✅ Completed. Articles kept: {len(results)} ({verified_results} verified, {unverified_results} unverified)")
    # Return all results (both verified and unverified)
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
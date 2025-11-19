import os
import sys

try:
    from dotenv import load_dotenv
    load_dotenv()
except Exception:
    pass

from scraper import main_system

# Hardcoded fallback for testing only
SERPAPI_FALLBACK_KEY = "4d66b06242419175b6cb80a5f445bf8e5c71a35c22d9a4c2da3ba22956aed69a"


def main():
    if len(sys.argv) > 1:
        query = " ".join(sys.argv[1:]).strip()
    else:
        query = input("Enter a topic or question to search: ").strip()

    serpapi_key = os.getenv("SERPAPI_API_KEY") or SERPAPI_FALLBACK_KEY
    if os.getenv("SERPAPI_API_KEY"):
        print("🔑 SERPAPI_API_KEY detected. Will use SerpAPI for search.")
    elif SERPAPI_FALLBACK_KEY:
        print("🔑 Using test fallback SerpAPI key.")
    else:
        print("⚠️  No SerpAPI key available. Using basic fallback search.")

    print(f"\n🔎 Searching for: {query}")
    try:
        results = main_system(query, serpapi_key)
    except Exception as e:
        print(f"❌ Error during scrape: {e}")
        sys.exit(1)

    print(f"\n✅ Completed. Results: {len(results)}\n")
    for i, item in enumerate(results, start=1):
        title = item.get("title") or "(no title)"
        url = item.get("url") or "(no url)"
        content = item.get("content") or ""
        entities = item.get("entities") or []
        print(f"[{i}] {title}")
        print(f"    URL: {url}")
        print(f"    Content length: {len(content)} characters")
        print(f"    Entities: {len(entities)}")
        print("-")


if __name__ == "__main__":
    main()



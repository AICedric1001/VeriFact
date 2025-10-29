from scraper import search_serpapi, extract_article_text
from gemini import summarize_with_gemini
from trusted_sources import FILTERED_DOMAINS

def generate_summary_from_text(post_text, serpapi_key=None):
    print(f"📨 Running summary on: {post_text}")

    links = search_serpapi(post_text, serpapi_key)
    # Normalize to a list of URL strings in case search_serpapi returns dicts
    urls = []
    for item in links or []:
        if isinstance(item, dict):
            url = item.get('url')
            if url:
                urls.append(url)
        elif isinstance(item, str):
            urls.append(item)

    trusted_links = [url for url in urls if any(domain in url for domain in FILTERED_DOMAINS)]
    unverified_links = [url for url in urls if url not in trusted_links]

    # Limit to top 5
    trusted_links = trusted_links[:5]
    unverified_links = unverified_links[:5]

    def build_combined_text(url_list):
        combined = ""
        for link in url_list:
            try:
                article = extract_article_text(link)
            except Exception:
                article = None
            if article:
                combined += f"\n\n[Source: {link}]\n{article}"
        return combined.strip()

    if trusted_links:
        combined_text = build_combined_text(trusted_links)
        if not combined_text:
            summary = "⚠️ Could not extract text from trusted sources."
        else:
            summary = summarize_with_gemini(combined_text)
    elif unverified_links:
        combined_text = build_combined_text(unverified_links)
        if not combined_text:
            summary = "⚠️ No readable content from unverified links."
        else:
            summary = "⚠️ Summarized from unverified sources:\n\n" + summarize_with_gemini(combined_text)
    else:
        summary = "❌ No results found from search."

    return {
        "summary": summary,
        "trusted_sources": trusted_links,
        "unverified_sources": unverified_links
    }

if __name__ == "__main__":
    test_text = "Misinformation during the 2022 Philippine elections"
    output = generate_summary_from_text(test_text)
    print("\n🧠 AI Summary:\n", output["summary"])
    print("\n🔗 Sources:")
    for link in output["sources"]:
        print(" -", link)

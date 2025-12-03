from scraper import search_serpapi, extract_article_text
from gemini import summarize_with_gemini, respond_with_gemini
from trusted_sources import FILTERED_DOMAINS

def generate_summary_from_text(post_text, serpapi_key=None):
    print(f"📨 Running summary on: {post_text}")

    links = search_serpapi(post_text, serpapi_key)
    HARMFUL_DOMAIN_BLOCKLIST = ['malicious-site.com', 'illegal-forum.net', 'extreme-content.org']
    # Normalize to a list of URL strings in case search_serpapi returns dicts
    urls = []
    for item in links or []:
        if isinstance(item, dict):
            url = item.get('url')
            if url:
                urls.append(url)
        elif isinstance(item, str):
            urls.append(item)
        
    safe_urls = []
    for url in urls:
        is_blocked = False
        for blocked_domain in HARMFUL_DOMAIN_BLOCKLIST:
            if blocked_domain in url:
                print(f"🚫 Blocked URL due to domain blocklist: {url}")
                is_blocked = True
                break
        if not is_blocked:
            safe_urls.append(url)

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


def generate_followup_reply(followup_prompt, context_summary=None, sources=None, metrics=None):
    """Use Gemini to craft a follow-up response grounded on stored context."""
    context_blocks = []
    if context_summary:
        context_blocks.append(f"Stored summary:\n{context_summary.strip()}")

    if sources:
        formatted_sources = []
        for src in sources[:5]:
            title = src.get('title') or 'Untitled source'
            url = src.get('url') or ''
            trust_flag = 'trusted' if src.get('is_trusted') else 'unverified'
            formatted_sources.append(f"- {title} ({trust_flag}) {url}")
        if formatted_sources:
            context_blocks.append("Key sources:\n" + "\n".join(formatted_sources))

    if metrics:
        context_blocks.append(
            f"Credibility score: {metrics.get('true_percent', 0)}% "
            f"based on {metrics.get('trusted_count', 0)} trusted sources out of "
            f"{metrics.get('total_count', 0)} total references."
        )

    context_text = "\n\n".join(context_blocks).strip() or "No reliable summary was stored."

    prompt = (
        "You are VeriFact, a fact-checking assistant. Use the provided context to answer the user's follow-up.\n"
        "If the answer cannot be derived from the context, clearly state the limitation and suggest the user rerun a fresh search.\n\n"
        f"Context:\n{context_text}\n\n"
        f"User follow-up prompt:\n{followup_prompt}\n\n"
        "Respond in a concise paragraph (max 180 words), referencing any relevant sources by name when possible."
    )

    return respond_with_gemini(prompt)

if __name__ == "__main__":
    test_text = "Misinformation during the 2022 Philippine elections"
    output = generate_summary_from_text(test_text)
    print("\n🧠 AI Summary:\n", output["summary"])
    print("\n🔗 Sources:")
    for link in output["sources"]:
        print(" -", link)

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

    # Handle case where no links found at all
    if not trusted_links and not unverified_links:
        summary = "❌ No available sources found at this time. Please try refining your search query or check back later."
        return {
            "summary": summary,
            "trusted_sources": [],
            "unverified_sources": []
        }

    if trusted_links:
        combined_text = build_combined_text(trusted_links)
        if not combined_text:
            summary = "⚠️ Could not extract text from trusted sources."
        else:
            # Enhanced prompt with relevance checking
            summary = check_relevance_and_summarize(post_text, combined_text)
    elif unverified_links:
        combined_text = build_combined_text(unverified_links)
        if not combined_text:
            summary = "⚠️ No readable content from unverified links."
        else:
            # Enhanced prompt with relevance checking
            relevance_summary = check_relevance_and_summarize(post_text, combined_text)
            summary = "Summarized from verified sources:\n\n" + relevance_summary
    else:
        summary = "❌ No available sources found at this time. Please try refining your search query or check back later."

    return {
        "summary": summary,
        "trusted_sources": trusted_links,
        "unverified_sources": unverified_links
    }


def check_relevance_and_summarize(query, combined_text):
    """
    Check if the sources are relevant to the query before summarizing.
    Returns appropriate message if irrelevant or no sources.
    """
    if not combined_text or len(combined_text.strip()) < 100:
        return "❌ No available sources found at this time. Please try a different search query."
    
    # Extract key intent from query (looking for specific claims)
    query_lower = query.lower()
    is_asking_about_royalty = any(word in query_lower for word in ['king', 'queen', 'prince', 'princess', 'royal', 'royalty', 'throne', 'monarch', 'ruler'])
    is_asking_about_position = any(word in query_lower for word in ['president', 'mayor', 'governor', 'senator', 'ceo', 'director', 'chairman'])
    is_asking_about_event = any(word in query_lower for word in ['what happened', 'incident', 'event', 'disaster', 'crisis'])
    
    # Enhanced prompt with stricter relevance checking
    relevance_prompt = (
        "You are VeriFact, a fact-checking assistant. "
        "Determine whether the search results below actually answer the user's specific question.\n\n"
        f"User Query: \"{query}\"\n\n"
        f"Search Results:\n{combined_text}\n\n"
        "Relevance Rules:\n"
        "1. Topic & Context Match Required\n"
        "   - The result must confirm the same subject **and** the same claim or role.\n"
        "   - Similar names, related events, or partial matches are insufficient.\n"
        "2. Evidence Standards\n"
        "   - Acceptable: direct confirmation, direct denial, or clear supporting data.\n"
        "   - Not acceptable: mere mentions, tangential discussions, or keyword overlap.\n"
        "3. Response Format\n"
        "   A) No supporting evidence →\n"
        "      'The sources do not confirm the specific claim. "
        "      They mention related topics but not the exact information requested.'\n"
        "   B) No relevant results at all →\n"
        "      'No sources found for this query. Try re-phrasing or checking spelling.'\n"
        "   C) Evidence exists →\n"
        "      Supply a 2–3 paragraph factual summary that states only what the sources verify.\n"
        "Your response:"
    )
    
    try:
        response = summarize_with_gemini(relevance_prompt)
        return response.strip()
    except Exception as e:
        print(f"❌ Gemini relevance check error: {e}")
        return "⚠️ Failed to generate summary. Please try again."


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
    for link in output["trusted_sources"]:
        print(" -", link)

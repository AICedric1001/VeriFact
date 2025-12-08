from scraper import main_system, extract_article_text
from gemini import summarize_with_gemini, respond_with_gemini
from trusted_sources import FILTERED_DOMAINS

def generate_summary_from_text(post_text, serpapi_key=None):
    print(f"📨 Running summary on: {post_text}")

    # Use main_system() instead - it returns full article data
    articles = main_system(post_text, api_key=serpapi_key)
    print(f"🔗 Found {len(articles)} verified articles")
    
    if not articles:
        summary = "❌ No available sources found at this time. Please try refining your search query or check back later."
        return {
            "summary": summary,
            "trusted_sources": [],
            "show_sources": False,
            "show_chart": False,
        }

    # Extract URLs and combine content
    trusted_links = [article["url"] for article in articles]
    
    def build_combined_text(article_list):
        combined = ""
        for article in article_list:
            combined += f"\n\n[Source: {article['url']}]\n{article['content']}"
        return combined.strip()

    combined_text = build_combined_text(articles)
    print(f"📄 Combined text length: {len(combined_text)} characters")
    
    if not combined_text or len(combined_text.strip()) < 100:
        summary = "⚠️ Could not extract sufficient text from trusted sources."
        return {
            "summary": summary,
            "trusted_sources": [],
            "show_sources": False,
            "show_chart": False,
        }
    
    summary = check_relevance_and_summarize(post_text, combined_text, source_urls=trusted_links)

    return {
        "summary": summary,
        "trusted_sources": trusted_links,
        "article_count": len(articles),
        "coverage_count": len(articles),
        "show_sources": True,
        "show_chart": True,
    }


def check_relevance_and_summarize(query, combined_text, source_urls=None):
    """
    Check if the sources are relevant to the query before summarizing.
    
    Args:
        query: User's search query
        combined_text: Combined text from all sources
        source_urls: List of source URLs that contributed to combined_text
    """
    if not combined_text or len(combined_text.strip()) < 100:
        return "❌ No available sources found at this time. Please try a different search query."
    
    # Validate sources are from trusted domains
    if source_urls:
        invalid_sources = [url for url in source_urls if not any(domain in url for domain in FILTERED_DOMAINS)]
        if invalid_sources:
            print(f"⚠️ Warning: Found untrusted sources in combined text: {invalid_sources}")
    
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
        "Respond in a SINGLE concise paragraph (max 180 words), with no line breaks or bullet points. "
        "Reference any relevant sources by name when possible. Do not use numbered lists or subheadings."
    )

    return respond_with_gemini(prompt)


if __name__ == "__main__":
    test_text = "Misinformation during the 2022 Philippine elections"
    output = generate_summary_from_text(test_text)
    print("\n🧠 AI Summary:\n", output["summary"])
    print("\n🔗 Sources:")
    for link in output["trusted_sources"]:
        print(" -", link)

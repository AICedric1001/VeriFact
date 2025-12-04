# harmful_content_filter.py
"""
Multi-layered content filtering system for VeriFact
Prevents scraping and summarization of harmful content
"""

import re
from typing import List, Dict, Tuple

# Category-based harmful content keywords
HARMFUL_KEYWORDS = {
    'violence': [
        'murder', 'kill', 'bomb', 'weapon', 'explosive', 'terrorism', 
        'mass shooting', 'assassination', 'torture', 'massacre'
    ],
    'hate_speech': [
        'racial slur', 'ethnic cleansing', 'genocide', 'supremacy',
        'hate group', 'discrimination', 'bigotry'
    ],
    'sexual_content': [
        'pornography', 'explicit content', 'sexual abuse', 'child exploitation',
        'revenge porn', 'sex trafficking'
    ],
    'illegal_activity': [
        'drug trafficking', 'human trafficking', 'money laundering',
        'fraud scheme', 'counterfeit', 'illegal weapons'
    ],
    'self_harm': [
        'suicide method', 'self-harm technique', 'how to overdose',
        'cutting tutorial', 'suicide pact'
    ],
    'dangerous_medical': [
        'miracle cure', 'cancer cure hoax', 'vaccine conspiracy',
        'fake treatment', 'dangerous remedy', 'unproven cure'
    ]
}

# High-priority blocking patterns (regex)
HARMFUL_PATTERNS = [
    r'\bhow\s+to\s+(make|build|create)\s+(bomb|explosive|weapon)\b',
    r'\bstep\s+by\s+step\s+(suicide|self[\s-]harm)\b',
    r'\b(buy|purchase|obtain)\s+(illegal\s+)?(drugs|weapons|explosives)\b',
    r'\b(child|minor)\s+(abuse|exploitation|pornography)\b',
    r'\b(fake|forged)\s+(id|passport|document)\b'
]

# Domain blacklist - known harmful sources
BLOCKED_DOMAINS = [
    'example-hate-site.com',
    'illegal-marketplace.onion',
    'extremist-forum.net',
    # Add more as needed
]

class HarmfulContentFilter:
    """
    Comprehensive content filter to detect and block harmful content
    before scraping or summarization
    """
    
    def __init__(self):
        self.keywords = HARMFUL_KEYWORDS
        self.patterns = [re.compile(pattern, re.IGNORECASE) for pattern in HARMFUL_PATTERNS]
        self.blocked_domains = BLOCKED_DOMAINS
        
    def check_query(self, query: str) -> Tuple[bool, str, List[str]]:
        """
        Check if a search query contains harmful content
        
        Args:
            query: The user's search query
            
        Returns:
            (is_harmful, category, matched_keywords)
        """
        if not query or not query.strip():
            return False, '', []
        
        query_lower = query.lower()
        matched_keywords = []
        
        # Check keyword categories
        for category, keywords in self.keywords.items():
            for keyword in keywords:
                if keyword.lower() in query_lower:
                    matched_keywords.append(keyword)
                    return True, category, matched_keywords
        
        # Check harmful patterns
        for pattern in self.patterns:
            if pattern.search(query):
                matched_keywords.append(pattern.pattern)
                return True, 'harmful_pattern', matched_keywords
        
        return False, '', []
    
    def check_url(self, url: str) -> Tuple[bool, str]:
        """
        Check if a URL is from a blocked domain
        
        Args:
            url: The URL to check
            
        Returns:
            (is_blocked, reason)
        """
        if not url:
            return False, ''
        
        url_lower = url.lower()
        
        for domain in self.blocked_domains:
            if domain in url_lower:
                return True, f'Blocked domain: {domain}'
        
        return False, ''
    
    def check_content(self, content: str, threshold: int = 3) -> Tuple[bool, str, List[str]]:
        """
        Check if scraped content contains harmful material
        
        Args:
            content: The scraped text content
            threshold: Number of keyword matches to trigger blocking
            
        Returns:
            (is_harmful, category, matched_keywords)
        """
        if not content or not content.strip():
            return False, '', []
        
        content_lower = content.lower()
        all_matches = []
        category_counts = {cat: 0 for cat in self.keywords.keys()}
        
        # Count matches by category
        for category, keywords in self.keywords.items():
            for keyword in keywords:
                if keyword.lower() in content_lower:
                    all_matches.append(keyword)
                    category_counts[category] += 1
        
        # Check if any category exceeds threshold
        for category, count in category_counts.items():
            if count >= threshold:
                return True, category, all_matches[:5]  # Return first 5 matches
        
        # Check harmful patterns
        for pattern in self.patterns:
            if pattern.search(content):
                all_matches.append(pattern.pattern)
                return True, 'harmful_pattern', all_matches[:5]
        
        return False, '', []
    
    def get_safe_response(self, category: str) -> str:
        """
        Generate a safe response message based on the harmful content category
        
        Args:
            category: The category of harmful content detected
            
        Returns:
            A user-friendly message
        """
        messages = {
            'violence': '⚠️ This query relates to violent content. VeriFact cannot process requests related to violence or harm.',
            'hate_speech': '⚠️ This query contains hate speech. VeriFact promotes respectful discourse and cannot process this request.',
            'sexual_content': '⚠️ This query relates to inappropriate sexual content. VeriFact cannot process such requests.',
            'illegal_activity': '⚠️ This query relates to illegal activities. VeriFact cannot provide information on illegal matters.',
            'self_harm': '⚠️ If you\'re experiencing thoughts of self-harm, please contact a crisis helpline immediately. VeriFact cannot process this request.',
            'dangerous_medical': '⚠️ This query relates to unverified medical information. Please consult a licensed healthcare professional.',
            'harmful_pattern': '⚠️ This query contains harmful content patterns. VeriFact cannot process this request.',
            'default': '⚠️ This query contains content that violates our safety guidelines. Please rephrase your question.'
        }
        
        return messages.get(category, messages['default'])


# Global filter instance
content_filter = HarmfulContentFilter()


# Convenience functions for easy import
def is_query_safe(query: str) -> Tuple[bool, str]:
    """
    Quick check if a query is safe to process
    
    Returns:
        (is_safe, reason)
    """
    is_harmful, category, matches = content_filter.check_query(query)
    if is_harmful:
        return False, content_filter.get_safe_response(category)
    return True, ''


def is_url_safe(url: str) -> Tuple[bool, str]:
    """
    Quick check if a URL is safe to scrape
    
    Returns:
        (is_safe, reason)
    """
    is_blocked, reason = content_filter.check_url(url)
    if is_blocked:
        return False, reason
    return True, ''


def is_content_safe(content: str) -> Tuple[bool, str]:
    """
    Quick check if content is safe to summarize
    
    Returns:
        (is_safe, reason)
    """
    is_harmful, category, matches = content_filter.check_content(content)
    if is_harmful:
        return False, content_filter.get_safe_response(category)
    return True, ''
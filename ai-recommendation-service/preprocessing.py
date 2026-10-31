"""
Text Preprocessing Module for AI Book Recommendation System
Cleans, normalizes, and combines book features for vectorization.
"""

import re
import string

STOPWORDS = {
    "a", "about", "above", "after", "again", "against", "all", "am", "an", "and", "any", "are", "aren't",
    "as", "at", "be", "because", "been", "before", "being", "below", "between", "both", "but", "by",
    "can't", "cannot", "could", "couldn't", "did", "didn't", "do", "does", "doesn't", "doing", "don't",
    "down", "during", "each", "few", "for", "from", "further", "had", "hadn't", "has", "hasn't", "have",
    "haven't", "having", "he", "he'd", "he'll", "he's", "her", "here", "here's", "hers", "herself", "him",
    "himself", "his", "how", "how's", "i", "i'd", "i'll", "i'm", "i've", "if", "in", "into", "is", "isn't",
    "it", "it's", "its", "itself", "let's", "me", "more", "most", "mustn't", "my", "myself", "no", "nor",
    "not", "of", "off", "on", "once", "only", "or", "other", "ought", "our", "ours", "ourselves", "out",
    "over", "own", "same", "shan't", "she", "she'd", "she'll", "she's", "should", "shouldn't", "so", "some",
    "such", "than", "that", "that's", "the", "their", "theirs", "them", "themselves", "then", "there",
    "there's", "these", "they", "they'd", "they'll", "they're", "they've", "this", "those", "through", "to",
    "too", "under", "until", "up", "very", "was", "wasn't", "we", "we'd", "we'll", "we're", "we've", "were",
    "weren't", "what", "what's", "when", "when's", "where", "where's", "which", "while", "who", "who's",
    "whom", "why", "why's", "with", "won't", "would", "wouldn't", "you", "you'd", "you'll", "you're", "you've",
    "your", "yours", "yourself", "yourselves"
}

def clean_text(text: str) -> str:
    """
    Lowercase conversion, strip punctuation, remove numbers/symbols, filter stopwords.
    """
    if not text:
        return ""
    text = text.lower()
    # Remove URLs and email addresses
    text = re.sub(r"http\S+|www\S+|https\S+", "", text, flags=re.MULTILINE)
    # Remove punctuation and special characters
    text = text.translate(str.maketrans("", "", string.punctuation))
    # Remove numbers
    text = re.sub(r"\d+", "", text)
    # Tokenize and remove stopwords
    tokens = [word for word in text.split() if word not in STOPWORDS and len(word) > 2]
    return " ".join(tokens)

def build_combined_features(book: dict) -> str:
    """
    Combine title, author, genre, category, and description into unified feature text.
    Authors and genres are weighted by repetition for stronger cosine similarity.
    """
    title = book.get("title", "")
    author = book.get("author", "")
    genre = book.get("genre", "")
    category = book.get("category", "")
    description = book.get("description", "")

    # Clean individual components
    c_title = clean_text(title)
    c_author = clean_text(author)
    c_genre = clean_text(genre)
    c_cat = clean_text(category)
    c_desc = clean_text(description)

    # Feature weighting: genre and category repeated for emphasis
    combined = f"{c_title} {c_genre} {c_genre} {c_cat} {c_cat} {c_author} {c_author} {c_desc}"
    return combined.strip()

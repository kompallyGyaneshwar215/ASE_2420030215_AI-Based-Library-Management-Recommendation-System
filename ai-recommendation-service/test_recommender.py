"""
Unit and Integration Test Suite for AI Recommendation Engine
Tests preprocessing, TF-IDF vectorization, Cosine similarity, and personalized recommendations.
"""

import unittest
import os
import sys

# Ensure current directory is in path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from preprocessing import clean_text, build_combined_features
from recommender import BookRecommender, PurePythonTfidf


class TestPreprocessing(unittest.TestCase):

    def test_clean_text(self):
        sample = "Artificial Intelligence: A Modern Approach (4th Edition) by Stuart Russell!"
        cleaned = clean_text(sample)
        # Should be lowercase, punctuation removed, stopwords stripped
        self.assertNotIn("!", cleaned)
        self.assertNotIn(":", cleaned)
        self.assertIn("artificial", cleaned)
        self.assertIn("intelligence", cleaned)
        self.assertIn("modern", cleaned)
        self.assertIn("approach", cleaned)

    def test_build_combined_features(self):
        book = {
            "title": "Clean Code",
            "author": "Robert C. Martin",
            "genre": "Software Engineering",
            "category": "Software Engineering",
            "description": "Craftsmanship and agile design patterns."
        }
        features = build_combined_features(book)
        self.assertIn("clean", features)
        self.assertIn("code", features)
        self.assertIn("software", features)
        self.assertIn("martin", features)


class TestPurePythonTfidf(unittest.TestCase):

    def test_tfidf_and_cosine_similarity(self):
        docs = [
            "artificial intelligence machine learning deep neural networks",
            "deep learning neural networks backpropagation algorithms",
            "discrete mathematics graph theory linear algebra combinatorics"
        ]
        tfidf = PurePythonTfidf()
        vectors = tfidf.fit_transform(docs)
        self.assertEqual(len(vectors), 3)

        # Doc 0 and Doc 1 share deep neural networks -> high similarity
        sim_0_1 = PurePythonTfidf.cosine_similarity(vectors[0], vectors[1])
        # Doc 0 and Doc 2 share almost nothing -> low similarity
        sim_0_2 = PurePythonTfidf.cosine_similarity(vectors[0], vectors[2])

        self.assertGreater(sim_0_1, sim_0_2, "ML docs should have higher cosine similarity than math doc")
        self.assertGreater(sim_0_1, 0.2)


class TestBookRecommender(unittest.TestCase):

    @classmethod
    def setUpClass(cls):
        cls.recommender = BookRecommender()

    def test_catalog_loaded(self):
        self.assertGreaterEqual(len(self.recommender.books), 10, "Should load at least 10 seed books")

    def test_similar_books(self):
        # Book 1: Artificial Intelligence: A Modern Approach
        similar = self.recommender.get_similar_books(book_id=1, top_n=3)
        self.assertTrue(len(similar) > 0)
        self.assertNotEqual(similar[0]["bookId"], 1, "Should not recommend the target book itself")
        self.assertTrue(50 <= similar[0]["similarityScore"] <= 100)
        self.assertIn("reason", similar[0])

    def test_personalized_recommendations(self):
        # User who borrowed AI books (id 1, 4) and prefers Machine Learning
        recs = self.recommender.get_personalized_recommendations(
            borrowed_ids=[1, 4],
            preferred_genres=["Machine Learning"],
            favorite_authors=["Stuart Russell"],
            limit=4
        )
        self.assertTrue(len(recs) > 0)
        rec_ids = [r["bookId"] for r in recs]
        self.assertNotIn(1, rec_ids, "Should exclude already borrowed book 1")
        self.assertNotIn(4, rec_ids, "Should exclude already borrowed book 4")
        self.assertTrue(any("Machine Learning" in r["reason"] or "Artificial" in r["reason"] for r in recs))

    def test_cold_start_popular_fallback(self):
        # User with no history and no preferences
        popular = self.recommender.get_popular_books(limit=4)
        self.assertEqual(len(popular), 4)
        self.assertGreater(popular[0]["similarityScore"], 90.0)


if __name__ == "__main__":
    unittest.main()

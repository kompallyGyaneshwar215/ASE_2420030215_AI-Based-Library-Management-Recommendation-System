"""
FastAPI AI Book Recommendation Service
Integrates with Spring Boot backend to deliver real-time machine learning recommendations.
"""

import sys
import os
from typing import List, Optional
from recommender import BookRecommender

# Initialize recommender engine
recommender = BookRecommender()

try:
    from fastapi import FastAPI, HTTPException, Query
    from fastapi.middleware.cors import CORSMiddleware
    from pydantic import BaseModel

    app = FastAPI(
        title="AI Library Book Recommendation API",
        description="Machine Learning service providing TF-IDF & Cosine Similarity Book Recommendations",
        version="1.0.0"
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    class PersonalizedRecommendationRequest(BaseModel):
        userId: Optional[int] = None
        borrowedBookIds: List[int] = []
        preferredGenres: List[str] = []
        favoriteAuthors: List[str] = []
        limit: Optional[int] = 6

    @app.get("/health")
    def health_check():
        return {
            "status": "UP",
            "service": "AI Book Recommendation Engine",
            "books_indexed": len(recommender.books),
            "algorithm": "TF-IDF Vectorization & Cosine Similarity"
        }

    @app.post("/api/recommendations/personalized")
    def get_personalized_recommendations(payload: PersonalizedRecommendationRequest):
        results = recommender.get_personalized_recommendations(
            borrowed_ids=payload.borrowedBookIds,
            preferred_genres=payload.preferredGenres,
            favorite_authors=payload.favoriteAuthors,
            limit=payload.limit or 6
        )
        return results

    @app.get("/api/recommendations/similar/{book_id}")
    def get_similar_books(book_id: int, limit: int = Query(5, ge=1, le=20)):
        results = recommender.get_similar_books(book_id=book_id, top_n=limit)
        return results

    @app.get("/api/recommendations/popular")
    def get_popular_books(limit: int = Query(6, ge=1, le=20)):
        return recommender.get_popular_books(limit=limit)

    @app.get("/api/recommendations/genres/{genre}")
    def get_genre_recommendations(genre: str, limit: int = Query(6, ge=1, le=20)):
        return recommender.get_genre_recommendations(genre_name=genre, limit=limit)

except ImportError:
    # Resilient built-in standard library HTTP server fallback if FastAPI is not yet installed
    from http.server import HTTPServer, BaseHTTPRequestHandler
    import json
    import urllib.parse

    class SimpleAIHandler(BaseHTTPRequestHandler):
        def _set_headers(self, status=200):
            self.send_response(status)
            self.send_header("Content-type", "application/json")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
            self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization")
            self.end_headers()

        def do_OPTIONS(self):
            self._set_headers(200)

        def do_GET(self):
            parsed = urllib.parse.urlparse(self.path)
            path = parsed.path
            params = urllib.parse.parse_qs(parsed.query)
            limit = int(params.get("limit", [6])[0])

            if path == "/health":
                self._set_headers(200)
                self.wfile.write(json.dumps({
                    "status": "UP",
                    "books_indexed": len(recommender.books),
                    "algorithm": "Pure Python TF-IDF Cosine Similarity"
                }).encode("utf-8"))
            elif path.startswith("/api/recommendations/similar/"):
                parts = path.split("/")
                book_id = int(parts[-1])
                res = recommender.get_similar_books(book_id, top_n=limit)
                self._set_headers(200)
                self.wfile.write(json.dumps(res).encode("utf-8"))
            elif path == "/api/recommendations/popular":
                res = recommender.get_popular_books(limit=limit)
                self._set_headers(200)
                self.wfile.write(json.dumps(res).encode("utf-8"))
            elif path.startswith("/api/recommendations/genres/"):
                parts = path.split("/")
                genre = urllib.parse.unquote(parts[-1])
                res = recommender.get_genre_recommendations(genre, limit=limit)
                self._set_headers(200)
                self.wfile.write(json.dumps(res).encode("utf-8"))
            else:
                self._set_headers(404)
                self.wfile.write(b'{"error": "Not Found"}')

        def do_POST(self):
            if self.path == "/api/recommendations/personalized":
                content_len = int(self.headers.get("Content-Length", 0))
                body = self.rfile.read(content_len)
                try:
                    payload = json.loads(body.decode("utf-8"))
                    borrowed = payload.get("borrowedBookIds", [])
                    genres = payload.get("preferredGenres", [])
                    authors = payload.get("favoriteAuthors", [])
                    limit = payload.get("limit", 6)
                    results = recommender.get_personalized_recommendations(borrowed, genres, authors, limit)
                    self._set_headers(200)
                    self.wfile.write(json.dumps(results).encode("utf-8"))
                except Exception as e:
                    self._set_headers(400)
                    self.wfile.write(json.dumps({"error": str(e)}).encode("utf-8"))
            else:
                self._set_headers(404)
                self.wfile.write(b'{"error": "Not Found"}')

    app = None

if __name__ == "__main__":
    if "fastapi" in sys.modules:
        import uvicorn
        print("Starting FastAPI AI Recommendation Service on http://localhost:8000 ...")
        uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
    else:
        print("Starting Standalone AI Recommendation Server on http://localhost:8000 ...")
        server = HTTPServer(("0.0.0.0", 8000), SimpleAIHandler)
        server.serve_forever()

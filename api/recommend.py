import pandas as pd
import ast
import os
import logging
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import json

class MovieRecommender:
    def __init__(self):
        try:
            base_dir = os.path.dirname(os.path.abspath(__file__))
            # Look for CSV files in the backend directory
            backend_dir = os.path.join(os.path.dirname(base_dir), "backend")
            movies_path = os.path.join(backend_dir, "tmdb_5000_movies.csv")
            credits_path = os.path.join(backend_dir, "tmdb_5000_credits.csv")

            logging.info("📁 Loading CSV files...")
            self.movies = pd.read_csv(movies_path)
            self.credits = pd.read_csv(credits_path)
            logging.info("✅ CSV files loaded successfully.")
        except Exception as e:
            logging.error(f"❌ Error reading CSV files: {e}")
            raise

        try:
            self.movies = self.movies.merge(self.credits, left_on='id', right_on='movie_id')
            self.movies = self.movies[['id', 'title_x', 'overview', 'genres', 'keywords', 'cast', 'crew']]
            self.movies.rename(columns={'title_x': 'title'}, inplace=True)
            self.movies.dropna(inplace=True)

            self.movies['genres'] = self.movies['genres'].apply(self._extract_names)
            self.movies['keywords'] = self.movies['keywords'].apply(self._extract_names)
            self.movies['cast'] = self.movies['cast'].apply(self._extract_top_cast)
            self.movies['crew'] = self.movies['crew'].apply(self._extract_director)

            self.movies['overview'] = self.movies['overview'].apply(lambda x: x.split())

            self.movies['tags'] = (
                self.movies['overview'] +
                self.movies['genres'] +
                self.movies['keywords'] +
                self.movies['cast'] +
                self.movies['crew']
            )

            self.movies['tags'] = self.movies['tags'].apply(lambda x: " ".join(x).lower())
            self.movies['title_lower'] = self.movies['title'].str.lower()

            self.cv = CountVectorizer(max_features=5000, stop_words='english')
            self.vectors = self.cv.fit_transform(self.movies['tags']).toarray()

            self.similarity = cosine_similarity(self.vectors)

            logging.info("🚀 Recommender system initialized successfully.")
        except Exception as e:
            logging.error(f"❌ Error initializing recommender system: {e}")
            raise

    def _extract_names(self, text):
        try:
            return [i['name'] for i in ast.literal_eval(text)]
        except Exception:
            return []

    def _extract_top_cast(self, text):
        try:
            return [i['name'] for i in ast.literal_eval(text)[:3]]
        except Exception:
            return []

    def _extract_director(self, text):
        try:
            return [person['name'] for person in ast.literal_eval(text) if person.get('job') == 'Director']
        except Exception:
            return []

    def recommend(self, movie_title, top_n=5):
        movie_title = movie_title.lower()
        movie_index = self.movies[self.movies['title_lower'] == movie_title].index

        if len(movie_index) == 0:
            return ["Movie not found in dataset."]

        idx = movie_index[0]
        distances = self.similarity[idx]
        movie_list = sorted(list(enumerate(distances)), reverse=True, key=lambda x: x[1])[1:top_n+1]
        return [self.movies.iloc[i[0]].title for i in movie_list]

# Initialize the recommender globally
recommender = None

def get_recommendations(title: str):
    global recommender
    
    if recommender is None:
        try:
            recommender = MovieRecommender()
        except Exception as e:
            return {"error": f"Failed to initialize recommender: {str(e)}"}
    
    try:
        results = recommender.recommend(title)
        if results == ["Movie not found in dataset."]:
            return {"error": f"Movie '{title}' not found"}
        return {"recommended": results}
    except Exception as e:
        return {"error": f"Error processing recommendation: {str(e)}"}

if __name__ == "__main__":
    import sys
    if len(sys.argv) > 1:
        title = sys.argv[1]
        result = get_recommendations(title)
        print(json.dumps(result))

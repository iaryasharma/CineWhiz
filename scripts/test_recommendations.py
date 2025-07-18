#!/usr/bin/env python3
"""
Test script to verify the recommendation system works locally
"""
import os
import sys
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'api'))

from recommend import get_recommendations

def test_recommendations():
    print("🎬 Testing CineWhiz Recommendation System")
    print("=" * 50)
    
    # Test cases
    test_movies = [
        "The Dark Knight",
        "Inception",
        "The Matrix",
        "Pulp Fiction",
        "Fight Club"
    ]
    
    for movie in test_movies:
        print(f"\n🎯 Testing recommendations for: {movie}")
        try:
            result = get_recommendations(movie)
            if 'error' in result:
                print(f"❌ Error: {result['error']}")
            else:
                print(f"✅ Recommendations: {result['recommended']}")
        except Exception as e:
            print(f"❌ Exception: {str(e)}")
    
    print("\n" + "=" * 50)
    print("✅ Test completed!")

if __name__ == "__main__":
    test_recommendations()

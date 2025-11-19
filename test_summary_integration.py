#!/usr/bin/env python3
"""
Test script for Gemini AI and usersummaries database integration
"""

import requests
import json

# Test configuration
BASE_URL = "http://localhost:5000"
TEST_QUERY = "Philippine elections 2022 misinformation"

def test_search_with_summary():
    """Test the search functionality with AI summary generation"""
    print("🧪 Testing search with AI summary generation...")
    
    # Test data
    data = {
        'query': TEST_QUERY,
        'serpapi_key': ''  # Use default scraping
    }
    
    try:
        # Make POST request to search
        response = requests.post(f"{BASE_URL}/", data=data)
        
        if response.status_code == 200:
            print("✅ Search request successful")
            print(f"📄 Response length: {len(response.text)} characters")
        else:
            print(f"❌ Search failed with status: {response.status_code}")
            print(f"Response: {response.text}")
            
    except requests.exceptions.ConnectionError:
        print("❌ Connection failed. Make sure Flask app is running on localhost:5000")
    except Exception as e:
        print(f"❌ Test failed: {e}")

def test_get_summaries():
    """Test retrieving stored summaries"""
    print("\n🧪 Testing summary retrieval...")
    
    try:
        # Get all summaries for the user
        response = requests.get(f"{BASE_URL}/api/summaries")
        
        if response.status_code == 200:
            data = response.json()
            if data['status'] == 'success':
                summaries = data['summaries']
                print(f"✅ Retrieved {len(summaries)} summaries")
                
                for i, summary in enumerate(summaries[:3]):  # Show first 3
                    print(f"\n📝 Summary {i+1}:")
                    print(f"   Query: {summary['query']}")
                    print(f"   Created: {summary['created_at']}")
                    print(f"   Text: {summary['summary_text'][:100]}...")
            else:
                print(f"❌ API Error: {data.get('message', 'Unknown error')}")
        else:
            print(f"❌ Request failed with status: {response.status_code}")
            print(f"Response: {response.text}")
            
    except requests.exceptions.ConnectionError:
        print("❌ Connection failed. Make sure Flask app is running on localhost:5000")
    except Exception as e:
        print(f"❌ Test failed: {e}")

def test_specific_summary():
    """Test retrieving a specific summary"""
    print("\n🧪 Testing specific summary retrieval...")
    
    try:
        # Try to get summary with ID 1
        response = requests.get(f"{BASE_URL}/api/summaries/1")
        
        if response.status_code == 200:
            data = response.json()
            if data['status'] == 'success':
                summary = data['summary']
                print("✅ Retrieved specific summary:")
                print(f"   Query: {summary['query']}")
                print(f"   Text: {summary['summary_text']}")
            else:
                print(f"❌ API Error: {data.get('message', 'Unknown error')}")
        elif response.status_code == 404:
            print("ℹ️  No summary with ID 1 found (this is normal if no searches have been made)")
        else:
            print(f"❌ Request failed with status: {response.status_code}")
            
    except requests.exceptions.ConnectionError:
        print("❌ Connection failed. Make sure Flask app is running on localhost:5000")
    except Exception as e:
        print(f"❌ Test failed: {e}")

if __name__ == "__main__":
    print("🚀 Starting Gemini AI and Database Integration Tests")
    print("=" * 60)
    
    # Run tests
    test_search_with_summary()
    test_get_summaries()
    test_specific_summary()
    
    print("\n" + "=" * 60)
    print("🏁 Tests completed!")
    print("\nTo run these tests:")
    print("1. Start your Flask app: python app.py")
    print("2. Run this test: python test_summary_integration.py")

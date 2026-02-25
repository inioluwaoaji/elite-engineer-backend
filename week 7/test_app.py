import requests
import json

# Test the legal query endpoint
url = "http://127.0.0.1:5000/legal-query"

data = {
    "country": "Nigeria",
    "question": "What are my rights if I am arrested?",
    "email": "test@example.com"
}

response = requests.post(url, json=data)
print("Response Status:", response.status_code)
print("Response:", json.dumps(response.json(), indent=2))
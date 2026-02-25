import google.generativeai as genai

# Replace YOUR_API_KEY_HERE with your actual API key
genai.configure(api_key="AIzaSyBoN7BHd7-Ogt4o4hneWAUsZHq3Ve1TWP0")

def get_legal_answer(user_question, country):
    """Ask AI for legal advice instead of using JSON"""
    
    prompt = f"""
    You are a legal assistant for {country}.
    User question: {user_question}
    
    Provide relevant constitutional articles and legal guidance for {country}.
    """
    
    model = genai.GenerativeModel('gemini-pro')
    response = model.generate_content(prompt)
    
    return response.text

# Test it
if __name__ == "__main__":
    answer = get_legal_answer("What are my rights if arrested?", "Nigeria")
    print(answer)
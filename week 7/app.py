from flask import Flask, request, jsonify
from ai_integration import get_legal_answer
from pdf_generator import create_pdf
import datetime

app = Flask(__name__)

# Store reports for 48-hour tracking
reports = []

@app.route('/')
def home():
    return "Legal Bridge API is running! Go to /report to see stats."

@app.route('/legal-query', methods=['POST'])
def handle_legal_query():
    """Main endpoint for legal questions"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        country = data.get('country', 'Nigeria')
        question = data.get('question', 'What are my rights?')
        user_email = data.get('email', 'test@example.com')
        
        print(f"Processing query for {country}: {question}")
        
        # Get AI answer
        answer = get_legal_answer(question, country)
        
        print(f"Got AI response: {answer[:100]}...")
        
        # Generate PDF
        pdf_file = create_pdf(answer, country)
        
        print(f"Created PDF: {pdf_file}")
        
        # Log for reporting
        reports.append({
            'timestamp': datetime.datetime.now().isoformat(),
            'country': country,
            'question': question
        })
        
        return jsonify({
            'status': 'success',
            'answer': answer,
            'pdf_created': True,
            'pdf_file': pdf_file
        })
        
    except Exception as e:
        print(f"Error: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

@app.route('/report', methods=['GET'])
def get_report():
    """Generate 48-hour report"""
    return jsonify({
        'status': 'success',
        'total_queries': len(reports),
        'countries_covered': len(set(r['country'] for r in reports)) if reports else 0,
        'recent_activity': reports[-10:] if reports else []
    })

if __name__ == '__main__':
    print("Starting Legal Bridge API...")
    print("Visit http://127.0.0.1:5000/report to see the report")
    app.run(debug=True, port=5000)
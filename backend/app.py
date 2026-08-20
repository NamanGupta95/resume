import os
import pytesseract
from flask import Flask, render_template
from flask_cors import CORS
from routes.analyze_routes import analyze_bp

app = Flask(__name__)

# Allows all cross-origin requests.
CORS(app) 

app.register_blueprint(analyze_bp, url_prefix='/api')

# Route to load the frontend UI
@app.route('/', methods=['GET'])
def home():
    return render_template('index.html')

@app.route('/dashboard.html', methods=['GET'])
def dashboard():
    return render_template('dashboard.html')

# Health Check Route for Render deployment
@app.route('/health', methods=['GET'])
def health_check():
    return {"status": "active"}, 200

if __name__ == '__main__':
    # Render assigns a dynamic port, default to 5000 locally
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port)

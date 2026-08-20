import pytesseract
from flask import Flask
from flask_cors import CORS
from routes.analyze_routes import analyze_bp

app = Flask(__name__)

# Allows all cross-origin requests. Update to your live frontend URL later for security.
CORS(app) 

app.register_blueprint(analyze_bp, url_prefix='/api')

# Health Check Route for Render deployment
@app.route('/health', methods=['GET'])
def health_check():
    return {"status": "active"}, 200

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
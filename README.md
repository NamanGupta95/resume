# MatchAnalytics Pro

An AI-powered resume scanner and ranking system that evaluates candidate profiles against specific Job Descriptions using NLP and Cosine Similarity.

## Tech Stack
*   **Frontend:** HTML5, Vanilla JavaScript, TailwindCSS
*   **Backend:** Python, Flask, scikit-learn, NLTK
*   **Parsing/OCR:** PyPDF2, docx2txt, pytesseract, Pillow

## Features
*   Multi-format resume parsing (PDF, DOCX, PNG, JPG).
*   TF-IDF and Cosine Similarity algorithm for candidate ranking.
*   Automated skill extraction and keyword matching.
*   Interactive dashboard with visual match indicators and AI summaries.
*   Exportable candidate ranking reports (.txt).

## Installation & Setup

### 1. Backend Setup
Requires Python 3.8+. Tesseract-OCR must be installed on your system for image parsing.
```bash
# Navigate to the backend directory (assuming it exists alongside frontend)
cd backend

# Install Python dependencies
pip install -r requirements.txt

# Run the Flask server (runs on http://localhost:5000)
python app.py
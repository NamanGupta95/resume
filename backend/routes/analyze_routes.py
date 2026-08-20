from flask import Blueprint, request, jsonify
from utils.file_handler import allowed_file
from services.resume_parser import extract_text, extract_name
from services.preprocess import clean_text
from services.matcher import rank_resumes

analyze_bp = Blueprint('analyze_routes', __name__)

@analyze_bp.route('/analyze', methods=['POST'])
def analyze():
    job_desc = request.form.get('job_description', '')
    if not job_desc: return jsonify({"error": "Job description missing"}), 400

    if 'resumes' not in request.files: return jsonify({"error": "No resumes"}), 400
    files = request.files.getlist('resumes')

    clean_jd = clean_text(job_desc)
    resumes_data = []

    for file in files:
        if file and allowed_file(file.filename):
            # 1. Raw Text nikalna
            raw_text = extract_text(file, file.filename)
            if raw_text:
                # 2. Text ke andar se Asli Naam nikalna (Before cleaning)
                real_name = extract_name(raw_text, file.filename)
                
                resumes_data.append({
                    "filename": file.filename,
                    "candidate_name": real_name, 
                    "raw_text": raw_text,         # <-- NAYI LINE: Raw text UI aur matching ke liye
                    "processed_text": clean_text(raw_text)
                })

    if not resumes_data:
        return jsonify({"error": "No valid text found in files."}), 400

    ranked = rank_resumes(clean_jd, resumes_data)
    
    # NAYA LOGIC: job_description ko bhi wapas frontend bhejenge taaki wo skills match kar sake
    return jsonify({
        "success": True, 
        "job_description": job_desc,
        "candidates": ranked
    })
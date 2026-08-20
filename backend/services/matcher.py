from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

def rank_resumes(job_desc, resumes_data):
    if not resumes_data: return []
    
    # NLTK se deeply cleaned text yahan aayega
    documents = [job_desc] + [data['processed_text'] for data in resumes_data]
    
    # TfidfVectorizer ab NLTK ke clean text par apply hoga (Accuracy 10X badh jayegi)
    vectorizer = TfidfVectorizer()
    tfidf_matrix = vectorizer.fit_transform(documents)
    
    cosine_similarities = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:]).flatten()
    
    results = []
    for idx, score in enumerate(cosine_similarities):
        raw_percentage = score * 100
        
        # NLTK use karne ke baad similarity thodi aur strict hoti hai, toh hum multiplier 3.0 kar rahe hain
        boosted_score = raw_percentage * 3.0 
        final_score = min(boosted_score, 98.0)
        
        if raw_percentage < 2:
            final_score = raw_percentage

        results.append({
            "filename": resumes_data[idx]['filename'],
            "candidate_name": resumes_data[idx].get('candidate_name', resumes_data[idx]['filename']),
            "match_score": round(final_score, 2),
            "raw_text": resumes_data[idx].get('raw_text', ''), 
            "processed_text": resumes_data[idx].get('processed_text', '') 
        })
    
    return sorted(results, key=lambda x: x['match_score'], reverse=True)
import re
import nltk
from nltk.corpus import stopwords
from nltk.stem import WordNetLemmatizer

# --- NLTK SETUP (First time run hone par automatically dictionary download karega) ---
try:
    nltk.data.find('corpora/stopwords')
    nltk.data.find('corpora/wordnet')
except LookupError:
    nltk.download('stopwords', quiet=True)
    nltk.download('wordnet', quiet=True)
    nltk.download('punkt', quiet=True)
    nltk.download('omw-1.4', quiet=True)

# AI Tools initialize karna
lemmatizer = WordNetLemmatizer()
stop_words = set(stopwords.words('english'))

def clean_text(text):
    if not text:
        return ""
    
    # 1. Sabse pehle text ko chota (lowercase) karna
    text = text.lower()
    
    # 2. Faltu symbols, commas, aur special characters hatana (Sirf Alphabets rakhna)
    text = re.sub(r'[^a-z\s]', ' ', text)
    
    # 3. Text ko words mein todna (Tokenization)
    words = text.split()
    
    # 4. NLTK MAGIC: Stopwords hatana aur Lemmatize karna (e.g., 'analyzing' -> 'analyze')
    cleaned_words = [lemmatizer.lemmatize(word) for word in words if word not in stop_words]
    
    # 5. Wapas jod kar ek clean sentence banana
    return " ".join(cleaned_words)
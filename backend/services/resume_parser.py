import pdfplumber  # <-- NAYI LIBRARY (PyPDF2 ki jagah)
import docx2txt
import io
import re
from PIL import Image
import pytesseract

# --- TESSERACT OCR CONFIGURATION ---
# Windows mein Tesseract ko chalane ke liye yeh line sabse zaroori hai
pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'

def extract_text(file, filename):
    text = ""
    try:
        ext = filename.rsplit('.', 1)[1].lower()
        
        # Cursor ko file ke shuru mein set karna
        file.seek(0) 
        
        # --- SMARTER PDF EXTRACTION (NAYA LOGIC) ---
        if ext == 'pdf':
            # pdfplumber words ke beech ki doori naap kar sahi spaces lagata hai
            with pdfplumber.open(io.BytesIO(file.read())) as pdf:
                for page in pdf.pages:
                    # extract_text automatically missing spaces ko theek kar dega
                    extracted = page.extract_text()
                    if extracted:
                        text += extracted + "\n"
                        
        elif ext == 'docx':
            text = docx2txt.process(io.BytesIO(file.read()))
            
        # --- IMAGE SCANNING LOGIC ---
        elif ext in ['png', 'jpg', 'jpeg']:
            img = Image.open(io.BytesIO(file.read()))
            text = pytesseract.image_to_string(img)
            
    except Exception as e:
        print(f"Error parsing {filename}: {e}")
        
    return text.strip()

# --- FILENAME BASED NAME EXTRACTOR ---
def extract_name(raw_text, filename):
    # 1. File ka extension (.pdf, .docx, .png) hatana
    name = filename.rsplit('.', 1)[0]
    
    # 2. Underscores (_) aur Dashes (-) ko space ( ) mein badalna
    name = re.sub(r'[-_]', ' ', name)
    
    # 3. Faltu words ko hatana
    name = re.sub(r'\b(resume|cv|updated|final|draft|copy)\b', '', name, flags=re.IGNORECASE)
    
    # 4. Extra spaces hatana aur har word ka pehla letter Bada (Capital) karna
    name = re.sub(r'\s+', ' ', name).strip().title()
    
    # 5. Agar naam khali ho gaya, toh default naam dena
    return name if name else "Unknown Candidate"
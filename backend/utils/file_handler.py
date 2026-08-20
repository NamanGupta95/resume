# Yahan humne png, jpg, jpeg allow kar diye hain OCR ke liye
ALLOWED_EXTENSIONS = {'pdf', 'docx', 'png', 'jpg', 'jpeg'}

def allowed_file(filename):
    # Check karta hai ki file mein '.' hai aur uska extension allowed list mein hai
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS
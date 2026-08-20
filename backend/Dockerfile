FROM python:3.10-slim
RUN apt-get update && apt-get install -y tesseract-ocr libtesseract-dev
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt gunicorn
COPY . .
EXPOSE 5000
CMD gunicorn --bind 0.0.0.0:$PORT app:app
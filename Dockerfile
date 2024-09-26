FROM python:3.9-slim

WORKDIR /usr/src/app

COPY ./src/app/logic/ .

RUN pip install --no-cache-dir -r requirements.txt

EXPOSE 5000

# Set environment variables for Flask
ENV FLASK_APP=app.py
ENV FLASK_ENV=development

CMD ["flask", "run", "--host=0.0.0.0", "--port=5000"]

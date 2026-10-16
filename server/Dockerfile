FROM python:3.13-slim
ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt && useradd --uid 10001 --create-home enstudy && mkdir /data && chown enstudy /data
COPY app.py .
USER enstudy
EXPOSE 8090
CMD ["gunicorn", "--bind", "0.0.0.0:8090", "--workers", "2", "--worker-class", "sync", "--timeout", "30", "--umask", "0077", "app:create_app()"]

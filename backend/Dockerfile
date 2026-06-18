FROM python:3.11-slim

WORKDIR /app

# Install dependencies first for better caching
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend source code (excluding ignored paths via .dockerignore)
COPY . .

# Default port environment variable
ENV PORT=8080

# Expose the default port (optional metadata, Render ignores EXPOSE and uses PORT env anyway)
EXPOSE 8080

# Run uvicorn using sh -c to ensure environment variable substitution of PORT
CMD ["sh", "-c", "uvicorn main:app --host 0.0.0.0 --port ${PORT}"]

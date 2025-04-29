# Use a specific, recent, stable Python slim image (e.g., 3.11 or 3.12 by Apr 2025)
FROM python:3.11-slim

# Set environment variables
ENV PYTHONUNBUFFERED 1
ENV PYTHONDONTWRITEBYTECODE 1

WORKDIR /app

# Install system dependencies - postgresql-client is needed for pg_isready/psql in entrypoint.sh
RUN apt-get update && apt-get install -y --no-install-recommends \
    postgresql-client \
 && rm -rf /var/lib/apt/lists/*

# Copy only requirements first to leverage Docker cache
COPY requirements.txt .

# Install dependencies
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copy the rest of the backend application code
# Use .dockerignore later to exclude unnecessary files if needed
COPY . .

# Make the entrypoint script executable
RUN chmod +x /app/entrypoint.sh

# Expose the port the app runs on
EXPOSE 8000

# Set the entrypoint script to run migrations then the CMD
ENTRYPOINT ["/app/entrypoint.sh"]

# Command to run the application (passed to entrypoint.sh)
# Use --reload for development (requires installing 'watchfiles'), remove for production builds
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
# CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"] 
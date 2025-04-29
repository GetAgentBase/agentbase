#!/bin/sh

# Exit immediately if a command exits with a non-zero status.
set -e

# Function to check if Postgres is ready using pg_isready
wait_for_postgres() {
  echo "Waiting for PostgreSQL at $POSTGRES_HOST..."
  # Use pg_isready (ensure POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_DB, POSTGRES_HOST are set in environment)
  # Note: pg_isready doesn't need the password, just host/user/db if specified.
  until pg_isready -h "$POSTGRES_HOST" -U "$POSTGRES_USER" -d "$POSTGRES_DB" -q; do
    >&2 echo "Postgres is unavailable - sleeping"
    sleep 1
  done
  >&2 echo "Postgres is up - executing command"
}

# Wait for the database service to be ready
# Assumes DB connection details are available as environment variables
wait_for_postgres

# Run Alembic migrations to apply schema changes
# Alembic reads DATABASE_URL from environment (set in docker-compose.yml)
echo "Running database migrations..."
alembic upgrade head
echo "Database migrations finished."

# Execute the main container command (CMD) passed to this script
# This will be `uvicorn app.main:app ...` as defined in the Dockerfile CMD
exec "$@" 
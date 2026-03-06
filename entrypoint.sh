#!/bin/sh

# Exit immediately on error
set -e

echo "==> Waiting for MySQL to be ready..."
# The db service healthcheck in docker-compose handles this,
# but we add a small guard here as a belt-and-suspenders measure.
until python -c "
import sys
import MySQLdb
import os
try:
    MySQLdb.connect(
        host=os.environ.get('DB_HOST', 'db'),
        user=os.environ.get('DB_USER', 'agon_user'),
        passwd=os.environ.get('DB_PASSWORD', ''),
        db=os.environ.get('DB_NAME', 'agon_db'),
        port=int(os.environ.get('DB_PORT', 3306)),
    )
    sys.exit(0)
except Exception:
    sys.exit(1)
"; do
  echo "    MySQL not ready yet — retrying in 2s..."
  sleep 2
done

echo "==> MySQL is ready."

echo "==> Creating migrations for api app..."
python manage.py makemigrations api

echo "==> Running database migrations..."
python manage.py migrate --noinput

echo "==> Collecting static files..."
python manage.py collectstatic --noinput --clear 2>/dev/null || true

echo "==> Starting Django development server..."
exec python manage.py runserver 0.0.0.0:8000

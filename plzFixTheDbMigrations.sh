#!/usr/bin/env bash
echo "First trying to make migrations w/o deleting the db"
echo "==================================================="
echo "Running pip install"
pip install -r requirements.txt

echo "Makeing Migrations..."
python manage.py makemigrations
python manage.py makemigrations quickstart

echo "Migrating the database..."
python manage.py migrate

echo "Do you wish to proceed with removing the database/migrations/etc?"
echo "Answering 'y' or 'Y' will clear all data and force others to migrate this way."
read -p "Are you sure you want to continue? " -n 1 -r
echo  # for a new line

if [[ $REPLY =~ ^[Yy]$ ]]
  then
  echo "Removing the database"
  rm db.sqlite3

  echo "Removing old migration files"
  rm server/quickstart/migrations/*

  echo "Creating the migration files"
  python manage.py makemigrations
  python manage.py makemigrations quickstart

  echo "Migrating the database"
  python manage.py migrate

  echo "Creating the superuser..."
  python manage.py createsuperuser
fi
  echo "I guess we're done here"

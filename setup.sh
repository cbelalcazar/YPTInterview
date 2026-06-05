#!/bin/bash

# YipitData KPI Dashboard - Automated Setup Script
# This script prepares the environment, database, and dependencies.

set -e # Exit on error

echo "🚀 Starting automated setup..."

# 1. Check for prerequisites
DOCKER_CMD=""
if docker compose version &> /dev/null; then
    DOCKER_CMD="docker compose"
elif docker-compose version &> /dev/null; then
    DOCKER_CMD="docker-compose"
else
    echo "❌ Error: Docker Compose is not installed (tried 'docker compose' and 'docker-compose')."
    exit 1
fi

if ! command -v yarn &> /dev/null; then
    echo "❌ Error: yarn is not installed."
    exit 1
fi

# 2. Setup Environment Variables
if [ ! -f .env ]; then
    echo "📝 Creating .env from .env.example..."
    cp .env.example .env
fi

# Copy .env to all packages that need it
echo "🔗 Propagating .env to sub-packages..."
cp .env apps/api/.env
cp .env apps/mcp-server/.env
cp .env packages/db/.env

# 3. Start Database
echo "🐘 Starting PostgreSQL via $DOCKER_CMD..."
$DOCKER_CMD up -d

echo "⏳ Waiting for database to be ready..."
while [ -z "$($DOCKER_CMD ps -q --filter "health=healthy" --filter "status=running")" ]; do
    printf "."
    sleep 2
done
echo " Ready!"

# 4. Install Dependencies
echo "📦 Installing dependencies (this may take a minute)..."
yarn install --ignore-engines --silent

# 5. Database Initialization
echo "🗄️ Initializing database schema and seeding data..."
# Use the DATABASE_URL from .env for Prisma
export $(grep -v '^#' .env | xargs)
cd packages/db
npx prisma migrate dev --name init
npx prisma db seed
cd ../..

echo ""
echo "✅ Setup Complete!"
echo "------------------------------------------------"
echo "To start the application, run:"
echo "  yarn dev"
echo ""
echo "Dashboard: http://localhost:3000"
echo "API:       http://localhost:3001"
echo "------------------------------------------------"

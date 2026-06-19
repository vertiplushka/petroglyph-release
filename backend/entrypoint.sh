#!/bin/sh
set -e

echo "Pushing Prisma schema..."
npx prisma db push --skip-generate --accept-data-loss

echo "Seeding database..."
npx prisma db seed

echo "Starting server..."
exec node dist/main

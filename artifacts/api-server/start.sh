#!/bin/sh

# Seed permissions
echo "----------------------------------------"
echo "🔍 Checking for permission seeder..."
if [ -f "./artifacts/api-server/dist/seed_permissions.mjs" ]; then
    echo "🌱 Running permission seeder..."
    node ./artifacts/api-server/dist/seed_permissions.mjs
    echo "✅ Seeder execution finished."
else
    echo "⚠️ Warning: seed_permissions.mjs not found at ./artifacts/api-server/dist/seed_permissions.mjs"
fi
echo "----------------------------------------"

# Start the application
echo "Starting Spacca POS API Server..."
node ./artifacts/api-server/dist/index.mjs

#!/bin/sh
echo "Dumping Render database..."
pg_dump $DATABASE_URL > /tmp/backup.sql
echo "Restoring to Supabase..."
psql $SUPABASE_DATABASE_URL -f /tmp/backup.sql
echo "Migration complete!"
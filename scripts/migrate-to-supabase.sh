#!/bin/sh
echo "Dumping Render database..."
pg_dump $DATABASE_URL > /tmp/backup.sql
echo "Restoring to Supabase via PgBouncer..."
psql $SUPABASE_DATABASE_URL -f /tmp/backup.sql
echo "Migration complete!"
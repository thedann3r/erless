# Database backup container for Erlessed
FROM postgres:16-alpine

# Install required tools
RUN apk add --no-cache \
    aws-cli \
    curl \
    gzip

# Create backup script
COPY <<EOF /backup.sh
#!/bin/sh
set -e

echo "Starting database backup..."

# Generate timestamp
TIMESTAMP=\$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="erlessed_backup_\${TIMESTAMP}.sql"

# Create backup
pg_dump \${DATABASE_URL} > /tmp/\${BACKUP_FILE}

# Compress backup
gzip /tmp/\${BACKUP_FILE}

# Store locally
cp /tmp/\${BACKUP_FILE}.gz /backups/

# Clean old backups (keep last 7 days)
find /backups -name "*.sql.gz" -mtime +7 -delete

echo "Backup completed: \${BACKUP_FILE}.gz"

# Optional: Upload to cloud storage
if [ -n "\${AWS_ACCESS_KEY_ID}" ] && [ -n "\${S3_BACKUP_BUCKET}" ]; then
    echo "Uploading to S3..."
    aws s3 cp /tmp/\${BACKUP_FILE}.gz s3://\${S3_BACKUP_BUCKET}/erlessed/\${BACKUP_FILE}.gz
fi

# Cleanup temp file
rm -f /tmp/\${BACKUP_FILE}.gz

echo "Backup process completed successfully"
EOF

RUN chmod +x /backup.sh

CMD ["/backup.sh"]
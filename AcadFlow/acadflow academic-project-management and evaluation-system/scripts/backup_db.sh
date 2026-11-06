#!/usr/bin/env bash
# ==============================================================================
# AcadFlow Database Automated Backup Script
# Usage: ./scripts/backup_db.sh [backup_destination_dir]
# ==============================================================================
set -euo pipefail

BACKUP_DIR="${1:-./backups}"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="${BACKUP_DIR}/acadflow_backup_${TIMESTAMP}.sql.gz"

DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-3306}"
DB_NAME="${DB_NAME:-acadflow_prod}"
DB_USER="${DB_USER:-acadflow_user}"

mkdir -p "${BACKUP_DIR}"

echo "[AcadFlow Backup] Starting database backup at $(date)..."
echo "[AcadFlow Backup] Target: ${DB_NAME} on ${DB_HOST}:${DB_PORT} -> ${BACKUP_FILE}"

if [ -z "${DB_PASSWORD:-}" ]; then
  echo "[AcadFlow Backup] Warning: DB_PASSWORD is not set in environment. Prompting or using .my.cnf..."
fi

# Run mysqldump with single-transaction for zero downtime during reads
mysqldump \
  --host="${DB_HOST}" \
  --port="${DB_PORT}" \
  --user="${DB_USER}" \
  ${DB_PASSWORD:+--password="${DB_PASSWORD}"} \
  --single-transaction \
  --quick \
  --routines \
  --triggers \
  --events \
  "${DB_NAME}" | gzip -9 > "${BACKUP_FILE}"

BACKUP_SIZE=$(ls -lh "${BACKUP_FILE}" | awk '{print $5}')
echo "[AcadFlow Backup] Backup completed successfully (${BACKUP_SIZE}): ${BACKUP_FILE}"

# Retention management: Prune backups older than 30 days
echo "[AcadFlow Backup] Pruning backups older than 30 days..."
find "${BACKUP_DIR}" -name "acadflow_backup_*.sql.gz" -type f -mtime +30 -exec rm -f {} +
echo "[AcadFlow Backup] Retention cleanup completed."

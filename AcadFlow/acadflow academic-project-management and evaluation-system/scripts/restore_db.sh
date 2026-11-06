#!/usr/bin/env bash
# ==============================================================================
# AcadFlow Database Restore & Disaster Recovery Script
# Usage: ./scripts/restore_db.sh <path_to_backup_file.sql[.gz]>
# ==============================================================================
set -euo pipefail

if [ "$#" -ne 1 ]; then
  echo "Usage: $0 <path_to_backup_file.sql or .sql.gz>"
  exit 1
fi

BACKUP_FILE="$1"

if [ ! -f "${BACKUP_FILE}" ]; then
  echo "Error: Backup file '${BACKUP_FILE}' does not exist."
  exit 1
fi

DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-3306}"
DB_NAME="${DB_NAME:-acadflow_prod}"
DB_USER="${DB_USER:-acadflow_user}"

echo "=================================================================="
echo "                   AcadFlow Database Restore"
echo "=================================================================="
echo "Target Host:     ${DB_HOST}:${DB_PORT}"
echo "Target Database: ${DB_NAME}"
echo "Target User:     ${DB_USER}"
echo "Source File:     ${BACKUP_FILE}"
echo "=================================================================="
echo "WARNING: This operation will overwrite existing data in '${DB_NAME}'!"
echo "Type 'RESTORE' to confirm: "
read -r CONFIRMATION

if [ "${CONFIRMATION}" != "RESTORE" ]; then
  echo "Restore aborted by user."
  exit 0
fi

echo "[AcadFlow Restore] Starting database restore at $(date)..."

if [[ "${BACKUP_FILE}" == *.gz ]]; then
  echo "[AcadFlow Restore] Decompressing and importing gzip archive..."
  gunzip -c "${BACKUP_FILE}" | mysql \
    --host="${DB_HOST}" \
    --port="${DB_PORT}" \
    --user="${DB_USER}" \
    ${DB_PASSWORD:+--password="${DB_PASSWORD}"} \
    "${DB_NAME}"
else
  echo "[AcadFlow Restore] Importing plain SQL dump..."
  mysql \
    --host="${DB_HOST}" \
    --port="${DB_PORT}" \
    --user="${DB_USER}" \
    ${DB_PASSWORD:+--password="${DB_PASSWORD}"} \
    "${DB_NAME}" < "${BACKUP_FILE}"
fi

echo "[AcadFlow Restore] Restore completed successfully at $(date)."
echo "[AcadFlow Restore] Run 'npm test' or query /api/health to verify service integrity."

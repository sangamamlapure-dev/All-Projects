# AcadFlow — Production Deployment & Operations Guide

## 1. System Requirements & Architecture
- **Runtime**: Node.js 20.x or 22.x LTS (Alpine Linux / Ubuntu 22.04 LTS / Debian 12 / Windows Server)
- **Database**: MySQL 8.0+ (utf8mb4 encoding, InnoDB engine)
- **Reverse Proxy**: Nginx 1.22+ or Caddy 2.x (TLS termination, HTTP/2, compression)
- **Process Manager**: Docker / Docker Compose / systemd / PM2
- **Memory Recommendation**: 2 GB RAM minimum, 4 GB recommended for production workloads
- **Disk Storage**: 20 GB SSD minimum for application code, private document storage, and database snapshots

---

## 2. Production Environment Variables (.env)

Before deploying to production, generate cryptographically secure secrets:

```bash
# Generate 64-character hexadecimal session secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Configure your production `.env` file:
```ini
# Core Server Configuration
PORT=3000
HOST="0.0.0.0"
NODE_ENV="production"
CORS_ORIGIN="https://acadflow.yourcollege.edu"

# Cryptographic Session Secret (keep strictly confidential)
SESSION_SECRET="your_generated_64_char_hexadecimal_secret"

# Production Database Connection URL
DATABASE_URL="mysql://acadflow_user:YOUR_STRONG_PASSWORD@127.0.0.1:3306/acadflow_prod?connection_limit=20&pool_timeout=10"

# Document & Portfolio Storage Configuration
UPLOAD_DIR="./uploads"
MAX_FILE_SIZE_MB=25

# Optional AI Features / Gemini API Key
GEMINI_API_KEY=""
APP_URL="https://acadflow.yourcollege.edu"
```

---

## 3. Deployment Method A: Docker & Docker Compose (Recommended)

AcadFlow includes a production-ready, multi-stage `Dockerfile` and `docker-compose.yml`.

### Step 1: Clone and Configure
```bash
git clone https://github.com/your-org/acadflow.git
cd acadflow
cp .env.example .env
# Edit .env with production passwords and secrets
nano .env
```

### Step 2: Build & Start Stack
```bash
docker compose up -d --build
```

### Step 3: Verify Container Health
```bash
docker compose ps
curl -i http://localhost:3000/api/health
```

### Step 4: Run Prisma Database Migrations & Seed Accounts
```bash
docker compose exec app npx prisma migrate deploy
docker compose exec app npx prisma db seed
```

---

## 4. Deployment Method B: Bare Metal / Linux VM (systemd & PM2)

### Step 1: Install Node.js & MySQL 8
```bash
# Ubuntu 22.04 / 24.04
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs mysql-server
sudo systemctl enable --now mysql
```

### Step 2: Configure MySQL Database and Dedicated User
```sql
CREATE DATABASE acadflow_prod CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'acadflow_user'@'localhost' IDENTIFIED BY 'YOUR_STRONG_PASSWORD';
GRANT ALL PRIVILEGES ON acadflow_prod.* TO 'acadflow_user'@'localhost';
FLUSH PRIVILEGES;
```

### Step 3: Clone, Install & Build Assets
```bash
git clone https://github.com/your-org/acadflow.git /var/www/acadflow
cd /var/www/acadflow
npm ci
npx prisma generate
npx prisma migrate deploy
npx prisma db seed
npm run build
```

### Step 4: Configure systemd Service (`/etc/systemd/system/acadflow.service`)
```ini
[Unit]
Description=AcadFlow Academic Management System
After=network.target mysql.service

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/acadflow
Environment=NODE_ENV=production
EnvironmentFile=/var/www/acadflow/.env
ExecStart=/usr/bin/node --import tsx/esm server.ts
Restart=always
RestartSec=10
StandardOutput=syslog
StandardError=syslog
SyslogIdentifier=acadflow

[Install]
WantedBy=multi-user.target
```

Enable and start the service:
```bash
sudo systemctl daemon-reload
sudo systemctl enable --now acadflow
sudo systemctl status acadflow
```

---

## 5. Nginx Reverse Proxy & TLS Configuration

Place the following configuration in `/etc/nginx/sites-available/acadflow`:

```nginx
server {
    listen 80;
    server_name acadflow.yourcollege.edu;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name acadflow.yourcollege.edu;

    ssl_certificate /etc/letsencrypt/live/acadflow.yourcollege.edu/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/acadflow.yourcollege.edu/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self'; connect-src 'self';" always;

    # Max upload size (PDFs, PPTs, ZIPs)
    client_max_body_size 30M;

    # Static assets caching
    location /assets/ {
        proxy_pass http://127.0.0.1:3000/assets/;
        proxy_set_header Host $host;
        expires 30d;
        add_header Cache-Control "public, no-transform";
    }

    # Application proxy
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 60s;
    }
}
```

---

## 6. Backup, Restore & Disaster Recovery Procedures

### 6.1 Automated Daily Backups
The included script `scripts/backup_db.sh` executes a live, non-blocking logical dump of the database with gzip compression:

```bash
# Execute manual backup
./scripts/backup_db.sh ./backups

# Setup automated cron job (Runs daily at 02:00 AM)
# Add to crontab via `crontab -e`:
0 2 * * * DB_PASSWORD="YOUR_STRONG_PASSWORD" /var/www/acadflow/scripts/backup_db.sh /var/backups/acadflow >> /var/log/acadflow_backup.log 2>&1
```

### 6.2 Database Restoration
In the event of hardware failure or recovery:

```bash
# Decompresses and imports the targeted snapshot
DB_PASSWORD="YOUR_STRONG_PASSWORD" ./scripts/restore_db.sh /var/backups/acadflow/acadflow_backup_YYYYMMDD_HHMMSS.sql.gz
```

### 6.3 Document Volume Backups
User-uploaded project files and defense sheets reside in `uploads/`. Ensure rsync or tar snapshots are taken in sync with database backups:
```bash
rsync -aP --delete /var/www/acadflow/uploads/ /var/backups/acadflow/uploads_backup/
```

---

## 7. Zero-Downtime Rollback Runbook

1. **Detect Issue**: Probes report high failure rate or errors on `/api/health`.
2. **Revert Git Release**:
   ```bash
   git checkout <PREVIOUS_STABLE_TAG_OR_COMMIT>
   ```
3. **Rebuild Client Assets**:
   ```bash
   npm run build
   ```
4. **Graceful Restart**:
   ```bash
   # systemd
   sudo systemctl reload-or-restart acadflow
   
   # Or Docker Compose
   docker compose up -d --no-deps app
   ```
5. **Verify Health**:
   ```bash
   curl -f http://localhost:3000/api/health || exit 1
   ```

---

## 8. Verification & Acceptance Checklist

| Check | Target | Verification Method | Status |
|---|---|---|---|
| **Health API** | HTTP 200, status: healthy | `curl -s http://localhost:3000/api/health` | **PASSED** |
| **Database Connectivity** | MySQL 8 or fallback | `curl -s http://localhost:3000/api/db/diagnostics` | **PASSED** |
| **All Test Suites** | 7 suites, 77 tests | `npm test` | **PASSED (77/77)** |
| **Linter / TypeScript** | 0 errors | `npm run lint` | **PASSED** |
| **Production Client Build** | Static bundle in `dist/` | `npm run build` | **PASSED** |
| **Security Controls** | Rate limiting, CSP, CORS | `tests/security_e2e.test.ts` | **PASSED** |
| **Role Isolation** | Strict 4-role access | HOD, STUDENT, MENTOR, EVALUATOR | **VERIFIED** |

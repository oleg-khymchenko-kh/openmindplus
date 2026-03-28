#!/bin/bash
set -e

RED=$(tput setaf 1); GREEN=$(tput setaf 2); YELLOW=$(tput setaf 3); BLUE=$(tput setaf 4); NC=$(tput sgr0)

echo "${BLUE}🚀 OpenMindPlus Deployment${NC}"
echo "==============================="

PROJECT_DIR="/home/openmindplus.com"
BACKUP_DIR="$PROJECT_DIR/backups"
REPO_URL="git@github-openmindplus:oleg-khymchenko-kh/openmindplus.git"
TEMP_DIR="/tmp/openmindplus-deploy"

# Backup
if [ -d "$PROJECT_DIR/frontend/.next" ]; then
    BACKUP_NAME="backup_$(date +%Y%m%d_%H%M%S)"
    echo "${YELLOW}📦 Backup: $BACKUP_NAME${NC}"
    mkdir -p "$BACKUP_DIR/$BACKUP_NAME"
    cp -r "$PROJECT_DIR/frontend/.next" "$BACKUP_DIR/$BACKUP_NAME/.next" 2>/dev/null || true
fi

# Clone
echo "${BLUE}🔄 Fetching latest code...${NC}"
rm -rf "$TEMP_DIR"
git clone "$REPO_URL" "$TEMP_DIR"

# Deploy backend FIRST
echo "${BLUE}📦 Setting up backend...${NC}"
rm -rf "$PROJECT_DIR/app/current"
cp -r "$TEMP_DIR/backend" "$PROJECT_DIR/app/current"
cd "$PROJECT_DIR/app/current"
npm install --production
cp "$PROJECT_DIR/app/.env" .env

# Run DB migrations
echo "${BLUE}🗄️  Running migrations...${NC}"
npx prisma migrate deploy

# Restart backend via PM2
echo "${BLUE}🔄 Restarting backend...${NC}"
pm2 describe openmindplus-api > /dev/null 2>&1 && pm2 restart openmindplus-api || \
    pm2 start app/app.js --name openmindplus-api --log "$PROJECT_DIR/logs/node/app.log"
pm2 save

# Wait for backend
echo "${BLUE}⏳ Waiting for backend...${NC}"
sleep 4

# Build frontend
echo "${BLUE}📦 Building frontend...${NC}"
rm -rf "$PROJECT_DIR/frontend"
cp -r "$TEMP_DIR/frontend" "$PROJECT_DIR/frontend"
cd "$PROJECT_DIR/frontend"
echo "NEXT_PUBLIC_API_URL=http://localhost:4000" > .env.local
npm install
npm run build

# Restart frontend via PM2
echo "${BLUE}🔄 Restarting frontend...${NC}"
pm2 describe openmindplus-frontend > /dev/null 2>&1 && \
    pm2 restart openmindplus-frontend || \
    pm2 start npm --name openmindplus-frontend --cwd "$PROJECT_DIR/frontend" -- run start -- -p 3000
pm2 save

# Reload nginx
echo "${BLUE}🔄 Reloading nginx...${NC}"
nginx -t && systemctl reload nginx

# Cleanup
rm -rf "$TEMP_DIR"

echo "${GREEN}🎉 Deployment completed!${NC}"
echo "${GREEN}🌐 https://openmindplus.com${NC}"

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
if [ -d "$PROJECT_DIR/www" ] && [ "$(ls -A $PROJECT_DIR/www 2>/dev/null)" ]; then
    BACKUP_NAME="backup_$(date +%Y%m%d_%H%M%S)"
    echo "${YELLOW}📦 Backup: $BACKUP_NAME${NC}"
    cp -r "$PROJECT_DIR/www" "$BACKUP_DIR/$BACKUP_NAME"
fi

# Clone
echo "${BLUE}🔄 Fetching latest code...${NC}"
rm -rf "$TEMP_DIR"
git clone "$REPO_URL" "$TEMP_DIR"

# Build frontend
echo "${BLUE}📦 Building frontend...${NC}"
cd "$TEMP_DIR/frontend"
npm install
NEXT_PUBLIC_API_URL=https://openmindplus.com npm run build

# Deploy frontend
echo "${BLUE}📂 Deploying frontend...${NC}"
rm -rf "$PROJECT_DIR/www"/*
cp -r out/* "$PROJECT_DIR/www/"

# Deploy backend
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
pm2 describe openmindplus-api > /dev/null 2>&1 && pm2 restart openmindplus-api ||     pm2 start app/app.js --name openmindplus-api --log "$PROJECT_DIR/logs/node/app.log"
pm2 save

# Reload nginx
echo "${BLUE}🔄 Reloading nginx...${NC}"
nginx -t && systemctl reload nginx

# Cleanup
rm -rf "$TEMP_DIR"

echo "${GREEN}🎉 Deployment completed!${NC}"
echo "${GREEN}🌐 http://openmindplus.com${NC}"

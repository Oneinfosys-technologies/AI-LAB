# OIS LabPro Deployment Guide

This guide provides detailed instructions for deploying the OIS LabPro platform on a production server using Nginx as a reverse proxy.

## System Requirements

- **Server**: Linux-based server (Ubuntu 20.04 LTS or newer recommended)
- **CPU**: Minimum 2 cores
- **RAM**: 2GB minimum (4GB recommended)
- **Storage**: 20GB minimum
- **Software**:
  - Node.js v20+ (LTS version recommended)
  - PostgreSQL 14+
  - Nginx
  - Git

## Prerequisites

Before deployment, ensure you have:

1. A domain name pointing to your server
2. Root or sudo access to your server
3. API keys for external services:
   - OpenAI API key (for AI insights feature)
   - Google API key with Gemini API access (for health chat feature)

## Step 1: Server Preparation

### Install Required Software

```bash
# Update package information
sudo apt update

# Install Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Verify Node.js installation
node --version  # Should show v20.x.x
npm --version   # Should show 9.x.x or higher

# Install PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Install Nginx
sudo apt install -y nginx

# Install Git
sudo apt install -y git

# Install additional build tools (may be needed for some npm packages)
sudo apt install -y build-essential
```

### Configure PostgreSQL

```bash
# Start PostgreSQL service
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Switch to postgres user
sudo -i -u postgres

# Create database and user
psql -c "CREATE USER ois_labpro WITH PASSWORD 'your_secure_password';"
psql -c "CREATE DATABASE ois_labpro;"
psql -c "GRANT ALL PRIVILEGES ON DATABASE ois_labpro TO ois_labpro;"
psql -c "ALTER USER ois_labpro WITH SUPERUSER;"

# Exit postgres user shell
exit
```

Make note of the database credentials as you'll need them in the environment setup.

## Step 2: Clone and Set Up the Application

### Clone the Repository

```bash
# Navigate to your preferred directory
cd /var/www

# Clone the repository
sudo git clone https://github.com/your-organization/ois-labpro.git

# Set proper ownership
sudo chown -R $USER:$USER /var/www/ois-labpro

# Navigate to the app directory
cd ois-labpro
```

### Install Application Dependencies

```bash
# Install npm dependencies
npm install

# Install PM2 globally for process management
sudo npm install -g pm2
```

### Set Up Environment Variables

Create a `.env` file in the application root directory:

```bash
# Create and edit the .env file
nano .env
```

Add the following environment variables:

```
# Database Configuration
DATABASE_URL=postgresql://ois_labpro:your_secure_password@localhost:5432/ois_labpro
PGHOST=localhost
PGUSER=ois_labpro
PGPASSWORD=your_secure_password
PGDATABASE=ois_labpro
PGPORT=5432

# API Keys
OPENAI_API_KEY=your_openai_api_key
GOOGLE_API_KEY=your_google_api_key

# Application Configuration
NODE_ENV=production
PORT=5000
SESSION_SECRET=your_very_secure_random_string

# Optional: Set a custom port if needed
# PORT=5000
```

Save and close the file.

### Set Up the Database Schema

```bash
# Run database migrations
npm run db:push
```

## Step 3: Build and Run the Application

### Build for Production

```bash
# Build the application
npm run build
```

### Set Up PM2 for Process Management

```bash
# Start the application with PM2
pm2 start dist/index.js --name "ois-labpro"

# Set PM2 to start on system boot
pm2 startup
sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u $USER --hp $HOME
pm2 save
```

## Step 4: Configure Nginx as a Reverse Proxy

### Create an Nginx Configuration File

```bash
# Create a new Nginx configuration file
sudo nano /etc/nginx/sites-available/ois-labpro
```

Add the following configuration:

```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Increase body size limit for uploads (if needed)
    client_max_body_size 10M;
}
```

### Enable the Nginx Configuration

```bash
# Create a symbolic link to enable the site
sudo ln -s /etc/nginx/sites-available/ois-labpro /etc/nginx/sites-enabled/

# Test the Nginx configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

## Step 5: Secure Your Application with SSL

### Install Certbot for Let's Encrypt SSL

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Obtain SSL certificate
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# Follow the prompts to complete SSL setup

# Verify auto-renewal is set up
sudo systemctl status certbot.timer
```

## Step 6: Monitoring and Maintenance

### Monitor Application Logs

```bash
# View application logs
pm2 logs ois-labpro

# Rotate logs
pm2 install pm2-logrotate
```

### Backup Database Regularly

Set up a cron job for regular database backups:

```bash
# Create backup script
nano ~/backup-ois-labpro-db.sh
```

Add the following content:

```bash
#!/bin/bash
BACKUP_DIR="/var/backups/postgres"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="$BACKUP_DIR/ois_labpro_$TIMESTAMP.sql"

# Create backup directory if it doesn't exist
mkdir -p $BACKUP_DIR

# Create backup using pg_dump
pg_dump -U ois_labpro -d ois_labpro > $BACKUP_FILE

# Compress the backup
gzip $BACKUP_FILE

# Remove backups older than 30 days
find $BACKUP_DIR -name "ois_labpro_*.sql.gz" -mtime +30 -delete
```

Make the script executable and set up a cron job:

```bash
chmod +x ~/backup-ois-labpro-db.sh

# Add to crontab (runs daily at 2 AM)
(crontab -l 2>/dev/null; echo "0 2 * * * ~/backup-ois-labpro-db.sh") | crontab -
```

### Update Application

To update the application when new code is available:

```bash
# Navigate to the application directory
cd /var/www/ois-labpro

# Pull latest changes
git pull

# Install dependencies (if package.json changed)
npm install

# Build the application
npm run build

# Restart the application
pm2 restart ois-labpro
```

## Troubleshooting

### Database Connection Issues

1. Verify PostgreSQL is running:
   ```bash
   sudo systemctl status postgresql
   ```

2. Check database credentials in `.env` file
3. Verify firewall settings allow connections to PostgreSQL

### Application Not Starting

1. Check application logs:
   ```bash
   pm2 logs ois-labpro
   ```

2. Verify all environment variables are set correctly
3. Check if the port is already in use:
   ```bash
   sudo netstat -tuln | grep 5000
   ```

### Nginx Issues

1. Check Nginx error logs:
   ```bash
   sudo tail -n 100 /var/log/nginx/error.log
   ```

2. Verify Nginx configuration:
   ```bash
   sudo nginx -t
   ```

3. Make sure Nginx is running:
   ```bash
   sudo systemctl status nginx
   ```

### SSL Certificate Issues

1. Check Certbot logs:
   ```bash
   sudo systemctl status certbot.service
   ```

2. Renew certificates manually:
   ```bash
   sudo certbot renew --dry-run
   ```

## Security Considerations

1. **Firewall Configuration**: Configure a firewall (UFW) to protect your server:
   ```bash
   sudo ufw allow 22
   sudo ufw allow 80
   sudo ufw allow 443
   sudo ufw enable
   ```

2. **Regular Updates**: Keep your system and packages updated:
   ```bash
   sudo apt update && sudo apt upgrade -y
   ```

3. **Database Security**:
   - Use strong passwords
   - Only allow local connections unless remote access is required
   - Regularly backup the database

4. **Application Secrets**:
   - Keep your API keys and secrets in `.env` file
   - Never commit sensitive information to version control
   - Rotate credentials periodically

## Required Secrets

The application requires the following secrets to be set in the `.env` file:

1. **Database Credentials**:
   - `DATABASE_URL`: Full PostgreSQL connection string
   - `PGHOST`: PostgreSQL host
   - `PGUSER`: PostgreSQL username
   - `PGPASSWORD`: PostgreSQL password
   - `PGDATABASE`: PostgreSQL database name
   - `PGPORT`: PostgreSQL port

2. **API Keys**:
   - `GOOGLE_API_KEY`: API key for Google's Gemini AI (for all AI features including test insights, health chat, and diet recommendations)

3. **Application Secrets**:
   - `SESSION_SECRET`: A random string used to sign session cookies

## Obtaining API Keys

### Google API Key (for Gemini)

1. Visit [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Navigate to "APIs & Services" > "Credentials"
4. Click "Create Credentials" > "API Key"
5. Restrict the key to the Gemini API
6. Copy the key and add it to your `.env` file as `GOOGLE_API_KEY`

## Additional Resources

- [Node.js Documentation](https://nodejs.org/docs/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Nginx Documentation](https://nginx.org/en/docs/)
- [PM2 Documentation](https://pm2.keymetrics.io/docs/usage/quick-start/)
- [Let's Encrypt Documentation](https://letsencrypt.org/docs/)

## Support

For additional help with deployment issues, contact our support team at support@ois-labpro.com or open an issue in the project repository.
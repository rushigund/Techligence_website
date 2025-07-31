# Deployment Guide

This guide covers deploying the Techligence platform to various hosting services.

## 📋 Table of Contents

- [Pre-deployment Setup](#pre-deployment-setup)
- [Vercel Deployment](#vercel-deployment)
- [Hostinger Deployment](#hostinger-deployment)
- [AWS Deployment](#aws-deployment)
- [Docker Deployment](#docker-deployment)
- [Environment Configuration](#environment-configuration)
- [Database Setup](#database-setup)
- [Domain Configuration](#domain-configuration)
- [Monitoring & Analytics](#monitoring--analytics)

## 🚀 Pre-deployment Setup

### 1. Build Verification
```bash
# Ensure project builds successfully
npm run build

# Check for TypeScript errors
npm run type-check

# Run linting
npm run lint

# Run tests
npm test
```

### 2. Environment Variables
Review and set up required environment variables:

```env
# Core Settings
VITE_DEMO_MODE=true
VITE_API_URL=/api
VITE_PUBLIC_URL=https://your-domain.com

# Database
VITE_MONGODB_URI=mongodb://localhost:27017/techligence

# Authentication
VITE_JWT_SECRET=your-jwt-secret

# External Services
VITE_EMAILJS_SERVICE_ID=your-service-id
VITE_EMAILJS_TEMPLATE_ID=your-template-id
VITE_GOOGLE_ANALYTICS_ID=GA-XXXXXXXXX
```

## ☁️ Vercel Deployment

### Quick Deploy
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy (first time)
vercel

# Deploy (subsequent deployments)
vercel --prod
```

### Manual Setup

1. **Create Vercel Project**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import from Git repository

2. **Configure Build Settings**
   ```json
   {
     "buildCommand": "npm run build",
     "outputDirectory": "dist",
     "installCommand": "npm install"
   }
   ```

3. **Environment Variables**
   In Vercel dashboard → Settings → Environment Variables:
   ```
   VITE_DEMO_MODE=true
   VITE_API_URL=/api
   VITE_PUBLIC_URL=https://your-project.vercel.app
   ```

4. **Custom Domain** (Optional)
   - Go to Settings → Domains
   - Add your custom domain
   - Configure DNS records

### Vercel Configuration File
Create `vercel.json`:
```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/api/$1"
    },
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        }
      ]
    }
  ]
}
```

## 🌐 Hostinger Deployment

### Method 1: FTP Upload

1. **Build the Project**
   ```bash
   npm run build
   ```

2. **FTP Upload**
   - Access Hostinger File Manager or use FTP client
   - Navigate to `public_html/` directory
   - Upload contents of `dist/` folder (not the folder itself)

3. **Configure .htaccess**
   The `.htaccess` file in `public/` will be copied to `dist/` during build:
   ```apache
   Options -MultiViews
   RewriteEngine On
   RewriteCond %{REQUEST_FILENAME} !-f
   RewriteRule ^ index.html [QSA,L]
   
   # Cache static assets
   <IfModule mod_expires.c>
     ExpiresActive on
     ExpiresByType text/css "access plus 1 year"
     ExpiresByType application/javascript "access plus 1 year"
     ExpiresByType image/png "access plus 1 year"
     ExpiresByType image/jpg "access plus 1 year"
     ExpiresByType image/jpeg "access plus 1 year"
   </IfModule>
   
   # Gzip compression
   <IfModule mod_deflate.c>
     AddOutputFilterByType DEFLATE text/plain
     AddOutputFilterByType DEFLATE text/html
     AddOutputFilterByType DEFLATE text/xml
     AddOutputFilterByType DEFLATE text/css
     AddOutputFilterByType DEFLATE application/xml
     AddOutputFilterByType DEFLATE application/xhtml+xml
     AddOutputFilterByType DEFLATE application/rss+xml
     AddOutputFilterByType DEFLATE application/javascript
     AddOutputFilterByType DEFLATE application/x-javascript
   </IfModule>
   ```

### Method 2: Git Integration

1. **Enable Git in Hostinger**
   - Go to Hostinger control panel
   - Enable Git for your domain

2. **Clone Repository**
   ```bash
   git clone your-repository.git
   cd your-project
   npm install
   npm run build
   ```

3. **Deployment Script**
   Create `deploy.sh`:
   ```bash
   #!/bin/bash
   git pull origin main
   npm install
   npm run build
   cp -r dist/* ../public_html/
   ```

## ☁️ AWS Deployment

### AWS S3 + CloudFront

1. **Build and Upload to S3**
   ```bash
   # Install AWS CLI
   npm install -g aws-cli

   # Configure AWS credentials
   aws configure

   # Build project
   npm run build

   # Upload to S3
   aws s3 sync dist/ s3://your-bucket-name --delete
   ```

2. **S3 Bucket Configuration**
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Sid": "PublicReadGetObject",
         "Effect": "Allow",
         "Principal": "*",
         "Action": "s3:GetObject",
         "Resource": "arn:aws:s3:::your-bucket-name/*"
       }
     ]
   }
   ```

3. **CloudFront Distribution**
   - Create CloudFront distribution
   - Set S3 bucket as origin
   - Configure error pages for SPA routing:
     - Error Code: 403, 404
     - Response Page Path: `/index.html`
     - Response Code: 200

### AWS Amplify

1. **Connect Repository**
   - Go to AWS Amplify console
   - Connect your Git repository

2. **Build Settings**
   ```yaml
   version: 1
   frontend:
     phases:
       preBuild:
         commands:
           - npm install
       build:
         commands:
           - npm run build
     artifacts:
       baseDirectory: dist
       files:
         - '**/*'
     cache:
       paths:
         - node_modules/**/*
   ```

## 🐳 Docker Deployment

### Dockerfile
```dockerfile
# Build stage
FROM node:18-alpine as build

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built app
COPY --from=build /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

### Nginx Configuration
Create `nginx.conf`:
```nginx
events {
    worker_connections 1024;
}

http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;

    server {
        listen 80;
        server_name localhost;

        root /usr/share/nginx/html;
        index index.html;

        # SPA routing
        location / {
            try_files $uri $uri/ /index.html;
        }

        # API proxy (if needed)
        location /api {
            proxy_pass http://backend:3001;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
        }

        # Gzip compression
        gzip on;
        gzip_types
            text/plain
            text/css
            text/js
            text/xml
            text/javascript
            application/javascript
            application/xml+rss;
    }
}
```

### Docker Compose
```yaml
version: '3.8'
services:
  frontend:
    build: .
    ports:
      - "80:80"
    environment:
      - VITE_API_URL=/api
    depends_on:
      - backend

  backend:
    build: ./server
    ports:
      - "3001:3001"
    environment:
      - MONGODB_URI=mongodb://mongo:27017/techligence
    depends_on:
      - mongo

  mongo:
    image: mongo:6
    ports:
      - "27017:27017"
    volumes:
      - mongo_data:/data/db

volumes:
  mongo_data:
```

### Deployment Commands
```bash
# Build and run
docker-compose up -d

# Scale services
docker-compose up -d --scale frontend=3

# Update deployment
docker-compose pull
docker-compose up -d
```

## 📊 Environment Configuration

### Development Environment
```env
# .env.local
VITE_DEMO_MODE=false
VITE_API_URL=http://localhost:3001/api
VITE_MONGODB_URI=mongodb://localhost:27017/techligence_dev
NODE_ENV=development
```

### Staging Environment
```env
# .env.staging
VITE_DEMO_MODE=true
VITE_API_URL=https://staging-api.techligence.com/api
VITE_MONGODB_URI=mongodb://staging-cluster.mongodb.net/techligence_staging
NODE_ENV=staging
```

### Production Environment
```env
# .env.production
VITE_DEMO_MODE=true
VITE_API_URL=/api
VITE_PUBLIC_URL=https://techligence.com
VITE_MONGODB_URI=mongodb://prod-cluster.mongodb.net/techligence
NODE_ENV=production
```

## 💾 Database Setup

### MongoDB Atlas (Recommended)

1. **Create Cluster**
   - Go to [MongoDB Atlas](https://cloud.mongodb.com)
   - Create new cluster
   - Choose region and tier

2. **Configure Security**
   - Add IP whitelist (0.0.0.0/0 for development)
   - Create database user
   - Get connection string

3. **Environment Variables**
   ```env
   VITE_MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/techligence?retryWrites=true&w=majority
   ```

### Local MongoDB
```bash
# Install MongoDB
brew install mongodb/brew/mongodb-community

# Start MongoDB
brew services start mongodb-community

# Connection string
VITE_MONGODB_URI=mongodb://localhost:27017/techligence
```

### Database Seeding
```bash
# Seed database with demo data
npm run seed

# Or run specific seeds
npm run seed:products
npm run seed:jobs
npm run seed:users
```

## 🌍 Domain Configuration

### DNS Configuration
```
# A Record
@ → Your server IP

# CNAME Records
www → your-domain.com
api → your-api-server.com

# For Vercel
CNAME → cname.vercel-dns.com
```

### SSL Certificate

#### Automatic (Vercel/Netlify)
SSL certificates are automatically provisioned.

#### Manual (Let's Encrypt)
```bash
# Install Certbot
sudo apt install certbot

# Get certificate
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

#### Custom Certificate
```nginx
server {
    listen 443 ssl;
    ssl_certificate /path/to/certificate.crt;
    ssl_certificate_key /path/to/private.key;
}
```

## 📈 Monitoring & Analytics

### Google Analytics
```typescript
// Add to main.tsx
import { gtag } from './lib/gtag';

gtag('config', 'GA-XXXXXXXXX');
```

### Error Monitoring (Sentry)
```typescript
import * as Sentry from '@sentry/react';

Sentry.init({
  dsn: 'your-sentry-dsn',
  environment: process.env.NODE_ENV,
});
```

### Performance Monitoring
```typescript
// Web Vitals
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

getCLS(console.log);
getFID(console.log);
getFCP(console.log);
getLCP(console.log);
getTTFB(console.log);
```

### Health Checks
```typescript
// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version
  });
});
```

## 🔄 CI/CD Pipeline

### GitHub Actions
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: npm test
      
      - name: Build project
        run: npm run build
        env:
          VITE_API_URL: ${{ secrets.API_URL }}
      
      - name: Deploy to Vercel
        uses: vercel/action@v1
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
```

## 🚨 Troubleshooting

### Common Issues

#### 1. Build Failures
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Check Node.js version
node --version  # Should be 18+
```

#### 2. Environment Variables Not Loading
```bash
# Check file naming
.env.local      # Development
.env.production # Production

# Verify VITE_ prefix
VITE_API_URL=...  # ✅ Correct
API_URL=...       # ❌ Wrong
```

#### 3. Routing Issues
Ensure `.htaccess` or server configuration handles SPA routing:
```apache
RewriteRule ^ index.html [QSA,L]
```

#### 4. API CORS Issues
```javascript
// Backend CORS configuration
app.use(cors({
  origin: ['https://your-domain.com', 'https://www.your-domain.com'],
  credentials: true
}));
```

### Performance Optimization

#### 1. Bundle Analysis
```bash
npm run build:analyze
```

#### 2. Image Optimization
- Use WebP format
- Implement lazy loading
- Add responsive images

#### 3. Code Splitting
```typescript
// Lazy load components
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
```

## 📞 Support

For deployment support:
- **Email**: devops@techligence.com
- **Slack**: #deployment
- **Documentation**: [docs.techligence.com](https://docs.techligence.com)

## 📝 Deployment Checklist

### Pre-deployment
- [ ] All tests passing
- [ ] TypeScript compilation successful
- [ ] Environment variables configured
- [ ] Database seeded
- [ ] SSL certificate ready

### Post-deployment
- [ ] Site loads correctly
- [ ] All routes work
- [ ] Forms submit successfully
- [ ] Analytics tracking active
- [ ] Error monitoring configured
- [ ] Performance metrics baseline established

### Production Readiness
- [ ] CDN configured
- [ ] Backup strategy in place
- [ ] Monitoring alerts set up
- [ ] Documentation updated
- [ ] Team notified of deployment

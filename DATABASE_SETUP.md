# Database Setup Guide for Techligence Application

This guide will help you set up the MongoDB database for your Techligence robotics application with Career and Contact form functionality.

## 🗄️ Database Requirements

### MongoDB Installation

#### Option 1: Local MongoDB Installation

1. **Download MongoDB Community Server:**

   - Visit: https://www.mongodb.com/try/download/community
   - Select your operating system
   - Download and install

2. **Start MongoDB Service:**

   ```bash
   # On Windows (as Administrator)
   net start MongoDB

   # On macOS (with Homebrew)
   brew services start mongodb-community

   # On Linux (Ubuntu/Debian)
   sudo systemctl start mongod
   sudo systemctl enable mongod  # Start on boot
   ```

3. **Verify Installation:**
   ```bash
   mongosh
   ```

#### Option 2: MongoDB Atlas (Cloud Database)

1. **Create Free Account:**

   - Visit: https://www.mongodb.com/atlas
   - Sign up for free tier (512MB storage)

2. **Create Cluster:**

   - Choose region closest to you
   - Select M0 (Free tier)
   - Wait for cluster creation (2-3 minutes)

3. **Configure Access:**
   - Add your IP address to IP whitelist
   - Create database user with username/password
   - Get connection string

#### Option 3: Docker MongoDB

```bash
# Run MongoDB in Docker
docker run -d \
  --name techligence-mongodb \
  -p 27017:27017 \
  -e MONGO_INITDB_ROOT_USERNAME=admin \
  -e MONGO_INITDB_ROOT_PASSWORD=yourpassword \
  -v mongodb_data:/data/db \
  mongo:latest
```

## ⚙️ Environment Configuration

### 1. Server Environment Variables

Create/update `server/.env` file:

```env
# Database Configuration
MONGODB_URI=mongodb://localhost:27017/techligence
# For Atlas: mongodb+srv://username:password@cluster.mongodb.net/techligence

# Server Configuration
PORT=5000
NODE_ENV=development

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=7d

# File Upload Configuration
UPLOAD_DIR=uploads
MAX_FILE_SIZE=10485760  # 10MB in bytes

# Email Configuration (Optional - for notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Security
BCRYPT_ROUNDS=12
RATE_LIMIT_WINDOW_MS=900000  # 15 minutes
RATE_LIMIT_MAX_REQUESTS=100
```

### 2. Frontend Environment Variables

Create/update `.env.local` file:

```env
# API Configuration
VITE_API_URL=http://localhost:5000/api

# Environment
VITE_NODE_ENV=development
```

## 🗃️ Database Structure

### Collections Created:

#### 1. **careerapplications**

- Stores job applications with file uploads
- Indexes: jobTitle, email, submittedAt, status

#### 2. **contactforms**

- Stores contact form submissions
- Indexes: inquiryType, email, submittedAt, status, priority

#### 3. **users** (existing)

- User authentication and profiles

#### 4. **robots** (existing)

- Robot configurations and data

#### 5. **urdffiles** (existing)

- URDF file metadata and content

## 🚀 Setup Steps

### 1. Install Dependencies

```bash
# Backend dependencies (if not already installed)
cd server
npm install multer

# Frontend dependencies (already included)
cd ..
# No additional dependencies needed for frontend
```

### 2. Initialize Database

```bash
# Start your MongoDB service first, then:
cd server

# Run the seed script to create initial data
node scripts/seedDatabase.js
```

### 3. Create Upload Directories

```bash
# From server directory
mkdir -p uploads/career
mkdir -p uploads/urdf
mkdir -p uploads/temp
```

### 4. Start the Application

```bash
# Start backend server
cd server
npm run dev

# Start frontend (in new terminal)
cd ..
npm run dev
```

## 📊 Database Monitoring

### Check Database Status

```javascript
// Connect to MongoDB shell
mongosh

// Use your database
use techligence

// Check collections
show collections

// View career applications
db.careerapplications.find().limit(5)

// View contact forms
db.contactforms.find().limit(5)

// Check indexes
db.careerapplications.getIndexes()
db.contactforms.getIndexes()
```

### Sample Queries

```javascript
// Get application statistics
db.careerapplications.aggregate([
  { $group: { _id: "$status", count: { $sum: 1 } } },
]);

// Get contact form statistics
db.contactforms.aggregate([
  { $group: { _id: "$inquiryType", count: { $sum: 1 } } },
]);

// Find recent applications
db.careerapplications
  .find({
    submittedAt: {
      $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    },
  })
  .sort({ submittedAt: -1 });
```

## 🔒 Security Considerations

### 1. File Upload Security

- File type validation (PDF, DOC, DOCX for resumes)
- File size limits (10MB max)
- Virus scanning (recommended for production)

### 2. Rate Limiting

- Contact form: 1 submission per 5 minutes per email
- Career applications: 1 application per job per 30 days

### 3. Data Validation

- Email format validation
- Required field validation
- Input sanitization

### 4. GDPR Compliance

- User consent tracking
- Data retention policies
- Right to deletion requests

## 📈 Production Deployment

### 1. Environment Variables

```env
NODE_ENV=production
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/techligence
JWT_SECRET=your-production-secret-key
```

### 2. Database Optimization

```javascript
// Create compound indexes for better performance
db.careerapplications.createIndex({ jobTitle: 1, status: 1 });
db.careerapplications.createIndex({ email: 1, submittedAt: -1 });
db.contactforms.createIndex({ inquiryType: 1, status: 1 });
db.contactforms.createIndex({ submittedAt: -1, priority: 1 });
```

### 3. Backup Strategy

```bash
# Regular backups
mongodump --uri "mongodb://localhost:27017/techligence" --out backup/$(date +%Y%m%d)

# Restore if needed
mongorestore --uri "mongodb://localhost:27017/techligence" backup/20240101/techligence/
```

## 🆘 Troubleshooting

### Common Issues:

1. **MongoDB Connection Error:**

   ```
   Error: connect ECONNREFUSED 127.0.0.1:27017
   ```

   - Check if MongoDB service is running
   - Verify connection string in .env

2. **File Upload Fails:**

   ```
   Error: ENOENT: no such file or directory
   ```

   - Create uploads directory: `mkdir -p server/uploads/career`
   - Check file permissions

3. **CORS Issues:**

   - Verify frontend and backend URLs match
   - Check CORS configuration in server.js

4. **Demo Mode Fallback:**
   - If backend is unavailable, forms will work in demo mode
   - Check console for "Backend not available, using demo mode"

## 📞 Support

If you encounter issues:

1. Check the console logs for detailed error messages
2. Verify environment variables are set correctly
3. Ensure MongoDB is running and accessible
4. Test with demo mode first to isolate backend issues

The application includes comprehensive error handling and demo mode fallbacks, so it will continue to work even if the database is temporarily unavailable.

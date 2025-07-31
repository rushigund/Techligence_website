# Techligence API Documentation

## Overview

The Techligence API provides endpoints for managing robotics platform data, user authentication, job applications, product catalog, and ML tool integrations.

**Base URL**: `/api`

## Authentication

Most endpoints require authentication via JWT tokens.

### Headers
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

## Endpoints

### Authentication

#### POST /api/auth/login
Authenticate user and return JWT token.

**Request Body:**
```json
{
  "email": "user@techligence.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user_id",
    "email": "user@techligence.com",
    "name": "John Doe",
    "role": "user"
  }
}
```

#### POST /api/auth/register
Register new user account.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "user@techligence.com",
  "password": "password123"
}
```

#### GET /api/auth/profile
Get current user profile (requires authentication).

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "user_id",
    "email": "user@techligence.com",
    "name": "John Doe",
    "role": "user",
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

### Career Management

#### GET /api/career/jobs
Get list of all job postings.

**Query Parameters:**
- `status` (optional): Filter by status (draft, active, closed)
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "job_id",
      "title": "Robotics Engineer",
      "department": "Engineering",
      "location": "Mumbai, India",
      "type": "Full-time",
      "status": "active",
      "description": "Job description...",
      "requirements": ["Requirement 1", "Requirement 2"],
      "salary": {
        "min": 800000,
        "max": 1200000,
        "currency": "INR"
      },
      "postedAt": "2024-01-01T00:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 50,
    "pages": 5
  }
}
```

#### POST /api/career/jobs
Create new job posting (admin only).

**Request Body:**
```json
{
  "title": "Robotics Engineer",
  "department": "Engineering",
  "location": "Mumbai, India",
  "type": "Full-time",
  "description": "Job description...",
  "requirements": ["Requirement 1", "Requirement 2"],
  "salary": {
    "min": 800000,
    "max": 1200000,
    "currency": "INR"
  }
}
```

#### PUT /api/career/jobs/:id
Update existing job posting (admin only).

#### DELETE /api/career/jobs/:id
Delete job posting (admin only).

#### POST /api/career/apply
Submit job application.

**Request Body (multipart/form-data):**
```
personalInfo: {
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "phone": "+91-9876543210",
  "address": "Mumbai, India"
}
professionalInfo: {
  "experience": "5",
  "education": "Master's Degree",
  "currentSalary": "800000",
  "expectedSalary": "1200000"
}
applicationDetails: {
  "coverLetter": "Dear Hiring Manager...",
  "portfolio": "https://portfolio.com"
}
resume: <file>
portfolio: <file> (optional)
```

**Response:**
```json
{
  "success": true,
  "applicationId": "app_123456",
  "message": "Application submitted successfully"
}
```

#### GET /api/career/applications
Get all job applications (admin only).

**Query Parameters:**
- `jobId` (optional): Filter by job ID
- `status` (optional): Filter by status (pending, reviewed, rejected, accepted)
- `page`, `limit`: Pagination

### Contact Management

#### POST /api/contact/submit
Submit contact form.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "inquiryType": "technical",
  "subject": "Robot control issue",
  "message": "I'm having trouble with...",
  "urgency": "medium"
}
```

**Response:**
```json
{
  "success": true,
  "ticketId": "TCK_123456",
  "message": "Contact form submitted successfully"
}
```

#### GET /api/contact/messages
Get all contact messages (admin only).

**Query Parameters:**
- `status` (optional): Filter by status (open, in-progress, closed)
- `inquiryType` (optional): Filter by inquiry type
- `assignedTo` (optional): Filter by assigned admin

### Product Management

#### GET /api/products
Get product catalog.

**Query Parameters:**
- `category` (optional): Filter by category
- `search` (optional): Search in name/description
- `minPrice`, `maxPrice` (optional): Price range filter
- `inStock` (optional): Filter by stock availability

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "prod_id",
      "name": "4WD Explorer Robot",
      "description": "Advanced autonomous exploration robot",
      "price": 1299900,
      "originalPrice": 1599900,
      "currency": "INR",
      "category": "exploration",
      "inStock": true,
      "stockCount": 25,
      "images": [
        "https://example.com/image1.jpg",
        "https://example.com/image2.jpg"
      ],
      "specifications": {
        "battery": "Li-ion 5000mAh",
        "range": "2km",
        "sensors": ["LiDAR", "Camera", "IMU"]
      },
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

#### POST /api/products
Create new product (admin only).

#### PUT /api/products/:id
Update product (admin only).

#### DELETE /api/products/:id
Delete product (admin only).

### ML Tools Integration

#### POST /api/ml/face-recognition
Process image for face recognition.

**Request Body (multipart/form-data):**
```
image: <file>
options: {
  "detectAge": true,
  "detectEmotion": true,
  "detectGender": true
}
```

**Response:**
```json
{
  "success": true,
  "results": [
    {
      "boundingBox": {
        "x": 100,
        "y": 50,
        "width": 200,
        "height": 250
      },
      "confidence": 0.95,
      "age": {
        "estimated": 28,
        "range": "25-30"
      },
      "gender": {
        "prediction": "male",
        "confidence": 0.89
      },
      "emotion": {
        "primary": "happy",
        "confidence": 0.92,
        "all": {
          "happy": 0.92,
          "neutral": 0.05,
          "sad": 0.02,
          "angry": 0.01
        }
      }
    }
  ],
  "processingTime": 245
}
```

#### POST /api/ml/object-detection
Detect objects in image.

**Request Body (multipart/form-data):**
```
image: <file>
confidence: 0.5
```

**Response:**
```json
{
  "success": true,
  "results": [
    {
      "class": "person",
      "confidence": 0.95,
      "boundingBox": {
        "x": 100,
        "y": 50,
        "width": 200,
        "height": 400
      }
    },
    {
      "class": "car",
      "confidence": 0.87,
      "boundingBox": {
        "x": 300,
        "y": 200,
        "width": 400,
        "height": 200
      }
    }
  ],
  "processingTime": 180
}
```

#### POST /api/ml/depth-estimation
Estimate depth from monocular image.

**Response:**
```json
{
  "success": true,
  "depthMap": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
  "statistics": {
    "minDepth": 0.5,
    "maxDepth": 50.0,
    "averageDepth": 12.3
  },
  "processingTime": 420
}
```

### Robot Control

#### POST /api/robot/control
Send control commands to robot.

**Request Body:**
```json
{
  "robotId": "robot_123",
  "command": "move",
  "parameters": {
    "direction": "forward",
    "speed": 0.5,
    "duration": 2000
  }
}
```

#### GET /api/robot/status/:robotId
Get current robot status.

**Response:**
```json
{
  "success": true,
  "robot": {
    "id": "robot_123",
    "name": "Explorer Bot 1",
    "status": "active",
    "battery": 85,
    "position": {
      "x": 12.5,
      "y": 8.3,
      "rotation": 45
    },
    "sensors": {
      "temperature": 24.5,
      "humidity": 60,
      "altitude": 120.5
    },
    "lastUpdate": "2024-01-01T12:00:00Z"
  }
}
```

#### POST /api/robot/urdf/upload
Upload URDF model file.

**Request Body (multipart/form-data):**
```
urdf: <file>
name: "My Robot Model"
description: "Custom robot model for testing"
```

**Response:**
```json
{
  "success": true,
  "modelId": "model_123",
  "url": "/api/robot/urdf/model_123",
  "statistics": {
    "links": 12,
    "joints": 8,
    "materials": 5,
    "meshes": 15
  }
}
```

## Error Handling

All endpoints return consistent error responses:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input parameters",
    "details": {
      "field": "email",
      "message": "Invalid email format"
    }
  }
}
```

### Common Error Codes

- `VALIDATION_ERROR`: Input validation failed
- `AUTHENTICATION_ERROR`: Invalid or missing authentication
- `AUTHORIZATION_ERROR`: Insufficient permissions
- `NOT_FOUND`: Resource not found
- `RATE_LIMIT_EXCEEDED`: Too many requests
- `INTERNAL_ERROR`: Server error

## Rate Limiting

API endpoints are rate-limited:

- **Authentication**: 5 requests per minute per IP
- **File Upload**: 10 requests per hour per user
- **ML Processing**: 100 requests per hour per user
- **General API**: 1000 requests per hour per user

Rate limit headers:
```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1640995200
```

## Webhooks

### Job Application Events
```
POST https://your-app.com/webhooks/job-application
```

**Payload:**
```json
{
  "event": "application.submitted",
  "data": {
    "applicationId": "app_123",
    "jobId": "job_456",
    "applicant": {
      "name": "John Doe",
      "email": "john@example.com"
    }
  },
  "timestamp": "2024-01-01T12:00:00Z"
}
```

### Robot Status Updates
```
POST https://your-app.com/webhooks/robot-status
```

**Payload:**
```json
{
  "event": "robot.status_changed",
  "data": {
    "robotId": "robot_123",
    "oldStatus": "inactive",
    "newStatus": "active",
    "timestamp": "2024-01-01T12:00:00Z"
  }
}
```

## SDK Examples

### JavaScript/TypeScript
```typescript
import { TechligenceAPI } from '@techligence/api-client';

const api = new TechligenceAPI({
  baseURL: 'https://api.techligence.com',
  apiKey: 'your-api-key'
});

// Get products
const products = await api.products.getAll({
  category: 'exploration',
  inStock: true
});

// Submit job application
const application = await api.career.apply({
  jobId: 'job_123',
  personalInfo: { /* ... */ },
  files: { resume: fileBlob }
});
```

### Python
```python
from techligence_api import TechligenceClient

client = TechligenceClient(
    base_url='https://api.techligence.com',
    api_key='your-api-key'
)

# Face recognition
result = client.ml.face_recognition(
    image_path='path/to/image.jpg',
    detect_age=True,
    detect_emotion=True
)
```

## Testing

### Postman Collection
Download the [Postman collection](./Techligence_API.postman_collection.json) for easy API testing.

### Demo Credentials
```
Admin Login:
- Email: admin@techligence.com
- Password: TechAdmin2024!

Test User:
- Email: demo@techligence.com
- Password: DemoUser123!
```

## Support

For API support:
- **Email**: api-support@techligence.com
- **Documentation**: https://docs.techligence.com
- **Status Page**: https://status.techligence.com

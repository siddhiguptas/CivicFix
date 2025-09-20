# CivicFix Backend API

A robust, scalable backend API for the CivicFix civic issue reporting platform built with Python FastAPI, MongoDB, and AI services.

## 🚀 Features

### Core Functionality
- **User Authentication** - JWT-based auth with role-based access control
- **Grievance Management** - CRUD operations for civic issues
- **AI Integration** - Image analysis and auto-assignment
- **Department Management** - Government department administration
- **Notification System** - Real-time notifications and alerts
- **Chatbot Service** - AI-powered conversational interface

### AI Services
- **Clarifai** - Image analysis and classification
- **Google Gemini** - Natural language processing for chatbot
- **Auto-Assignment** - Smart department routing based on AI analysis

### Database Features
- **MongoDB** - NoSQL database with async Motor driver
- **Indexing** - Optimized queries with proper indexes
- **Geospatial** - Location-based queries and filtering
- **Aggregation** - Complex analytics and reporting

## 🛠️ Tech Stack

- **Framework**: FastAPI (Python 3.11+)
- **Database**: MongoDB with Motor (async driver)
- **Authentication**: JWT with bcrypt hashing
- **AI Services**: Clarifai + Google Gemini
- **Image Storage**: Cloudinary
- **Validation**: Pydantic v2
- **Documentation**: Auto-generated Swagger UI

## 📁 Project Structure

```
backend/
├── app/
│   ├── api/
│   │   └── v1/
│   │       └── endpoints/     # API route handlers
│   │           ├── auth.py    # Authentication endpoints
│   │           ├── grievances.py # Grievance management
│   │           ├── departments.py # Department management
│   │           ├── notifications.py # Notification system
│   │           ├── images.py  # Image upload/analysis
│   │           ├── chatbot.py # AI chatbot
│   │           └── admin.py   # Admin operations
│   ├── core/
│   │   ├── config.py         # Application settings
│   │   ├── database.py       # Database connection
│   │   └── security.py       # Security utilities
│   ├── models/
│   │   ├── user.py          # User data models
│   │   ├── grievance.py     # Grievance data models
│   │   ├── department.py    # Department data models
│   │   └── notification.py  # Notification data models
│   ├── services/
│   │   ├── auth_service.py  # Authentication logic
│   │   ├── ai_service.py    # AI integration
│   │   ├── auto_assignment_service.py # Auto-assignment logic
│   │   └── notification_service.py # Notification handling
│   └── main.py              # FastAPI application
├── requirements.txt         # Python dependencies
├── .env                     # Environment variables
└── README.md               # This file
```

## 🚀 Quick Start

### Prerequisites
- Python 3.11+
- MongoDB (local or Atlas)
- API keys for Clarifai and Google Gemini
- Cloudinary account

### Installation

1. **Clone and navigate to backend**
   ```bash
   cd backend
   ```

2. **Create virtual environment**
   ```bash
   python3 -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Environment setup**
   Create `.env` file:
   ```env
   MONGODB_URL=mongodb+srv://username:password@cluster.mongodb.net/civic_connect?retryWrites=true&w=majority&appName=Cluster0&tls=true&tlsAllowInvalidCertificates=true
   CLARIFAI_API_KEY=your_clarifai_api_key
   GOOGLE_API_KEY=your_google_gemini_api_key
   CLOUDINARY_CLOUD_NAME=your_cloudinary_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_secret
   SECRET_KEY=your_jwt_secret_key_here
   ALGORITHM=HS256
   ACCESS_TOKEN_EXPIRE_MINUTES=30
   ```

5. **Start the server**
   ```bash
   python3 -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

6. **Access API documentation**
   - Swagger UI: `http://localhost:8000/docs`
   - ReDoc: `http://localhost:8000/redoc`

## 🔐 Authentication

### JWT Token System
- **Access Token**: 30-minute expiry
- **Refresh Token**: 7-day expiry
- **Algorithm**: HS256
- **Storage**: HTTP-only cookies (recommended) or localStorage

### User Roles
- **Citizen**: Report issues, track grievances
- **Department Head**: Manage assigned grievances
- **Admin**: Full system access

### Demo Users
```python
# Auto-created demo users
citizen@demo.com / password123 (Citizen)
admin@demo.com / password123 (Admin)

# Department Head Users (7 Total)
head1@demo.com / password123 (PWD Head)
head2@demo.com / password123 (Municipal Head)
head3@demo.com / password123 (Electricity Head)
head4@demo.com / password123 (Transport Head)
head5@demo.com / password123 (Water Head)
head6@demo.com / password123 (Police Head)
head7@demo.com / password123 (Environment Head)
```

## 📊 API Endpoints

### Authentication (`/api/v1/auth/`)
- `POST /register` - User registration
- `POST /login` - User login
- `GET /me` - Get current user
- `POST /create-demo-users` - Create demo accounts

### Grievances (`/api/v1/grievances/`)
- `POST /` - Create new grievance
- `GET /` - List grievances (with filters)
- `GET /{id}` - Get specific grievance
- `PUT /{id}` - Update grievance
- `PUT /{id}/status` - Update grievance status
- `PUT /{id}/assign-department` - Assign to department

### Departments (`/api/v1/departments/`)
- `GET /` - List all departments
- `POST /` - Create department (Admin only)
- `GET /{id}` - Get specific department
- `PUT /{id}` - Update department (Admin only)
- `DELETE /{id}` - Delete department (Admin only)
- `POST /initialize` - Initialize default departments
- `GET /{id}/grievances` - Get department's grievances
- `GET /{id}/stats` - Get department statistics

### Notifications (`/api/v1/notifications/`)
- `GET /` - List user notifications
- `PUT /{id}/read` - Mark notification as read
- `DELETE /{id}` - Delete notification

### Images (`/api/v1/images/`)
- `POST /upload` - Upload image to Cloudinary
- `POST /analyze` - Analyze image with AI

### Chatbot (`/api/v1/chatbot/`)
- `POST /message` - Send message to AI chatbot

### Admin (`/api/v1/admin/`)
- `GET /grievances` - Get all grievances (Admin only)
- `GET /users` - Get all users (Admin only)
- `PUT /grievances/{id}/assign` - Assign grievance to department

## 🤖 AI Integration

### Image Analysis (Clarifai)
```python
# Analyze uploaded image
analysis = await ai_service.analyze_image(image_bytes)
# Returns: category, confidence, suggested_department, tags
```

### Auto-Assignment Logic
```python
# Auto-assign grievance based on AI analysis
result = await auto_assignment_service.analyze_and_assign_grievance(
    grievance_id=grievance_id,
    images=images,
    title=title,
    description=description,
    citizen_name=citizen_name,
    db=database
)
```

### Chatbot (Google Gemini)
```python
# Generate AI response
response = await ai_service.generate_response(
    message=user_message,
    context=conversation_context
)
```

## 🗄️ Database Schema

### Users Collection
```json
{
  "_id": "ObjectId",
  "email": "user@example.com",
  "hashed_password": "bcrypt_hash",
  "full_name": "John Doe",
  "phone": "+1234567890",
  "role": "citizen|admin|department_head",
  "department": "Municipal Corporation",
  "is_verified": true,
  "created_at": "2024-01-01T00:00:00Z",
  "last_login": "2024-01-01T00:00:00Z"
}
```

### Grievances Collection
```json
{
  "_id": "ObjectId",
  "citizen_id": "user_id",
  "title": "Pothole on Main Street",
  "description": "Large pothole causing traffic issues",
  "category": "infrastructure",
  "priority": "high",
  "status": "pending|in_progress|resolved|rejected",
  "location": {
    "coordinates": [longitude, latitude],
    "address": "Main Street, City"
  },
  "images": ["cloudinary_url1", "cloudinary_url2"],
  "assigned_department": "Public Works Department (PWD)",
  "ai_analysis": {
    "category": "infrastructure",
    "confidence": 0.85,
    "suggested_department": "Public Works Department (PWD)",
    "tags": ["pothole", "road", "damage"]
  },
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

### Departments Collection
```json
{
  "_id": "ObjectId",
  "name": "Public Works Department (PWD)",
  "description": "Handles roads, bridges, public infrastructure",
  "contact_email": "pwd@civicfix.com",
  "contact_phone": "+91-11-23456789",
  "head_name": "Chief Engineer PWD",
  "categories": ["infrastructure", "roads", "bridges"],
  "status": "active|inactive",
  "created_at": "2024-01-01T00:00:00Z"
}
```

## 🔧 Configuration

### Environment Variables
```env
# Database
MONGODB_URL=mongodb+srv://...

# AI Services
CLARIFAI_API_KEY=your_clarifai_key
GOOGLE_API_KEY=your_gemini_key

# Image Storage
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Security
SECRET_KEY=your_jwt_secret
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# CORS
ALLOWED_ORIGINS=http://localhost:3000,https://your-frontend.com
```

### Database Indexes
```python
# Users
users.create_index([("email", 1)], unique=True)
users.create_index([("phone", 1)], unique=True, sparse=True)

# Grievances
grievances.create_index([("citizen_id", 1)])
grievances.create_index([("status", 1)])
grievances.create_index([("category", 1)])
grievances.create_index([("priority", 1)])
grievances.create_index([("created_at", 1)])
grievances.create_index([("location.coordinates", "2dsphere")])

# Notifications
notifications.create_index([("user_id", 1)])
notifications.create_index([("created_at", 1)])

# Departments
departments.create_index([("name", 1)], unique=True)
```

## 🧪 Testing

### Run Tests
```bash
# Install test dependencies
pip install pytest pytest-asyncio httpx

# Run tests
pytest tests/

# Run with coverage
pytest --cov=app tests/
```

### Test Database
```python
# Use test database for testing
MONGODB_URL=mongodb://localhost:27017/civic_connect_test
```

## 📈 Performance

### Optimization Features
- **Async/Await** - Non-blocking I/O operations
- **Connection Pooling** - Efficient database connections
- **Caching** - Redis caching for frequent queries
- **Indexing** - Optimized database indexes
- **Pagination** - Efficient data pagination

### Monitoring
- **Health Check** - `/health` endpoint
- **Metrics** - Request/response timing
- **Logging** - Structured logging with levels
- **Error Tracking** - Comprehensive error handling

## 🚀 Deployment

### Production Setup
```bash
# Install production dependencies
pip install -r requirements.txt

# Set production environment
export ENVIRONMENT=production

# Start with Gunicorn
gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

### Docker Deployment
```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Environment Variables (Production)
```env
MONGODB_URL=production_mongodb_url
CLARIFAI_API_KEY=production_clarifai_key
GOOGLE_API_KEY=production_gemini_key
CLOUDINARY_CREDENTIALS=production_cloudinary_creds
SECRET_KEY=production_jwt_secret
ALLOWED_ORIGINS=https://your-frontend.com
```

## 🔒 Security

### Authentication Security
- **JWT Tokens** - Secure token-based authentication
- **Password Hashing** - bcrypt with salt rounds
- **Token Expiry** - Short-lived access tokens
- **Role-based Access** - Granular permission system

### API Security
- **CORS** - Configured for specific origins
- **Rate Limiting** - Request rate limiting
- **Input Validation** - Pydantic model validation
- **SQL Injection** - MongoDB prevents SQL injection
- **XSS Protection** - Input sanitization

### Data Security
- **Encryption** - Sensitive data encryption
- **Environment Variables** - Secure credential storage
- **HTTPS** - SSL/TLS encryption in production
- **Database Security** - MongoDB Atlas security features

## 📊 Monitoring & Logging

### Logging Configuration
```python
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
```

### Health Checks
- **Database Connection** - MongoDB connectivity
- **External Services** - Clarifai, Google Gemini, Cloudinary
- **Memory Usage** - System resource monitoring
- **Response Time** - API performance metrics

## 🤝 Contributing

### Development Setup
1. Fork the repository
2. Create feature branch
3. Install dependencies
4. Make changes
5. Run tests
6. Submit pull request

### Code Standards
- **Type Hints** - Full type annotation
- **Docstrings** - Comprehensive documentation
- **Error Handling** - Proper exception handling
- **Logging** - Structured logging
- **Testing** - Unit and integration tests

## 📞 Support

### Documentation
- **API Docs** - Auto-generated Swagger UI
- **Code Comments** - Inline documentation
- **README** - Comprehensive setup guide

### Contact
- **Issues** - GitHub Issues for bug reports
- **Discussions** - GitHub Discussions for questions
- **Email** - support@civicfix.com

---

**CivicFix Backend API** - Robust, scalable backend powering civic engagement through technology.

*Built for Smart India Hackathon 2024*
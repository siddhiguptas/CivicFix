# Civic Connect

A comprehensive civic issue reporting and management platform that enables citizens to report municipal problems and allows government departments to efficiently track, assign, and resolve these issues.

## Overview

Civic Connect streamlines the process of reporting and managing civic issues by providing a unified platform for citizens, department heads, and administrators. The system uses AI-powered categorization and automatic assignment to ensure issues reach the appropriate government departments quickly and efficiently.

## Key Features

### For Citizens
- Report civic issues with detailed descriptions and photo evidence
- Track the status and progress of submitted grievances
- Receive real-time notifications about issue updates
- Access AI-powered chatbot for assistance
- View location-based issue mapping

### For Department Heads
- Manage grievances assigned to their department
- Update issue status and add resolution notes
- View department-specific analytics and performance metrics
- Access real-time notifications about new assignments
- Track resolution timelines and citizen satisfaction

### For Administrators
- Full system oversight and management
- User account management and role assignment
- Department creation and configuration
- System-wide analytics and reporting
- Grievance assignment and reassignment
- Performance monitoring across all departments

## Technical Architecture

### Frontend
- **Framework**: Next.js 15 with TypeScript
- **Styling**: Tailwind CSS with shadcn/ui components
- **State Management**: React Hooks and Context API
- **Authentication**: JWT-based with role-based access control
- **Maps**: React Leaflet for location services
- **Forms**: React Hook Form with Zod validation

### Backend
- **Framework**: FastAPI with Python 3.11+
- **Database**: MongoDB with Motor async driver
- **Authentication**: JWT tokens with password hashing
- **AI Integration**: Google Gemini for chatbot, Clarifai for image analysis
- **File Storage**: Cloudinary for image management
- **API Documentation**: Auto-generated with FastAPI

### AI Features
- **Smart Categorization**: Automatic issue classification based on content and images
- **Department Assignment**: AI-powered routing to appropriate government departments
- **Priority Assessment**: Automatic priority level determination
- **Chatbot Support**: Natural language processing for user assistance

## System Requirements

### Development Environment
- Node.js 18+ (Frontend)
- Python 3.11+ (Backend)
- MongoDB 6.0+
- Git

### Production Environment
- Node.js 18+ with PM2 or similar process manager
- Python 3.11+ with Gunicorn or Uvicorn
- MongoDB 6.0+ with replica set configuration
- Nginx or similar reverse proxy
- SSL certificates for HTTPS

## Installation and Setup

### Prerequisites
- Node.js and npm installed
- Python 3.11+ installed
- MongoDB running locally or accessible remotely
- Git for version control

### Backend Setup
1. Navigate to the backend directory
2. Create a virtual environment
3. Install dependencies
4. Configure environment variables
5. Initialize the database with demo data
6. Start the development server

### Frontend Setup
1. Navigate to the frontend directory
2. Install dependencies
3. Configure environment variables
4. Start the development server

### Database Initialization
Run the setup script to create demo users, departments, and sample grievances for testing purposes.

## User Roles and Permissions

### Citizen
- Create and submit new grievances
- View personal grievance history
- Update pending grievances
- Access chatbot and help resources
- Receive notifications about status changes

### Department Head
- View grievances assigned to their department
- Update grievance status and add resolution notes
- Access department-specific analytics
- Manage department performance metrics
- Receive notifications about new assignments

### Administrator
- Full system access and management
- Create and manage user accounts
- Configure departments and their settings
- View system-wide analytics and reports
- Assign and reassign grievances
- Monitor overall system performance

## API Endpoints

### Authentication
- POST /api/v1/auth/register - User registration
- POST /api/v1/auth/login - User login
- GET /api/v1/auth/me - Get current user info

### Grievances
- GET /api/v1/grievances/ - List grievances
- POST /api/v1/grievances/ - Create new grievance
- GET /api/v1/grievances/{id} - Get specific grievance
- PUT /api/v1/grievances/{id} - Update grievance

### Admin Operations
- GET /api/v1/admin/grievances - List all grievances
- PUT /api/v1/admin/grievances/{id}/status - Update grievance status
- PUT /api/v1/admin/grievances/{id}/assign - Assign grievance to department

### Department Management
- GET /api/v1/departments/ - List departments
- POST /api/v1/departments/ - Create department
- GET /api/v1/departments/{id}/grievances - Get department grievances

## Configuration

### Environment Variables

#### Backend (.env)
- MONGODB_URL - MongoDB connection string
- SECRET_KEY - JWT secret key
- CLOUDINARY_CLOUD_NAME - Cloudinary cloud name
- CLOUDINARY_API_KEY - Cloudinary API key
- CLOUDINARY_API_SECRET - Cloudinary API secret
- GEMINI_API_KEY - Google Gemini API key
- CLARIFAI_API_KEY - Clarifai API key

#### Frontend (.env.local)
- NEXT_PUBLIC_API_URL - Backend API URL
- NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME - Cloudinary cloud name

## Deployment

### Backend Deployment
1. Set up production environment variables
2. Configure MongoDB replica set
3. Deploy using Docker or direct server deployment
4. Set up process management with PM2 or similar
5. Configure reverse proxy with Nginx

### Frontend Deployment
1. Build the production bundle
2. Deploy to static hosting or server
3. Configure environment variables
4. Set up CDN for static assets
5. Configure domain and SSL certificates

## Security Features

- JWT-based authentication with secure token handling
- Password hashing using bcrypt
- Role-based access control (RBAC)
- Input validation and sanitization
- CORS configuration for API security
- Environment variable protection
- Secure file upload handling

## Monitoring and Logging

- Application logging with structured log format
- Error tracking and monitoring
- Performance metrics collection
- User activity logging
- System health checks

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For technical support or questions about the platform, please contact the development team or create an issue in the repository.

## Changelog

### Version 1.0.0
- Initial release with core functionality
- User authentication and role management
- Grievance reporting and tracking
- AI-powered categorization and assignment
- Department management system
- Real-time notifications
- Admin dashboard and analytics

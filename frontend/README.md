# CivicFix

A modern, responsive frontend for the CivicFix civic issue reporting platform built with Next.js 14, TypeScript, and Tailwind CSS.

## 🚀 Features

### Core Functionality
- **User Authentication** - Login, registration, and role-based access control
- **Issue Reporting** - AI-powered grievance creation with image upload
- **Real-time Tracking** - Track grievance status and progress
- **Department Management** - Admin interface for managing government departments
- **AI Chatbot** - Intelligent assistant for user support
- **Notification System** - Real-time updates and alerts
- **Admin Dashboard** - Comprehensive management interface

### User Roles
- **Citizen** - Report issues, track grievances, use chatbot
- **Department Head** - Manage assigned grievances, update status
- **Admin** - Full system access, user management, department management

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **State Management**: React Hooks + Context
- **HTTP Client**: Axios
- **Form Handling**: React Hook Form + Zod
- **Notifications**: Sonner
- **Icons**: Lucide React

## 📁 Project Structure

```
frontend/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── dashboard/          # Dashboard pages
│   │   │   ├── admin/          # Admin-specific pages
│   │   │   │   └── departments/ # Department management
│   │   │   ├── grievances/     # Grievance management
│   │   │   │   └── [id]/       # Individual grievance details
│   │   │   ├── notifications/  # Notification center
│   │   │   └── chatbot/        # AI chatbot interface
│   │   ├── login/              # Authentication pages
│   │   ├── register/
│   │   └── layout.tsx          # Root layout
│   ├── components/             # Reusable UI components
│   │   └── ui/                 # shadcn/ui components
│   ├── lib/                    # Utility libraries
│   │   ├── api.ts             # API configuration
│   │   ├── auth.ts            # Authentication service
│   │   ├── grievances.ts      # Grievance service
│   │   ├── notifications.ts   # Notification service
│   │   ├── chatbot.ts         # Chatbot service
│   │   └── images.ts          # Image handling service
│   └── hooks/                  # Custom React hooks
├── public/                     # Static assets
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── next.config.mjs
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or pnpm
- Backend API running on `http://localhost:8000`

### Installation

1. **Install dependencies**
   ```bash
   npm install
   # or
   pnpm install
   ```

2. **Environment Setup**
   Create `.env.local` file:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:8000
   NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloudinary_name
   NEXT_PUBLIC_CLOUDINARY_API_KEY=your_cloudinary_key
   ```

3. **Start development server**
   ```bash
   npm run dev
   # or
   pnpm dev
   ```

4. **Open in browser**
   Navigate to `http://localhost:3000`

## 🔐 Authentication

### Demo Accounts

#### Citizen Account
- **Email**: `citizen@demo.com`
- **Password**: `password123`
- **Role**: Citizen
- **Permissions**: Report issues, track grievances, use chatbot

#### Department Head Accounts (7 Total)
- **PWD Head**: `head1@demo.com` / `password123` - Public Works Department (PWD)
- **Municipal Head**: `head2@demo.com` / `password123` - Municipal Corporation
- **Electricity Head**: `head3@demo.com` / `password123` - Electricity Department
- **Transport Head**: `head4@demo.com` / `password123` - Transport Department
- **Water Head**: `head5@demo.com` / `password123` - Water Supply Department
- **Police Head**: `head6@demo.com` / `password123` - Police Department
- **Environment Head**: `head7@demo.com` / `password123` - Environment Department

**Permissions**: Manage assigned grievances, update status, view department stats

#### Admin Account
- **Email**: `admin@demo.com`
- **Password**: `password123`
- **Role**: Admin
- **Permissions**: Full system access, user management, department management

### Registration
New users can register with:
- Full name
- Email address
- Password
- Phone number (optional)
- Role selection (Citizen, Admin, Department Head)

## 📱 Pages & Features

### Public Pages
- **Home** (`/`) - Landing page with redirect to dashboard
- **Login** (`/login`) - User authentication
- **Register** (`/register`) - User registration

### Dashboard Pages
- **Dashboard** (`/dashboard`) - Main dashboard with overview
- **My Grievances** (`/dashboard/grievances`) - User's reported issues
- **Report Issue** (`/dashboard/grievances/new`) - Create new grievance
- **Notifications** (`/dashboard/notifications`) - Notification center
- **Chatbot** (`/dashboard/chatbot`) - AI assistant

### Admin Pages
- **Admin Panel** (`/dashboard/admin`) - System overview
- **Department Management** (`/dashboard/admin/departments`) - Manage departments
- **User Management** (`/dashboard/admin/users`) - User administration

## 🤖 AI Features

### Auto-Assignment
- **Image Analysis** - AI analyzes uploaded images to categorize issues
- **Department Suggestion** - Automatically suggests appropriate department
- **Real-time Feedback** - Shows AI analysis during grievance creation

### Chatbot
- **Contextual Help** - Provides relevant assistance based on user role
- **Quick Actions** - Pre-defined common questions and actions
- **Chat History** - Persistent conversation history

## 🎨 UI Components

### Design System
- **Modern Design** - Clean, professional interface
- **Responsive Layout** - Mobile-first design approach
- **Dark/Light Mode** - Theme switching capability
- **Accessibility** - WCAG compliant components

### Key Components
- **Cards** - Information display containers
- **Forms** - Validation-enabled input forms
- **Modals** - Dialog boxes for actions
- **Tables** - Data display with sorting/filtering
- **Charts** - Data visualization components

## 🔧 API Integration

### Endpoints
- **Authentication** - Login, register, user management
- **Grievances** - CRUD operations for civic issues
- **Departments** - Department management
- **Notifications** - Real-time notifications
- **Images** - File upload and processing
- **Chatbot** - AI conversation handling

### Error Handling
- **Global Error Boundary** - Catches and displays errors
- **API Error Interceptors** - Handles authentication errors
- **Toast Notifications** - User-friendly error messages

## 📊 State Management

### Authentication State
- **Persistent Login** - Maintains session across page refreshes
- **Role-based Access** - Controls page and feature access
- **Token Management** - Automatic token refresh and cleanup

### Application State
- **Local State** - React hooks for component state
- **Context API** - Global state for user and theme
- **Local Storage** - Persistent data storage

## 🚀 Deployment

### Build for Production
```bash
npm run build
npm start
```

### Environment Variables
```env
NEXT_PUBLIC_API_URL=https://your-api-domain.com
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloudinary_name
NEXT_PUBLIC_CLOUDINARY_API_KEY=your_cloudinary_key
```

### Deployment Platforms
- **Vercel** (Recommended)
- **Netlify**
- **AWS Amplify**
- **Docker**

## 🧪 Testing

### Available Scripts
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript checks
```

## 📈 Performance

### Optimizations
- **Code Splitting** - Automatic route-based splitting
- **Image Optimization** - Next.js Image component
- **Bundle Analysis** - Webpack bundle analyzer
- **Lazy Loading** - Component and route lazy loading

### Metrics
- **Lighthouse Score** - 90+ performance rating
- **Core Web Vitals** - Optimized for user experience
- **Bundle Size** - Minimized JavaScript bundle

## 🔒 Security

### Authentication
- **JWT Tokens** - Secure token-based authentication
- **Role-based Access** - Granular permission system
- **Session Management** - Automatic token refresh

### Data Protection
- **Input Validation** - Client and server-side validation
- **XSS Protection** - Sanitized user inputs
- **CSRF Protection** - Cross-site request forgery prevention

## 🤝 Contributing

### Development Workflow
1. Fork the repository
2. Create feature branch
3. Make changes
4. Run tests
5. Submit pull request

### Code Standards
- **TypeScript** - Strict type checking
- **ESLint** - Code linting and formatting
- **Prettier** - Code formatting
- **Conventional Commits** - Commit message standards

## 📞 Support

### Documentation
- **API Documentation** - Backend API reference
- **Component Library** - UI component documentation
- **Deployment Guide** - Production deployment steps

### Contact
- **Issues** - GitHub Issues for bug reports
- **Discussions** - GitHub Discussions for questions
- **Email** - support@civicfix.com

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**CivicFix Frontend** - Empowering citizens to report and track civic issues with modern technology and AI assistance.
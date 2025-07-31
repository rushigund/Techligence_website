# Techligence - Advanced Robotics Platform

![Techligence Logo](https://cdn.builder.io/api/v1/image/assets%2F19ea23aafe364ba794f4649330baa0f9%2F6ab4735d62b8469981e63420c42401fc?format=webp&width=800)

A cutting-edge robotics platform featuring AI-powered robot control, URDF model visualization, machine learning tools, and comprehensive business management capabilities.

## 🚀 Live Demo

- **Website**: [Techligence Platform](https://1d73393cf5534c6389e784ac329dd71b-53ee12730e474220b7afcf297.fly.dev/)
- **Admin Panel**: `/admin/login` (Demo credentials available on login page)

## 📋 Table of Contents

- [Features](#features)
- [Technology Stack](#technology-stack)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Key Features](#key-features)
- [API Documentation](#api-documentation)
- [Deployment](#deployment)
- [Environment Variables](#environment-variables)
- [User Guides](#user-guides)
- [Developer Guides](#developer-guides)
- [Contributing](#contributing)
- [License](#license)

## ✨ Features

### 🤖 Core Robotics Features
- **R.T. Controller**: Hand gesture recognition for robot control
- **URDF Model Support**: Upload and visualize robot models in 3D
- **Real-time Control**: WebRTC-based robot communication
- **Camera Integration**: Live video feed with gesture detection

### 🧠 Machine Learning Tools
- **Face Recognition**: AI-powered facial detection and analysis
- **Depth Estimation**: 3D depth perception from monocular cameras
- **Age Estimation**: Automated demographic analysis
- **Activity Recognition**: Human pose and activity detection
- **Emotion Detection**: Real-time emotional state analysis
- **Object Detection**: 80+ object classes identification

### 💼 Business Management
- **Product Catalog**: Complete e-commerce integration
- **Career Management**: Job posting and application system
- **Blog System**: Content management with categories
- **Contact Forms**: Multi-type inquiry handling
- **Admin Dashboard**: Comprehensive business analytics

### 🎨 Modern UI/UX
- **Responsive Design**: Mobile-first approach
- **Dark/Light Mode**: Theme switching support
- **Accessible**: WCAG 2.1 compliant
- **Progressive Web App**: Offline functionality
- **Real-time Updates**: Live data synchronization

## 🛠 Technology Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for build tooling
- **Tailwind CSS** for styling
- **Shadcn/ui** component library
- **React Router** for navigation
- **TanStack Query** for data management
- **Zustand** for state management

### Backend Integration
- **Express.js** API server
- **MongoDB** database
- **Multer** for file uploads
- **Rate limiting** and security middleware

### AI/ML Technologies
- **MediaPipe** for gesture recognition
- **TensorFlow.js** for client-side ML
- **Computer Vision** APIs
- **WebRTC** for real-time communication

### Development Tools
- **ESLint** and **Prettier** for code quality
- **Husky** for git hooks
- **Jest** for testing
- **Docker** for containerization

## 🚀 Getting Started

### Prerequisites
- Node.js 18.0.0 or higher
- npm or yarn package manager
- Git for version control

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd techligence-platform
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your configuration
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open browser**
   ```
   http://localhost:5173
   ```

### Quick Start Commands

```bash
# Development
npm run dev              # Start dev server
npm run build           # Build for production
npm run preview         # Preview production build
npm run lint            # Run ESLint
npm run type-check      # TypeScript type checking

# Backend (if running locally)
npm run server          # Start backend server
npm run seed            # Seed database with demo data
```

## 📁 Project Structure

```
techligence-platform/
├── public/                 # Static assets
│   ├── robots.txt
│   ├── .htaccess          # Apache configuration
│   └── favicon.ico
├── src/
│   ├── components/        # React components
│   │   ├── ui/           # Shadcn/ui components
│   │   ├── admin/        # Admin-specific components
│   │   ├── Navigation.tsx
│   │   ├── RobotModel3D.tsx
│   │   └── ...
│   ├── pages/            # Route components
│   │   ├── Index.tsx     # Homepage
│   │   ├── RobotLab.tsx  # Robot Lab with sidebar
│   │   ├── Products.tsx  # Product catalog
│   │   ├── Controller.tsx # Robot controller
│   │   ├── AdminDashboard.tsx
│   │   └── ...
│   ├── hooks/            # Custom React hooks
│   │   ├── useGestureRecognition.ts
│   │   ├── useFallbackGesture.ts
│   │   └── ...
│   ├── services/         # API services
│   │   ├── api.ts        # Main API client
│   │   ├── urdfLoader.ts # URDF file processing
│   │   └── ...
│   ├── store/            # State management
│   │   ├── cartStore.ts  # Shopping cart
│   │   └── ...
│   ├── contexts/         # React contexts
│   │   └── AuthContext.tsx
│   ├── lib/              # Utilities
│   │   ├── utils.ts      # Helper functions
│   │   └── ...
│   └── types/            # TypeScript definitions
├── server/               # Backend server
│   ├── models/           # Database models
│   ├── routes/           # API routes
│   ├── middleware/       # Express middleware
│   └── server.js         # Main server file
├── docs/                 # Documentation
├── .env.example          # Environment template
├── .env.production       # Production environment
├── .env.hostinger        # Hostinger deployment
├── package.json
├── vite.config.ts        # Vite configuration
├── tailwind.config.ts    # Tailwind configuration
└── tsconfig.json         # TypeScript configuration
```

## 🎯 Key Features

### Robot Lab
The Robot Lab is the centerpiece of the platform, featuring:

- **Sidebar Navigation**: Hover and fixed modes
- **Tool Switching**: Seamless navigation between ML tools
- **R.T. Controller Integration**: Direct access to robot control
- **Real-time Processing**: Live camera feeds and analysis

### Admin System
Comprehensive business management:

- **Dashboard Analytics**: Real-time metrics and KPIs
- **Job Management**: CRUD operations for career postings
- **Product Catalog**: Inventory and pricing management
- **Application Tracking**: Candidate management system

### E-commerce Integration
Full shopping experience:

- **Product Catalog**: ₹-based pricing (Indian Rupees)
- **Shopping Cart**: Persistent cart with Zustand
- **Checkout Process**: Integrated payment flow
- **Order Management**: Admin order tracking

## 📖 API Documentation

### Authentication Endpoints
```
POST /api/auth/login     # User login
POST /api/auth/logout    # User logout
POST /api/auth/register  # User registration
GET  /api/auth/profile   # Get user profile
```

### Career Management
```
GET    /api/career/jobs           # List all jobs
POST   /api/career/jobs           # Create new job
PUT    /api/career/jobs/:id       # Update job
DELETE /api/career/jobs/:id       # Delete job
POST   /api/career/apply          # Submit application
GET    /api/career/applications   # List applications (admin)
```

### Contact Forms
```
POST /api/contact/submit          # Submit contact form
GET  /api/contact/messages        # Get messages (admin)
PUT  /api/contact/messages/:id    # Update message status
```

### Product Management
```
GET    /api/products              # List products
POST   /api/products              # Create product (admin)
PUT    /api/products/:id          # Update product (admin)
DELETE /api/products/:id          # Delete product (admin)
```

## 🚀 Deployment

### Vercel Deployment

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Deploy**
   ```bash
   vercel
   ```

3. **Environment Variables**
   Set in Vercel dashboard:
   - `VITE_DEMO_MODE=true`
   - `VITE_API_URL=/api`

### Hostinger Deployment

1. **Build the project**
   ```bash
   npm run build
   ```

2. **Upload dist folder contents** to `public_html/`

3. **Configure .htaccess** (already included in `public/`)

### Docker Deployment

```bash
# Build image
docker build -t techligence-platform .

# Run container
docker run -p 3000:3000 techligence-platform
```

## 🔧 Environment Variables

### Development (.env.local)
```env
VITE_DEMO_MODE=false
VITE_API_URL=http://localhost:3001/api
VITE_MONGODB_URI=mongodb://localhost:27017/techligence
```

### Production (.env.production)
```env
VITE_DEMO_MODE=true
VITE_API_URL=/api
VITE_PUBLIC_URL=https://your-domain.com
```

## 👥 User Guides

### For End Users

#### Using the Robot Controller
1. Navigate to **Robot Lab** → **R.T. Controller**
2. Allow camera permissions when prompted
3. Upload URDF file or use default robot
4. Use hand gestures to control robot movements
5. Monitor robot status in real-time

#### Exploring ML Tools
1. Go to **Robot Lab** from main navigation
2. Use sidebar to switch between tools:
   - **Face Recognition**: Upload images or use live camera
   - **Depth Estimation**: Analyze spatial depth
   - **Emotion Detection**: Real-time emotion analysis
   - **Object Detection**: Identify objects in images

### For Administrators

#### Accessing Admin Panel
1. Navigate to `/admin/login`
2. Use demo credentials or your admin account
3. Access dashboard for analytics and management

#### Managing Jobs
1. Go to **Admin Dashboard** → **Job Management**
2. Create, edit, or delete job postings
3. Review and manage applications
4. Update job status (draft/active/closed)

#### Product Management
1. Access **Product Management** tab
2. Add new products with pricing in ₹
3. Manage inventory and stock levels
4. Update product descriptions and images

## 🔨 Developer Guides

### Adding New ML Tools

1. **Create component in RobotLab.tsx**
   ```tsx
   const NewTool = () => (
     <div className="space-y-6">
       {/* Tool interface */}
     </div>
   );
   ```

2. **Add to tools array**
   ```tsx
   const tools = [
     // ... existing tools
     {
       id: "new-tool",
       name: "New Tool",
       icon: YourIcon,
       component: NewTool,
       category: "ML Tools",
     },
   ];
   ```

### Custom Hooks

#### useGestureRecognition
```tsx
const {
  videoRef,
  canvasRef,
  isInitialized,
  isLoading,
  error,
  initializeCamera,
  stopCamera,
  gesture
} = useGestureRecognition();
```

#### useAuth
```tsx
const {
  user,
  isAuthenticated,
  login,
  logout,
  isLoading
} = useAuth();
```

### State Management

#### Cart Store (Zustand)
```tsx
import { useCartStore } from '@/store/cartStore';

const { items, addItem, removeItem, clearCart } = useCartStore();
```

### API Integration

#### Using TanStack Query
```tsx
import { useQuery, useMutation } from '@tanstack/react-query';

const { data, isLoading, error } = useQuery({
  queryKey: ['products'],
  queryFn: () => api.products.getAll()
});
```

## 🧪 Testing

### Running Tests
```bash
npm run test              # Run all tests
npm run test:watch        # Watch mode
npm run test:coverage     # Coverage report
```

### Test Structure
```
src/
├── __tests__/           # Test files
│   ├── components/      # Component tests
│   ├── hooks/          # Hook tests
│   ├── utils/          # Utility tests
│   └── integration/    # Integration tests
```

## 📈 Performance

### Optimization Features
- **Code Splitting**: Route-based splitting
- **Lazy Loading**: Component lazy loading
- **Image Optimization**: WebP format support
- **Caching**: Service worker for offline support
- **Bundle Analysis**: Built-in analyzer

### Performance Monitoring
- **Web Vitals**: Core metrics tracking
- **Error Boundary**: Graceful error handling
- **Loading States**: Skeleton screens
- **Infinite Scroll**: Optimized list rendering

## 🔒 Security

### Frontend Security
- **CSP Headers**: Content Security Policy
- **XSS Protection**: Input sanitization
- **HTTPS**: Enforced secure connections
- **Rate Limiting**: API request limiting

### Backend Security
- **Authentication**: JWT-based auth
- **Authorization**: Role-based access
- **Input Validation**: Request validation
- **File Upload**: Secure file handling

## 🤝 Contributing

### Development Workflow
1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open Pull Request

### Code Standards
- **ESLint**: Code linting
- **Prettier**: Code formatting
- **TypeScript**: Type safety
- **Conventional Commits**: Commit message format

### Pull Request Process
1. Ensure all tests pass
2. Update documentation
3. Add changeset if needed
4. Request review from maintainers

## 📝 Changelog

### v2.0.0 (Latest)
- ✨ Complete rebranding to Techligence
- 🤖 Robot Lab with sidebar navigation
- 🧠 ML Tools integration
- 👑 Admin dashboard system
- 💰 Indian Rupee pricing
- 📱 Mobile-responsive design

### v1.5.0
- 🎮 URDF model support
- 👋 Hand gesture recognition
- 📝 Blog system
- 💼 Career management

### v1.0.0
- 🚀 Initial release
- 🛍️ E-commerce platform
- 📞 Contact forms
- 🎨 Modern UI design

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

- **Email**: support@techligence.com
- **Documentation**: `/support`
- **Issues**: GitHub Issues
- **Community**: Discord Server

## 🙏 Acknowledgments

- **MediaPipe** for gesture recognition
- **Shadcn/ui** for beautiful components
- **Vercel** for hosting platform
- **Contributors** who made this project possible

---

**Built with ❤️ by the Techligence Team**

© 2024 Techligence. All rights reserved.

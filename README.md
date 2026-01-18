# Grocery Store Application

A full-stack grocery store application built with React.js (frontend) and Node.js/Express (backend), featuring product management, shopping cart, payment integration with Stripe, and role-based user management.

## 🚀 Features

- **Product Management**: Browse products with categories, search, and filters
- **Shopping Cart**: Add to cart, update quantities, checkout flow
- **Payment Integration**: Stripe payment processing (test mode)
- **User Authentication**: Login, registration, JWT-based authentication
- **Role-Based Access**: Admin, Manager, Employee, and Customer roles
- **Order Management**: Order history, order tracking, cancellation
- **Liked Products**: Save favorite products
- **AI Protein Plan Bot**: AI-powered protein plan suggestions
- **Admin Dashboard**: Product management, user management, order tracking

## 📋 Tech Stack

### Frontend
- React.js 18
- React Router DOM
- Tailwind CSS
- Axios
- React Hot Toast

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT Authentication
- Stripe Payment Gateway
- Swagger/OpenAPI Documentation

## 🔧 Installation

### Prerequisites
- Node.js 18+ installed
- MongoDB (local or MongoDB Atlas)
- Git

### Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create .env file
# Add your environment variables:
# MONGODB_URI=your_mongodb_connection_string
# JWT_SECRET=your_jwt_secret
# STRIPE_SECRET_KEY=your_stripe_secret_key
# PORT=5000

# Start development server
npm run dev

# Or start production server
npm start
```

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create .env file
# Add your environment variables:
# VITE_API_URL=http://localhost:5000/api
# VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key

# Start development server
npm run dev

# Build for production
npm run build
```

## 📁 Project Structure

```
grocery-store/
├── backend/
│   ├── controllers/     # Route controllers
│   ├── models/          # MongoDB models
│   ├── routes/          # API routes
│   ├── middleware/      # Custom middleware
│   ├── config/          # Configuration files
│   ├── scripts/         # Utility scripts
│   └── tests/           # Test files
├── frontend/
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── pages/       # Page components
│   │   ├── contexts/    # React contexts
│   │   ├── services/    # API services
│   │   └── utils/       # Utility functions
│   └── public/          # Static assets
├── .gitlab-ci.yml       # GitLab CI/CD pipeline
└── README.md           # This file
```

## 🧪 Testing

### Run Tests

```bash
# Backend tests
cd backend
npm test

# Frontend tests (if configured)
cd frontend
npm test
```

## 🚢 CI/CD Pipeline

This project includes GitLab CI/CD pipeline configuration for automated testing and deployment.

### Pipeline Stages

1. **Test Stage**: Runs backend and frontend tests
2. **Build Stage**: Builds frontend and validates backend
3. **Deploy Stage**: Deploys to staging and production (manual)

### Setup GitLab CI/CD

1. Create a new project in GitLab
2. Push your code to GitLab repository
3. Configure environment variables in GitLab CI/CD settings
4. Pipeline will run automatically on push

See [GITLAB_SETUP.md](./GITLAB_SETUP.md) for detailed setup instructions.

## 🌐 API Documentation

API documentation is available via Swagger when backend is running:

- **Swagger UI**: `http://localhost:5000/api-docs`
- **API Base URL**: `http://localhost:5000/api`

## 🔐 Environment Variables

### Backend (.env)
```env
MONGODB_URI=mongodb://localhost:27017/grocery-store
JWT_SECRET=your-secret-key
STRIPE_SECRET_KEY=sk_test_your_stripe_key
PORT=5000
NODE_ENV=development
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:5000/api
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_key
```

## 📝 Available Scripts

### Backend
- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm test` - Run tests
- `npm run sync-products` - Sync products from Open Food Facts API

### Frontend
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## 🐳 Docker Support

Dockerfiles are included for both frontend and backend. Use Docker Compose for easy deployment:

```bash
docker-compose up -d
```

## 📚 Documentation

- [GitLab Setup Guide](./GITLAB_SETUP.md)
- [Payment Setup](./PAYMENT_SETUP.md)
- [MongoDB Setup](./MONGODB_SETUP.md)
- [Docker Setup](./DOCKER_SETUP.md)

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Run tests
4. Submit a merge request

## 📄 License

This project is licensed under the ISC License.

## 👥 Authors

- Your Name

## 🙏 Acknowledgments

- Open Food Facts API for product data
- Stripe for payment processing
- MongoDB Atlas for cloud database

---

**Note**: This is a development/test project. Use production-ready configurations for live deployment.


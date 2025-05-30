# Elyra E-commerce Backend

This is the backend API for the Elyra e-commerce platform, built with Node.js, Express, and MongoDB.

## Features

- User authentication (register, login, get current user)
- Product management (CRUD operations)
- Protected routes with JWT authentication
- Role-based authorization (admin/user)
- Data validation
- Error handling
- CORS support
- Environment configuration

## Prerequisites

- Node.js (v14 or later)
- npm or yarn
- MongoDB (local or Atlas)

## Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd elyra/backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   - Copy `.env.example` to `.env`
   - Update the values in `.env` as needed
`
4. Start the development server:
   ```bash
   npm run dev
   ```

## Database Setup

1. Make sure MongoDB is running locally or update the `MONGODB_URI` in `.env` to point to your MongoDB instance.

2. To seed the database with sample products:
   ```bash
   npm run seed:import
   ```

   To remove all data:
   ```bash
   npm run seed:destroy
   ```

## API Endpoints

### Auth

- `POST /api/v1/auth/register` - Register a new user
- `POST /api/v1/auth/login` - Login user
- `GET /api/v1/auth/me` - Get current user (protected)

### Products

- `GET /api/v1/products` - Get all products
- `GET /api/v1/products/:id` - Get single product
- `POST /api/v1/products` - Create new product (admin only)
- `PUT /api/v1/products/:id` - Update product (admin only)
- `DELETE /api/v1/products/:id` - Delete product (admin only)

## Environment Variables

- `PORT` - Server port (default: 5000)
- `NODE_ENV` - Environment (development/production)
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - Secret for JWT
- `JWT_EXPIRE` - JWT expiration time
- `JWT_COOKIE_EXPIRE` - JWT cookie expiration time
- `FRONTEND_URL` - Frontend URL for CORS

## Production Deployment

1. Set `NODE_ENV=production` in your production environment.
2. Update all environment variables with production values.
3. Use a process manager like PM2 to run the application:
   ```bash
   npm install -g pm2
   pm2 start server.js --name elyra-backend
   ```

## License

MIT

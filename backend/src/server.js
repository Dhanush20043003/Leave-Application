import 'dotenv/config.js';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { connectDB } from './config/db.js';
import authRoutes from './routes/auth.routes.js';
import leaveRoutes from './routes/leave.routes.js';

const app = express();

// Enhanced CORS configuration
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging middleware
app.use(morgan('dev'));

// Health check route
app.get('/', (req, res) => {
  res.json({ 
    message: 'Leo Portal API is running',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/leaves', leaveRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({ 
    message: err.message || 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    message: `Route ${req.originalUrl} not found`,
    availableRoutes: [
      'GET /',
      'POST /api/auth/register',
      'POST /api/auth/login',
      'POST /api/auth/seed-admin',
      'GET /api/auth/me',
      'POST /api/leaves',
      'GET /api/leaves',
      'GET /api/leaves/me'
    ]
  });
});

// Connect to MongoDB and start server
const startServer = async () => {
  try {
    console.log('🔄 Starting Leo Portal API...');
    
    // Connect to database
    await connectDB();
    
    // Start server
    const port = process.env.PORT || 5000;
    app.listen(port, () => {
      console.log(`🚀 Server running on http://localhost:${port}`);
      console.log(`📊 API Health: http://localhost:${port}/`);
      console.log(`🔐 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`📱 Frontend URL: http://localhost:3000`);
      console.log('📋 Ready to accept requests!');
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Promise Rejection:', err);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
  process.exit(1);
});

startServer();
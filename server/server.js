import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import morgan from 'morgan';
import connectDB from './config/db.js';
import { errorHandler } from './middleware/errorHandler.js';

// Route imports
import userRoutes from './routes/userRoutes.js';
import expenseRoutes from './routes/expenseRoutes.js';
import groupRoutes from './routes/groupRoutes.js';
import transactionRoutes from './routes/transactionRoutes.js';
import friendRoutes from './routes/friendRoutes.js';
import settlementRoutes from './routes/settlementRoutes.js';

// Load env vars
dotenv.config();

// Connect to database
(async () => {
  try {
    await connectDB();
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    console.log('Server will continue without database connection');
  }
})();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Logging middleware in development
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Mount routes
app.use('/api/users', userRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/friends', friendRoutes);
app.use('/api/settlements', settlementRoutes);

// Basic route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Split API' });
});

// Error handling middleware
app.use(errorHandler);

// Handle 404
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
  });
});

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

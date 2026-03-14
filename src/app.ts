import express, { type Request, type Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { errorHandler } from './middlewares/error.middleware.js';
import authRoutes from './routes/auth.routes.js';
import locationRoutes from './routes/location.routes.js';
import farmerRoutes from './routes/farmer.routes.js';
import demandRoutes from './routes/demand.routes.js';
import supplyRoutes from './routes/supply.routes.js';

dotenv.config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Root route
app.get('/', (req: Request, res: Response) => {
  res.json({ message: 'Welcome to Ethiopian Fertilizer Digital Tracking & Management System API' });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/locations', locationRoutes);
app.use('/api/farmers', farmerRoutes);
app.use('/api/demands', demandRoutes);
app.use('/api/supply', supplyRoutes);

// Error Handler
app.use(errorHandler);

export default app;

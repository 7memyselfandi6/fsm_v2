import express, { type Request, type Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { errorHandler } from './middlewares/error.middleware.js';
import authRoutes from './routes/auth.routes.js';
import locationRoutes from './routes/location.routes.js';
import farmerRoutes from './routes/farmer.routes.js';
import demandRoutes from './routes/demand.routes.js';
import supplyRoutes from './routes/supply.routes.js';
import adminRoutes from './routes/admin.routes.js';
import userRoutes from './routes/user.routes.js';
import geoRoutes from './routes/geo.routes.js';
import cropRoutes from './routes/crop.routes.js';
import fertilizerRoutes from './routes/fertilizer.routes.js';
import seasonRoutes from './routes/season.routes.js';
import systemRoutes from './routes/system.routes.js';

dotenv.config();

const app = express();

// Security Middlewares
app.use(helmet());
app.use(cookieParser());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again after 15 minutes',
});
app.use('/api/', limiter);

const allowedOrigins = [
  'http://localhost:3000', // local development React/Next.js app
  'https://your-frontend-domain.com' // future production frontend URL
];

// Middlewares
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true, // This allows the "include" mode for credentials
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
// app.use(cors());
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
app.use('/api/admin', adminRoutes);
app.use('/api/users', userRoutes);
app.use('/api/geo', geoRoutes);
app.use('/api/crops', cropRoutes);
app.use('/api/fertilizer-types', fertilizerRoutes);
app.use('/api/seasons', seasonRoutes);
app.use('/api/system', systemRoutes);

// Error Handler
app.use(errorHandler);

export default app;

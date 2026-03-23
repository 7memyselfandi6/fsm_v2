// import app from './app.js';
// import prisma from './config/prisma.js';

// const PORT = process.env.PORT || 5000;

// const startServer = async () => {
//   try {
//     await prisma.$connect();
//     console.log('Database connected successfully');
    
//     app.listen(PORT, () => {
//       console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
//     });
//   } catch (error) {
//     console.error('Failed to start server:', error);
//     process.exit(1);
//   }
// };

// startServer();

import express from 'express';
import app from './app.js'; // This is your Express instance from app.ts
import prisma from './config/prisma.js';

const PORT = process.env.PORT || 10000;

// 1. Connect to Database first
prisma.$connect()
  .then(async () => {
    try {
      // Perform a simple query to truly verify the connection
      await prisma.$executeRawUnsafe('SELECT 1');
      console.log('✅ Database connected and verified successfully');
      
      // 2. Start the listener ONLY ONCE after DB connects
      // We use '0.0.0.0' so Render can detect the service
      app.listen(Number(PORT), '0.0.0.0', () => {
        console.log(`🚀 Server is humming on port ${PORT}`);
        console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
      });
    } catch (dbErr) {
      console.error('❌ Database verification failed:', dbErr);
      process.exit(1);
    }
  })
  .catch((err) => {
    console.error('❌ Prisma connection error:', err);
    process.exit(1); // Exit if DB fails so Render can retry
  });

// Do not 'export default app' here if this is your entry point file

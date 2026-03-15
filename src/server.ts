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

import app from './app.js';
import prisma from './config/prisma.js';

const PORT = process.env.PORT || 5000;

// 1. Database connection (Optional here, prisma connects on first query)
// But for Vercel, we usually rely on Prisma's lazy connection.
prisma.$connect()
  .then(() => console.log('Database connected successfully'))
  .catch((err) => console.error('Prisma connection error:', err));

// 2. ONLY start the listener if we are NOT on Vercel
// Vercel sets its own environment; if we are local, we need the listener.
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  });
}

// 3. CRITICAL: Export the app for Vercel's handler
export default app;

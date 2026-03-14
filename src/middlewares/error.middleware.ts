// import type { Request, Response, NextFunction } from 'express';

// const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
//   const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
//   res.status(statusCode);
//   res.json({
//     message: err.message,
//     stack: process.env.NODE_ENV === 'production' ? null : err.stack,
//   });
// };

// export { errorHandler };

import express from 'express';

// Access the types directly from the express namespace
const errorHandler = (
  err: any, 
  req: express.Request, 
  res: express.Response, 
  next: express.NextFunction
) => {
  // If the error has a specific status code, use it; otherwise default to 500
  const statusCode = err.statusCode || (res.statusCode === 200 ? 500 : res.statusCode);
  
  res.status(statusCode).json({
    success: false,
    message: err.message,
    // Only show the stack trace in development mode
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
};

export { errorHandler };

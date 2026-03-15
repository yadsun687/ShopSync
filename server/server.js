import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import 'dotenv/config';

const app = express();

// Middleware
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  }),
);
app.use(express.json());
app.use(cookieParser());

// Routes
import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import userRoutes from './routes/userRoutes.js';
import queueRoutes from './routes/queueRoutes.js';
import commentRoutes from './routes/commentRoutes.js';
import { protect, restrictTo } from './middleware/authMiddleware.js';
// import { apiLimiter } from './utils/rateLimiter.js';

// Apply global rate limit (10 req/min per IP) to all /api routes
// app.use('/api', apiLimiter);

app.use('/api/auth', authRoutes);
app.use('/api/products', protect, productRoutes);
app.use('/api/orders', protect, orderRoutes);
app.use('/api/users', protect, restrictTo('admin'), userRoutes);
app.use('/api/queue', protect, restrictTo('admin'), queueRoutes);
app.use('/api/comments', protect, commentRoutes);

// Health check route
app.get("/api/health", (req, res) => {
  const mem = process.memoryUsage();
  const toMB = (bytes) => (bytes / 1024 / 1024).toFixed(2) + " MB";

  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: {
      seconds: Math.floor(process.uptime()),
      human: new Date(process.uptime() * 1000).toISOString().slice(11, 19),
    },
    memory: {
      rss: toMB(mem.rss),
      heapUsed: toMB(mem.heapUsed),
      heapTotal: toMB(mem.heapTotal),
      external: toMB(mem.external),
    },
  });
});

// Database connection
const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("Connected to MongoDB");
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err.message);
    process.exit(1);
  });

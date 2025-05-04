import express from 'express';
import cookieParser from 'cookie-parser';
import authRouter from './routes/authRoutes.ts';
import cors from 'cors';
import corsOption from './config/corsOption.ts';
import connectDB from './config/mongodb.ts';
import seedRoles from './config/seedRoles.ts';
import seedStatus from './config/seedStatus.ts';

const app = express();

// Initialize MongoDB connection and seed roles
connectDB();
seedRoles();
seedStatus();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors(corsOption));

// API Endpoints
app.get('/', (req, res) => {
    res.json({ message: "Backend is running..." });
});
app.use('/api/auth', authRouter);

export default app;
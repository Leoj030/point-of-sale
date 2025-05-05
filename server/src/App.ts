import express from 'express';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/auth.routes.ts';
import inventoryRoutes from './routes/inventory.routes.ts';
import cors from 'cors';
import corsOption from './config/corsOption.ts';
import connectDB from './config/mongodb.ts';
import seedRoles from './config/seedRoles.ts';
import seedStatus from './config/seedStatus.ts';
import seed from './config/seed.ts';

const app = express();

// Initialize MongoDB connection and seed roles
(async () => {
    await connectDB();
    await seedRoles();
    await seedStatus();
    await seed();
})();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors(corsOption));

// API Endpoints
app.get('/', (req, res) => {
    res.json({ message: "Backend is running..." });
});
app.use('/api/auth', authRoutes);
app.use('/api/inventory', inventoryRoutes);

export default app;
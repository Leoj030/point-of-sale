import express from 'express';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/auth.routes.js';
import inventoryRoutes from './routes/inventory.routes.js';
import cors from 'cors';
import corsOption from './config/corsOption.js';
import connectDB from './config/mongodb.js';
import seedRoles from './config/seedRoles.js';
import seedStatus from './config/seedStatus.js';
import userRoutes from './routes/user.routes.js';
import salesReportRoutes from './routes/salesReport.routes.js';

const app = express();

(async () => {
    await connectDB();
    await seedRoles();
    await seedStatus();
})();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors(corsOption));

// API Endpoints
app.get('/', (req, res) => {
    res.json({ message: "Server is running..." });
});
app.use('/api/auth', authRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/user', userRoutes);
app.use('/api/reports/sales', salesReportRoutes);

export default app;
import express from 'express';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/auth.routes';
import inventoryRoutes from './routes/inventory.routes';
import receiptRoutes from './routes/receipt.routes';
import cors from 'cors';
import corsOption from './config/corsOption';
import connectDB from './config/mongodb';
import seedRoles from './config/seedRoles';
import seedStatus from './config/seedStatus';
import userRoutes from './routes/user.routes';
import salesReportRoutes from './routes/salesReport.routes';
import ordersRoutes from './routes/orders.routes';
import seedUsers from './config/seedUsers';
import helmet from 'helmet';
import limiter from './config/limiterConfig'

const app = express();

(async () => {
    await connectDB();
    await seedRoles();
    await seedStatus();
    await seedUsers();
})();



app.use(limiter);
app.use(helmet());
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
app.use('/api/receipts', receiptRoutes);
app.use('/api/user', userRoutes);
app.use('/api/reports/sales', salesReportRoutes);
app.use('/api/orders', ordersRoutes);

export default app;
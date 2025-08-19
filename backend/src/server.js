import 'dotenv/config.js';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { connectDB } from './config/db.js';
import authRoutes from './routes/auth.routes.js';
import leaveRoutes from './routes/leave.routes.js';

const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.get('/', (_req, res) => res.send('Leo Portal API running'));
app.use('/api/auth', authRoutes);
app.use('/api/leaves', leaveRoutes);

await connectDB();
const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`API on http://localhost:${port}`));

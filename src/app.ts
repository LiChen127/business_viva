import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import OpenRouter from './routes/open';
import AdminRouter from './routes/admin';
import 'reflect-metadata';


const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use('/api/v1', OpenRouter);
app.use('/api/v1/admin', AdminRouter);

export default app;
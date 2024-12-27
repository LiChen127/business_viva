import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';



const app = express();

app.use(cors());
app.use(bodyParser.json());

// app.use('/api/v1', routes);

const port = process.env.PORT || 3000;

export default app;
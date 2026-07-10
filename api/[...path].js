import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import analysisRouter from '../server/analysis.js';
import ttsRouter from '../server/tts.js';
import uploadRouter from '../server/upload.js';
import dataRouter from '../server/data.js';

const app = express();

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

let dbConnected = false;
let dbConnectionPromise = null;

const connectDB = async () => {
  if (dbConnected) return;
  if (dbConnectionPromise) return dbConnectionPromise;
  
  dbConnectionPromise = mongoose.connect(process.env.MONGO_URI)
    .then(() => {
      dbConnected = true;
      console.log('MongoDB Connected...');
    })
    .catch(err => {
      console.error('MongoDB Connection Error:', err.message);
      dbConnectionPromise = null;
    });
  
  return dbConnectionPromise;
};

app.use('/api/analysis', analysisRouter);
app.use('/api/tts', ttsRouter);
app.use('/api/upload', uploadRouter);
app.use('/api/data', dataRouter);

export default async (req, res) => {
  await connectDB();
  app(req, res);
};
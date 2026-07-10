require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

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

app.use('/api/analysis', require('./analysis'));
app.use('/api/tts', require('./tts'));
app.use('/api/upload', require('./upload'));
app.use('/api/data', require('./data'));

module.exports = async (req, res) => {
  await connectDB();
  app(req, res);
};
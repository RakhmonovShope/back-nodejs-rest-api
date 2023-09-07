import authRoutes from './routes/auth';
import feedRoutes from './routes/feed';
import socket from './socket';

import bodyParser from 'body-parser';
import express from 'express';
import mongoose from 'mongoose';
import multer from 'multer';
import path from 'path';
const app = express();

const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'images');
  },
  filename: (req, file, cb) => {
    cb(null, new Date().toISOString() + '-' + file.originalname);
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg') {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

app.use(bodyParser.json());
app.use('/images', express.static(path.join(__dirname, 'images')));
app.use(multer({ storage: fileStorage, fileFilter }).single('image'));

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-PINGOTHER');

  next();
});

app.use('/feed', feedRoutes);
app.use('/auth', authRoutes);

app.use((error, req, res, next) => {
  const status = error.statusCode || 500;
  const message = error.message;
  const data = error.data;

  res.status(status).json({ message, data });
});

mongoose
  .connect('mongodb+srv://rakhmonovshope:J3kyf9C3FH*GwTQ@nodejs.movqxia.mongodb.net/messages')
  .then(() => {
    const server = app.listen(8080);
    const io = socket.init(server);

    io.on('connection', socket => {
      console.log('Client connected');
    });
  })
  .catch(err => {
    console.log('Connection error to data base', err);
  });

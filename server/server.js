import express from 'express';
import path from 'path';
import cors from 'cors';
import connectDB from './db/connectDB.js';
import dotenv from 'dotenv';
import fs from 'fs';

const app = express();
const PORT = process.env.PORT || 5000;

dotenv.config();
connectDB();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));
app.use(express.static(path.join(process.cwd(), 'client/build')));

const dir = './uploads';
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir);
}

app.use('/api/music', (await import('./routes/api.music.js')).default);
app.use('/api/favorite', (await import('./routes/api.favorite.js')).default);

if (process.env.NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    res.sendFile(path.join(process.cwd(), 'client/build', 'index.html'));
  });
}

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

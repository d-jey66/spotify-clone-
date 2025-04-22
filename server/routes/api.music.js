import express from 'express';
import multer from 'multer';
import path from 'path';
import * as musicController from '../controllers/music.collections.js';


const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('audio/')) {
    cb(null, true);
  } else {
    cb(new Error('Not an audio file! Please upload only audio files.'), false);
  }
};

const upload = multer({ 
  storage, 
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }
});

router.get('/', musicController.getAllSongs);
router.get('/:id', musicController.getSongById);
router.post('/', upload.single('audioFile'), musicController.createSong);
router.put('/:id', upload.single('audioFile'), musicController.updateSong);
router.delete('/:id', musicController.deleteSong);

export default router;

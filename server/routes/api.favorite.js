import express from 'express';
import Song from '../models/song.model.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const favorites = await Song.find().sort({ createdAt: -1 }).limit(5);
    res.status(200).json(favorites);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching favorites', error: error.message });
  }
});

router.post('/:id', async (req, res) => {
  try {
    const song = await Song.findById(req.params.id);
    if (!song) return res.status(404).json({ message: 'Song not found' });
    res.status(200).json(song);
  } catch (error) {
    res.status(500).json({ message: 'Error adding to favorites', error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const song = await Song.findById(req.params.id);
    if (!song) return res.status(404).json({ message: 'Song not found' });
    res.status(200).json({ message: 'Removed from favorites' });
  } catch (error) {
    res.status(500).json({ message: 'Error removing from favorites', error: error.message });
  }
});

export default router;
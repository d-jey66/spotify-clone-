import Song from '../models/song.model.js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const getAllSongs = async (req, res) => {
  try {
    const songs = await Song.find().select('-__v').sort({ createdAt: -1 });
    res.status(200).json(songs);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching songs', error: error.message });
  }
};

export const getSongById = async (req, res) => {
  try {
    const song = await Song.findById(req.params.id);
    if (!song) return res.status(404).json({ message: 'Song not found' });
    res.status(200).json(song);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching song', error: error.message });
  }
};

export const createSong = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No audio file uploaded' });

    const newSong = new Song({
      title: req.body.title,
      artist: req.body.artist,
      album: req.body.album || '',
      genre: req.body.genre || '',
      duration: req.body.duration || 0,
      fileUrl: `/uploads/${req.file.filename}`,
      coverUrl: req.body.coverUrl || ''
    });

    const savedSong = await newSong.save();
    res.status(201).json(savedSong);
  } catch (error) {
    res.status(500).json({ message: 'Error creating song', error: error.message });
  }
};

export const updateSong = async (req, res) => {
  try {
    const songId = req.params.id;
    const updates = {
      title: req.body.title,
      artist: req.body.artist,
      album: req.body.album,
      genre: req.body.genre
    };

    if (req.file) {
      const oldSong = await Song.findById(songId);
      if (oldSong) {
        const oldFilePath = path.join(__dirname, '..', oldSong.fileUrl);
        if (fs.existsSync(oldFilePath)) fs.unlinkSync(oldFilePath);
      }
      updates.fileUrl = `/uploads/${req.file.filename}`;
    }

    const updatedSong = await Song.findByIdAndUpdate(songId, updates, { new: true });
    if (!updatedSong) return res.status(404).json({ message: 'Song not found' });

    res.status(200).json(updatedSong);
  } catch (error) {
    res.status(500).json({ message: 'Error updating song', error: error.message });
  }
};

export const deleteSong = async (req, res) => {
  try {
    const songId = req.params.id;
    const song = await Song.findById(songId);

    if (!song) return res.status(404).json({ message: 'Song not found' });

    const filePath = path.join(__dirname, '..', song.fileUrl);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    await Song.findByIdAndDelete(songId);
    res.status(200).json({ message: 'Song deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting song', error: error.message });
  }
};

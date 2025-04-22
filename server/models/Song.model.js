import mongoose from 'mongoose';

const songSchema = new mongoose.Schema({
  title: { type: String, required: true },
  artist: { type: String, required: true },
  album: { type: String },
  genre: { type: String },
  duration: { type: Number },
  fileUrl: { type: String, required: true },
  coverUrl: { type: String },
  createdAt: { type: Date, default: Date.now }
});

const Song = mongoose.model('Song', songSchema);
export default Song;

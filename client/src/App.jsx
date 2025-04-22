import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

// Create an axios instance with the base URL
const api = axios.create({
  baseURL: 'http://localhost:5000'
});

function App() {
  const [songs, setSongs] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentSong, setCurrentSong] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [album, setAlbum] = useState('');
  const [genre, setGenre] = useState('');
  const [audioFile, setAudioFile] = useState(null);
  const [currentView, setCurrentView] = useState('home'); // home, favorites, upload
  const audioRef = useRef(null);

  // Fetch all songs
  useEffect(() => {
      const fetchSongs = async () => {
        try {
          const response = await api.get('/api/music');
          console.log('Fetched data:', response.data);  // Log to check the response
          
          // If the response is an array, set it, otherwise fallback to an empty array
          setSongs(Array.isArray(response.data) ? response.data : []);
          setLoading(false);
        } catch (error) {
          console.error('Error fetching songs:', error);
          setLoading(false);
        }
      };

    const fetchFavorites = async () => {
      try {
        const response = await api.get('/api/favorite');
        setFavorites(response.data);
      } catch (error) {
        console.error('Error fetching favorites:', error);
      }
    };

    fetchSongs();
    fetchFavorites();
  }, []);

  // Handle audio playback
  useEffect(() => {
    if (currentSong && audioRef.current) {
      // Make sure to use the full URL for audio files
      audioRef.current.src = `http://localhost:5000${currentSong.fileUrl}`;
      if (isPlaying) {
        audioRef.current.play();
      } else {
        audioRef.current.pause();
      }
    }
  }, [currentSong, isPlaying]);

  const handlePlayPause = (song) => {
    if (currentSong && currentSong._id === song._id) {
      setIsPlaying(!isPlaying);
    } else {
      setCurrentSong(song);
      setIsPlaying(true);
    }
  };

  const handleFileChange = (e) => {
    setAudioFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!audioFile) {
      alert('Please select an audio file');
      return;
    }

    const formData = new FormData();
    formData.append('title', title);
    formData.append('artist', artist);
    formData.append('album', album);
    formData.append('genre', genre);
    formData.append('audioFile', audioFile);

    try {
      setLoading(true);
      const response = await api.post('/api/music', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setSongs([response.data, ...songs]);
      setTitle('');
      setArtist('');
      setAlbum('');
      setGenre('');
      setAudioFile(null);
      setLoading(false);
      setCurrentView('home');
    } catch (error) {
      console.error('Error uploading song:', error);
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/api/music/${id}`);
      setSongs(songs.filter(song => song._id !== id));
      if (currentSong && currentSong._id === id) {
        setCurrentSong(null);
        setIsPlaying(false);
      }
    } catch (error) {
      console.error('Error deleting song:', error);
    }
  };

  const addToFavorites = async (song) => {
    try {
      await api.post(`/api/favorite/${song._id}`);
      setFavorites([...favorites, song]);
    } catch (error) {
      console.error('Error adding to favorites:', error);
    }
  };

  const removeFromFavorites = async (id) => {
    try {
      await api.delete(`/api/favorite/${id}`);
      setFavorites(favorites.filter(song => song._id !== id));
    } catch (error) {
      console.error('Error removing from favorites:', error);
    }
  };

  const renderContent = () => {
    if (loading) {
      return <p className="text-center py-8">Loading...</p>;
    }

    switch (currentView) {
      case 'home':
        return (
          <>
            <h2 className="text-2xl font-bold mb-4">Your Music</h2>

            {Array.isArray(songs) ? (
              songs.length === 0 ? (
                <p className="text-center py-8">No songs available. Upload your first song!</p>
              ) : (
                <div className="space-y-2">
                  {songs.map((song) => (
                    <div key={song._id} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg hover:bg-gray-700">
                      <div className="flex items-center">
                        <button
                          onClick={() => handlePlayPause(song)}
                          className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center mr-4"
                        >
                          {isPlaying && currentSong && currentSong._id === song._id ? (
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                          ) : (
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                            </svg>
                          )}
                        </button>
                        <div>
                          <h3 className="font-bold">{song.title}</h3>
                          <p className="text-sm text-gray-400">{song.artist}</p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <span className="text-sm text-gray-400 mr-4">{song.album}</span>
                        <button
                          onClick={() => addToFavorites(song)}
                          className="p-2 text-gray-400 hover:text-yellow-500 mr-2"
                          title="Add to favorites"
                        >
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDelete(song._id)}
                          className="p-2 text-red-500 hover:text-red-400"
                          title="Delete song"
                        >
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )
            ) : (
              <p className="text-red-500 text-center py-8">Error: songs is not an array</p>
            )}
          </>
        );
      case 'favorites':
        return (
          <>
            <h2 className="text-2xl font-bold mb-4">Your Favorites</h2>
            {favorites.length === 0 ? (
              <p className="text-center py-8">No favorites yet. Add songs to your favorites!</p>
            ) : (
              <div className="space-y-2">
                {favorites.map((song) => (
                  <div key={song._id} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg hover:bg-gray-700">
                    <div className="flex items-center">
                      <button
                        onClick={() => handlePlayPause(song)}
                        className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center mr-4"
                      >
                        {isPlaying && currentSong && currentSong._id === song._id ? (
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        ) : (
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                          </svg>
                        )}
                      </button>
                      <div>
                        <h3 className="font-bold">{song.title}</h3>
                        <p className="text-sm text-gray-400">{song.artist}</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <span className="text-sm text-gray-400 mr-4">{song.album}</span>
                      <button
                        onClick={() => removeFromFavorites(song._id)}
                        className="p-2 text-yellow-500 hover:text-yellow-400"
                        title="Remove from favorites"
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        );
      case 'upload':
        return (
          <>
            <h2 className="text-2xl font-bold mb-4">Upload Music</h2>
            <form onSubmit={handleSubmit} className="space-y-4 max-w-lg mx-auto">
              <div>
                <label className="block mb-1">Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 rounded"
                  required
                />
              </div>
              <div>
                <label className="block mb-1">Artist</label>
                <input
                  type="text"
                  value={artist}
                  onChange={(e) => setArtist(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 rounded"
                  required
                />
              </div>
              <div>
                <label className="block mb-1">Album</label>
                <input
                  type="text"
                  value={album}
                  onChange={(e) => setAlbum(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 rounded"
                />
              </div>
              <div>
                <label className="block mb-1">Genre</label>
                <input
                  type="text"
                  value={genre}
                  onChange={(e) => setGenre(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 rounded"
                />
              </div>
              <div>
                <label className="block mb-1">Audio File</label>
                <input
                  type="file"
                  onChange={handleFileChange}
                  className="w-full p-2 bg-gray-700 rounded"
                  accept="audio/*"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full py-2 bg-green-500 hover:bg-green-600 rounded font-bold"
              >
                Upload
              </button>
            </form>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <header className="bg-black p-4 shadow-lg">
        <div className="container mx-auto flex items-center justify-between">
          <h1 className="text-2xl font-bold text-green-500">Spotify Clone</h1>
          <nav>
            <ul className="flex space-x-4">
              <li
                className={`cursor-pointer ${currentView === 'home' ? 'text-green-500' : 'text-white hover:text-green-500'}`}
                onClick={() => setCurrentView('home')}
              >
                Home
              </li>
              <li
                className={`cursor-pointer ${currentView === 'favorites' ? 'text-green-500' : 'text-white hover:text-green-500'}`}
                onClick={() => setCurrentView('favorites')}
              >
                Favorites
              </li>
              <li
                className={`cursor-pointer ${currentView === 'upload' ? 'text-green-500' : 'text-white hover:text-green-500'}`}
                onClick={() => setCurrentView('upload')}
              >
                Upload
              </li>
            </ul>
          </nav>
        </div>
      </header>

      <main className="container mx-auto p-4">
        {renderContent()}
      </main>

      {/* Audio player */}
      <footer className="fixed bottom-0 left-0 right-0 bg-gray-800 p-3 shadow-lg">
        <div className="container mx-auto flex items-center">
          {currentSong ? (
            <>
              <div className="mr-4">
                <h3 className="font-bold">{currentSong.title}</h3>
                <p className="text-sm text-gray-400">{currentSong.artist}</p>
              </div>
              <div className="flex-grow">
                <audio ref={audioRef} onEnded={() => setIsPlaying(false)} className="w-full" controls />
              </div>
            </>
          ) : (
            <p>Select a song to play</p>
          )}
        </div>
      </footer>
    </div>
  );
}

export default App;
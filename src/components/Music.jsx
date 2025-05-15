import { useState, useRef, useEffect } from "react";
import jsonp from "jsonp";
import {
  FaPlay,
  FaPause,
  FaBackward,
  FaForward,
  FaSearch,
  FaBookmark,
} from "react-icons/fa";

const Music = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [showNotification, setShowNotification] = useState(false);
  const [bookmarks, setBookmarks] = useState(() => {
    const saved = localStorage.getItem("bookmarks");
    return saved ? JSON.parse(saved) : [];
  });
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [currentTrack, setCurrentTrack] = useState(null);
  const audioRef = useRef(null);

  const demoSong = {
    id: "demo",
    title: "Демо пісня",
    artist: { name: "Виконавець" },
    album: {
      cover_small:
        "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=50&q=80",
      cover_medium:
        "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&q=80",
    },
    preview: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
  };

  const displayTrack = currentTrack || demoSong;

  useEffect(() => {
    if (bookmarks.length > 0) {
      const track = bookmarks[currentTrackIndex];
      setCurrentTrack(track);
      setIsBookmarked(bookmarks.some((t) => t.id === track.id));
    }
  }, [currentTrackIndex, bookmarks]);

  useEffect(() => {
    localStorage.setItem("bookmarks", JSON.stringify(bookmarks));
  }, [bookmarks]);

  const searchTracks = (query) => {
    if (!query) return;
    const url = `https://api.deezer.com/search?q=${encodeURIComponent(
      query
    )}&limit=10&output=jsonp`;
    jsonp(url, { name: "deezer_callback" }, (err, data) => {
      if (err) {
        console.error("Помилка при пошуку Deezer:", err);
        setSearchResults([]);
        setShowNotification(true);
        setTimeout(() => setShowNotification(false), 3000);
      } else {
        const tracks = data?.data || [];
        setSearchResults(tracks);
        if (!tracks.length) {
          setShowNotification(true);
          setTimeout(() => setShowNotification(false), 3000);
        }
      }
    });
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const q = searchQuery.trim();
    if (q) searchTracks(q);
  };

  const toggleBookmark = () => {
    if (!currentTrack) return;
    if (isBookmarked) {
      setBookmarks(bookmarks.filter((t) => t.id !== currentTrack.id));
      setIsBookmarked(false);
    } else {
      setBookmarks([...bookmarks, currentTrack]);
      setIsBookmarked(true);
    }
  };

  const handlePrevious = () => {
    if (bookmarks.length) {
      setCurrentTrackIndex((i) => (i > 0 ? i - 1 : bookmarks.length - 1));
    }
  };

  const handleNext = () => {
    if (bookmarks.length) {
      setCurrentTrackIndex((i) => (i < bookmarks.length - 1 ? i + 1 : 0));
    }
  };

  const selectTrack = (track) => {
    setCurrentTrack(track);
    setIsBookmarked(bookmarks.some((b) => b.id === track.id));
    if (audioRef.current) {
      audioRef.current.src = track.preview;
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const updateProgress = () => {
    if (audioRef.current) setCurrentTime(audioRef.current.currentTime);
  };

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (audioRef.current.paused) {
      audioRef.current.play();
      setIsPlaying(true);
    } else {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const handleProgressClick = (e) => {
    if (!audioRef.current || !duration) return;
    const bar = e.currentTarget;
    const pos =
      (e.clientX - bar.getBoundingClientRect().left) / bar.offsetWidth;
    audioRef.current.currentTime = pos * duration;
  };

  const formatTime = (t) => {
    const m = Math.floor(t / 60);
    const s = Math.floor(t % 60)
      .toString()
      .padStart(2, "0");
    return `${m}:${s}`;
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.addEventListener("timeupdate", updateProgress);
    audio.addEventListener("loadedmetadata", () => setDuration(audio.duration));
    return () => audio.removeEventListener("timeupdate", updateProgress);
  }, []);

  return (
    <div className="music-player">
      {showNotification && (
        <div className="notification">Пісні не знайдені</div>
      )}
      <div className="search-bar">
        <form onSubmit={handleSearch}>
          <div className="search-input-container">
            <input
              type="text"
              placeholder="Пошук пісні..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button type="submit">
              <FaSearch />
            </button>
          </div>
        </form>
        <button
          className={`bookmark-button ${isBookmarked ? "active" : ""}`}
          onClick={toggleBookmark}
        >
          <FaBookmark />
        </button>
      </div>

      {searchResults.length > 0 && (
        <div className="search-results">
          {searchResults.map((track) => (
            <div
              key={track.id}
              className="search-result-item"
              onClick={() => selectTrack(track)}
            >
              <img src={track.album.cover_small} alt={track.title} />
              <div className="track-info">
                <div className="track-title">{track.title}</div>
                <div className="track-artist">{track.artist.name}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="album-art">
        <img src={displayTrack.album.cover_medium} alt={displayTrack.title} />
      </div>
      <div className="song-info">
        <div className="song-title">{displayTrack.title}</div>
        <div className="artist">{displayTrack.artist.name}</div>
      </div>
      <div className="progress-bar" onClick={handleProgressClick}>
        <div
          className="progress"
          style={{ width: `${(currentTime / duration) * 100}%` }}
        ></div>
      </div>
      <div className="time-info">
        <span>{formatTime(currentTime)}</span> /{" "}
        <span>{formatTime(duration)}</span>
      </div>
      <div className="player-controls">
        <button className="control-button" onClick={handlePrevious}>
          <FaBackward />
        </button>
        <button className="control-button" onClick={togglePlay}>
          {isPlaying ? <FaPause /> : <FaPlay />}
        </button>
        <button className="control-button" onClick={handleNext}>
          <FaForward />
        </button>
      </div>
      <audio ref={audioRef} src={displayTrack.preview} />
    </div>
  );
};

export default Music;

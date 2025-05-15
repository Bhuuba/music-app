import { useState, useRef, useEffect } from "react";
import { FaPlay, FaPause, FaBackward, FaForward } from "react-icons/fa";

const Music = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef(null);

  const demoSong = {
    title: "Демо песня",
    artist: "Исполнитель",
    cover:
      "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&q=80",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
  };

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.addEventListener("timeupdate", updateProgress);
      audioRef.current.addEventListener("loadedmetadata", () => {
        setDuration(audioRef.current.duration);
      });
    }
    return () => {
      if (audioRef.current) {
        audioRef.current.removeEventListener("timeupdate", updateProgress);
      }
    };
  }, []);

  const updateProgress = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const togglePlay = () => {
    if (audioRef.current.paused) {
      audioRef.current.play();
      setIsPlaying(true);
    } else {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const handleProgressClick = (e) => {
    const progressBar = e.currentTarget;
    const clickPosition =
      (e.clientX - progressBar.getBoundingClientRect().left) /
      progressBar.offsetWidth;
    audioRef.current.currentTime = clickPosition * duration;
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const handlePrevious = () => {
    audioRef.current.currentTime = 0;
  };

  const handleNext = () => {
    audioRef.current.currentTime = 0;
  };

  return (
    <div className="music-player">
      <div className="album-art">
        <img src={demoSong.cover} alt={demoSong.title} />
      </div>

      <div className="song-info">
        <div className="song-title">{demoSong.title}</div>
        <div className="artist">{demoSong.artist}</div>
      </div>

      <div className="progress-bar" onClick={handleProgressClick}>
        <div
          className="progress"
          style={{ width: `${(currentTime / duration) * 100}%` }}
        ></div>
      </div>

      <div className="time-info">
        <span>{formatTime(currentTime)}</span>
        <span> / </span>
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

      <audio ref={audioRef} src={demoSong.audioUrl} />
    </div>
  );
};

export default Music;

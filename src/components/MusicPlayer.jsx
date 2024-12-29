import React, { useState, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, X } from 'lucide-react';
import { notification } from 'antd';
import './MusicPlayer.css';

const MusicPlayer = ({ station, onClose, audioRef, isPlaying, setIsPlaying }) => {
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.src = station.url_resolved;
      if (isPlaying) {
        audioRef.current.play().catch(e => {
          console.log(e);
          notification.error({
            message: 'Hata',
            description: 'Müzik oynatılırken bir hata oluştu.',
          });
          setIsPlaying(false);
        });
      }
    }
  }, [station, audioRef, isPlaying]);

  const handleVolumeChange = (e) => {
    const value = parseFloat(e.target.value);
    setVolume(value);
    if (audioRef.current) {
      audioRef.current.volume = value;
    }
    if (value === 0) {
      setIsMuted(true);
    } else if (isMuted) {
      setIsMuted(false);
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      if (isMuted) {
        audioRef.current.volume = volume;
        setIsMuted(false);
      } else {
        audioRef.current.volume = 0;
        setIsMuted(true);
      }
    }
  };

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <div className="music-player">
      <div className="player-content">
        <div className="station-info">
          <div className={`station-image ${isPlaying ? 'playing' : ''}`}>
            {station.favicon ? (
              <img 
                src={station.favicon} 
                alt={station.name}
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.parentElement.classList.add('default-image');
                }}
              />
            ) : (
              <div className="default-image">
                <svg viewBox="0 0 24 24" width="32" height="32">
                  <path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 14.5c-2.49 0-4.5-2.01-4.5-4.5S9.51 7.5 12 7.5s4.5 2.01 4.5 4.5-2.01 4.5-4.5 4.5zm0-5.5c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1z"/>
                </svg>
              </div>
            )}
          </div>
          <div className="station-details">
            <h3>{station.name}</h3>
            <p>{station.country}</p>
            {station.tags && (
              <div className="station-tags">
                {station.tags.split(',').slice(0,3).map((tag, index) => (
                  <span key={index} className="tag">{tag.trim()}</span>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="player-controls">
          <button className="play-button" onClick={togglePlay}>
            {isPlaying ? <Pause size={48} /> : <Play size={48} />}
          </button>

          <div className="volume-control">
            <button
              className={`volume-button ${isMuted ? 'muted' : ''}`}
              onClick={toggleMute}
            >
              {isMuted || volume === 0 ? (
                <VolumeX size={32} />
              ) : (
                <Volume2 size={32} />
              )}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={isMuted ? 0 : volume}
              onChange={handleVolumeChange}
              className="volume-slider"
            />
          </div>

          <button className="close-button" onClick={onClose}>
            <X size={32} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default MusicPlayer;

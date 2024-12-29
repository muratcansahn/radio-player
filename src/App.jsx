import { useState, useRef, useEffect, useCallback } from 'react';
import { Search } from 'lucide-react';
import Globe from 'globe.gl';
import './App.css';
import MusicPlayer from './components/MusicPlayer';
import StationList from './components/StationList';
import { Button, Space, DatePicker, version, Tooltip } from 'antd';
import ReactDOM from 'react-dom';
import * as THREE from 'three';

function App() {
  const [radioStations, setRadioStations] = useState([]);
  const [currentStation, setCurrentStation] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const containerRef = useRef(null);
  const globeRef = useRef(null);
  const audioRef = useRef(null);
  const isFirstMount = useRef(true);

  useEffect(() => {
    audioRef.current = new Audio();
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const getAllStations = async () => {
    if (!isFirstMount.current) return;
    isFirstMount.current = false;
    
    setIsLoading(true);
    try {
    const response = await fetch(
      'https://de1.api.radio-browser.info/json/stations/search?limit=10000&order=clickcount&reverse=true'
    );
      const data = await response.json();
      const stationsWithGeo = data.filter(station => 
        station.geo_lat && 
        station.geo_long && 
        !isNaN(station.geo_lat) && !isNaN(station.geo_long) &&
        station.url_resolved
      );
      setRadioStations(stationsWithGeo);
    } catch (error) {
      console.error('İstasyonlar yüklenemedi:', error);
    }
    setIsLoading(false);
  };

  const handleStationSelect = useCallback(async (point) => {
    try {
      // Arama sonuçlarını ve search bar'ı temizle
      setSearchTerm('');
      setSearchResults([]);

      // Aynı istasyona tıklanma kontrolü
      if (currentStation?.stationuuid === point.stationuuid) {
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current.currentTime = 0;
        }
        setCurrentStation(null);
        setIsPlaying(false);
        // Reset point colors
        globeRef.current.pointColor(() => '#ffffff');
        return;
      }

      // Mevcut çalan varsa durdur
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }

      // Yeni istasyonu ayarla
      setCurrentStation(point);
      setIsPlaying(true);

      // Update point colors
      globeRef.current.pointColor((d) => d.stationuuid === point.stationuuid ? '#ff0000' : '#ffffff');
   ///make selected point bigger and increase z index

      globeRef.current.pointRadius((d) => d.stationuuid === point.stationuuid ? 0.7 : 0.5);
      globeRef.current.pointAltitude((d) => d.stationuuid === point.stationuuid ? 0.05 : 0);
    } catch (error) {
      console.error('İstasyon seçme hatası:', error);
    }
  }, [currentStation]);

  useEffect(() => {
    getAllStations();
  }, []);

  useEffect(() => {
    if (!radioStations.length) return;

    // Globe nesnesini oluştur
    const globe = Globe()
      .globeImageUrl('/earth-texture.jpg')
      .backgroundColor('rgba(0,0,0,0)')
      .pointRadius(0.5)
      .pointColor(() => '#ffffff')
      .pointAltitude(0.01)
      .pointsData(radioStations)
      .pointLat(d => d.geo_lat)
      .pointLng(d => d.geo_long)
      .pointLabel(d => `
        <div style="color: white; background: rgba(0,0,0,0.8); padding: 8px; border-radius: 4px; font-family: Arial;">
          <div style="font-weight: bold;">${d.name}</div>
          <div>${d.country}</div>
        </div>
      `);

    // Click event'ini ayrı ekle
    globe.onPointClick((point, event) => {
      event.stopPropagation();
      if (point && point.url_resolved) {
        handleStationSelect(point);
      }
    });

    if (containerRef.current) {
      containerRef.current.innerHTML = '';
      globe(containerRef.current);
      globeRef.current = globe;

      globe.pointOfView({
        altitude: 2.0,
        lat: 39.9334,
        lng: 32.8597
      });
    }

    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, [radioStations]);

  const handleSearch = useCallback(async (term) => {
    if (!term || !term.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch(
        `https://de1.api.radio-browser.info/json/stations/byname/${encodeURIComponent(term.trim())}?limit=10&order=clickcount&reverse=true`
      );
      
      if (!response.ok) {
        throw new Error('Arama yapılırken bir hata oluştu');
      }

      const data = await response.json();
      const validStations = data.filter(station => 
        station.name && 
        station.url_resolved && 
        station.stationuuid
      );
      
      setSearchResults(validStations);
    } catch (error) {
      console.error('Arama hatası:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  // Debounce search
  useEffect(() => {
    if (!searchTerm) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(() => {
      handleSearch(searchTerm);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm, handleSearch]);

  const handleClosePlayer = () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    setCurrentStation(null);
    setIsPlaying(false);
  };

  return (
      <div className="app-container">
        <div className="search-container">
          <div className="search-box">
            <Search size={20} />
            <input
              type="text"
              placeholder="İstasyon ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {isSearching && <span className="loading">Aranıyor...</span>}
          </div>
        </div>

        <div className="globe-container" ref={containerRef}></div>

        {currentStation && (
          <MusicPlayer
            station={currentStation}
            onClose={handleClosePlayer}
            audioRef={audioRef}
            isPlaying={isPlaying}
            setIsPlaying={setIsPlaying}
          />
        )}

        {searchTerm && searchResults.length > 0 && (
          <StationList
            stations={searchResults}
            onStationSelect={handleStationSelect}
            currentStation={currentStation}
          />
        )}
      </div>
  );
}

export default App;
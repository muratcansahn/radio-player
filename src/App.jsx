import { useState, useRef, useEffect, useCallback } from 'react';
import { Search } from 'lucide-react';
import Globe from 'globe.gl';
import './App.css';
import MusicPlayer from './components/MusicPlayer';
import StationList from './components/StationList';
import { Button, Space, DatePicker, version, Tooltip } from 'antd';
import ReactDOM from 'react-dom';

function App() {
  const [radioStations, setRadioStations] = useState([]);
  const [currentStation, setCurrentStation] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
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
      // Aynı istasyona tıklanma kontrolü
      if (currentStation?.stationuuid === point.stationuuid) {
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current.currentTime = 0;
        }
        setCurrentStation(null);
        setIsPlaying(false);
        return;
      }

      // Mevcut çalan varsa durdur
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }

      // Yeni istasyonu ayarla
      setCurrentStation(point);
      
      // Yeni ses nesnesini hazırla ve çal
      if (audioRef.current) {
        audioRef.current.src = point.url_resolved;
        try {
          await audioRef.current.play();
          setIsPlaying(true);
        } catch (error) {
          console.error('Çalma hatası:', error);
          setIsPlaying(false);
          setCurrentStation(null);
        }
      }
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
      .pointRadius(d => currentStation && d.stationuuid === currentStation.stationuuid ? 0.3 : 0.15)
      .pointColor(d => currentStation && d.stationuuid === currentStation.stationuuid ? '#1ed760' : '#ffffff')
      .pointsMerge(false)
      .pointAltitude(0.01)
      .pointsData(radioStations)
      .pointsTransitionDuration(300)
      .pointLat(d => d.geo_lat)
      .pointLng(d => d.geo_long);

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

  const filteredStations = radioStations.filter(station =>
    station.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    station.country.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
          </div>
        </div>
  

        <div className="globe-container" ref={containerRef}></div>


        {currentStation && (
          <MusicPlayer
            station={currentStation}
            onClose={handleClosePlayer}
          />
        )}

        {searchTerm && (
          <StationList
            stations={filteredStations}
            onStationSelect={handleStationSelect}
            currentStation={currentStation}
          />
        )}
      </div>
  );
}

export default App;
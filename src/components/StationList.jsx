import React from 'react';
import { List, Card, Tag, Empty } from 'antd';
import './StationList.css';

const StationList = ({ stations, onStationSelect, currentStation }) => {
  if (!Array.isArray(stations) || stations.length === 0) {
    return (
      <div className="station-list-container">
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="İstasyon bulunamadı"
        />
      </div>
    );
  }

  return (
    <div className="station-list-container">
      <List
        dataSource={stations}
        renderItem={(station) => (
          <List.Item
            key={station.stationuuid}
            className={`station-list-item ${currentStation?.stationuuid === station.stationuuid ? 'active' : ''}`}
            onClick={() => onStationSelect(station)}
          >
            <Card bordered={false} className="station-card">
              <div className="station-content">
                <div className="station-image">
                  {station.favicon ? (
                    <img
                      src={station.favicon}
                      alt=""
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="default-image">
                      <svg viewBox="0 0 24 24" width="24" height="24">
                        <path 
                          fill="currentColor" 
                          d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 14.5c-2.49 0-4.5-2.01-4.5-4.5S9.51 7.5 12 7.5s4.5 2.01 4.5 4.5-2.01 4.5-4.5 4.5z"
                        />
                      </svg>
                    </div>
                  )}
                </div>
                <div className="station-info">
                  <div className="station-name">{station.name || 'İsimsiz İstasyon'}</div>
                  <div className="station-country">{station.country || 'Bilinmeyen Ülke'}</div>
                  {station.tags && (
                    <div className="station-tags">
                      {station.tags.split(',').slice(0, 2).map((tag, index) => (
                        <Tag key={index} color="green">
                          {tag.trim()}
                        </Tag>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </List.Item>
        )}
      />
    </div>
  );
};

export default StationList;

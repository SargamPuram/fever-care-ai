import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import axios from 'axios';
import { toast } from 'sonner';
import 'leaflet/dist/leaflet.css';
import './DiseaseMap.css';

interface CaseData {
  id: string;
  patientName: string;
  disease: string;
  confidence: number;
  urgency: string;
  city: string;
  state: string;
  coordinates: [number, number];
  dayOfIllness: number;
  status: string;
}

interface MapDataResponse {
  success: boolean;
  totalCases: number;
  cases: CaseData[];
  summary: {
    dengue: number;
    malaria: number;
    typhoid: number;
    viral: number;
  };
}

type FilterType = 'all' | 'dengue' | 'malaria' | 'typhoid' | 'viral';

const DiseaseMap: React.FC = () => {
  const [mapData, setMapData] = useState<MapDataResponse>({
    cases: [],
    summary: { dengue: 0, malaria: 0, typhoid: 0, viral: 0 },
    success: true,
    totalCases: 0
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [filter, setFilter] = useState<FilterType>('all');

  useEffect(() => {
    loadMapData();
  }, []);

  const loadMapData = async (): Promise<void> => {
    try {
      setLoading(true);
      const response = await axios.get<MapDataResponse>(
        'http://localhost:7777/api/map/disease-hotspots'
      );

      if (response.data.success) {
        setMapData(response.data);
      }
    } catch (error) {
      console.error('Error loading map:', error);
      toast.error('Failed to load map data');
    } finally {
      setLoading(false);
    }
  };

  const getDiseaseColor = (disease: string): string => {
    const colors: Record<string, string> = {
      dengue: '#ff4444',
      malaria: '#44ff44',
      typhoid: '#4444ff',
      viral: '#ffaa00'
    };
    return colors[disease.toLowerCase()] || '#888888';
  };

  const filteredCases = filter === 'all'
    ? mapData.cases
    : mapData.cases.filter(c => c.disease.toLowerCase() === filter);

  if (loading) {
    return (
      <div className="map-loading">
        <div className="spinner"></div>
        <p>Loading disease map...</p>
      </div>
    );
  }

  return (
    <div className="disease-map-container">
      <div className="map-header">
        <h1>🗺️ Disease Hotspot Map - India</h1>
        <p>Real-time fever disease tracking across Indian cities</p>
      </div>

      <div className="summary-cards">
        <div className="summary-card dengue">
          <h3>🦟 Dengue</h3>
          <p className="count">{mapData.summary.dengue || 0}</p>
        </div>
        <div className="summary-card malaria">
          <h3>🦠 Malaria</h3>
          <p className="count">{mapData.summary.malaria || 0}</p>
        </div>
        <div className="summary-card typhoid">
          <h3>💊 Typhoid</h3>
          <p className="count">{mapData.summary.typhoid || 0}</p>
        </div>
        <div className="summary-card viral">
          <h3>🤒 Viral</h3>
          <p className="count">{mapData.summary.viral || 0}</p>
        </div>
      </div>

      <div className="map-filters">
        <button className={filter === 'all' ? 'active' : ''} onClick={() => setFilter('all')}>
          All ({mapData.cases.length})
        </button>
        <button className={filter === 'dengue' ? 'active dengue-btn' : ''} onClick={() => setFilter('dengue')}>
          Dengue ({mapData.summary.dengue || 0})
        </button>
        <button className={filter === 'malaria' ? 'active malaria-btn' : ''} onClick={() => setFilter('malaria')}>
          Malaria ({mapData.summary.malaria || 0})
        </button>
        <button className={filter === 'typhoid' ? 'active typhoid-btn' : ''} onClick={() => setFilter('typhoid')}>
          Typhoid ({mapData.summary.typhoid || 0})
        </button>
        <button className={filter === 'viral' ? 'active viral-btn' : ''} onClick={() => setFilter('viral')}>
          Viral ({mapData.summary.viral || 0})
        </button>
      </div>

      <div className="map-wrapper">
        <MapContainer
          center={[20.5937, 78.9629]}
          zoom={5}
          style={{ height: '600px', width: '100%' }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; OpenStreetMap'
          />

          {filteredCases.map((caseData, idx) => (
            <CircleMarker
              key={idx}
              center={[caseData.coordinates[1], caseData.coordinates[0]]}
              radius={10}
              fillColor={getDiseaseColor(caseData.disease)}
              color="#fff"
              weight={1}
              opacity={0.9}
              fillOpacity={0.7}
            >
              <Popup>
                <div className="map-popup">
                  <h4>{caseData.disease}</h4>
                  <p><strong>Patient:</strong> {caseData.patientName}</p>
                  <p><strong>Location:</strong> {caseData.city}, {caseData.state}</p>
                  <p><strong>Day:</strong> {caseData.dayOfIllness}</p>
                  <p><strong>Confidence:</strong> {caseData.confidence.toFixed(1)}%</p>
                </div>
              </Popup>
            </CircleMarker>
          ))}
        </MapContainer>
      </div>

      <div className="map-legend">
        <h4>Legend</h4>
        <div className="legend-item">
          <span className="legend-circle" style={{ backgroundColor: '#ff4444' }}></span>
          <span>Dengue</span>
        </div>
        <div className="legend-item">
          <span className="legend-circle" style={{ backgroundColor: '#44ff44' }}></span>
          <span>Malaria</span>
        </div>
        <div className="legend-item">
          <span className="legend-circle" style={{ backgroundColor: '#4444ff' }}></span>
          <span>Typhoid</span>
        </div>
        <div className="legend-item">
          <span className="legend-circle" style={{ backgroundColor: '#ffaa00' }}></span>
          <span>Viral</span>
        </div>
        <p><strong>Each dot = 1 patient</strong></p>
      </div>
    </div>
  );
};

export default DiseaseMap;

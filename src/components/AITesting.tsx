import React, { useState } from 'react';
import axios from 'axios';
import './App.css';
import { FaThermometerHalf, FaCalendarAlt, FaHeartbeat, FaVial } from 'react-icons/fa';
const FaMosquito = () => <span>🦟</span>;


function AITesting() {
  const [formData, setFormData] = useState({
    temperature: '',
    fever_days: '',
    headache: false,
    body_pain: false,
    eye_pain: false,
    nausea_vomiting: false,
    abdominal_pain: false,
    rash: false,
    bleeding: false,
    platelet_count: '',
    mosquito_exposure: false,
    travel: false
  });

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [apiInfo, setApiInfo] = useState(null);

  // Fetch API info on component mount
  React.useEffect(() => {
    axios.get('http://localhost:5000/')
      .then(response => setApiInfo(response.data))
      .catch(err => console.error('API info fetch failed:', err));
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    // Convert form data to API format
    const apiData = {
      temperature: parseFloat(formData.temperature) || 100,
      fever_days: parseInt(formData.fever_days) || 3,
      headache: formData.headache ? 1 : 0,
      body_pain: formData.body_pain ? 1 : 0,
      eye_pain: formData.eye_pain ? 1 : 0,
      nausea_vomiting: formData.nausea_vomiting ? 1 : 0,
      abdominal_pain: formData.abdominal_pain ? 1 : 0,
      rash: formData.rash ? 1 : 0,
      bleeding: formData.bleeding ? 1 : 0,
      platelet_count: parseFloat(formData.platelet_count) || 200,
      mosquito_exposure: formData.mosquito_exposure ? 1 : 0,
      travel: formData.travel ? 1 : 0
    };

    try {
      const response = await axios.post('http://localhost:7777/predict', apiData);
      setResult(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to get prediction. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      temperature: '',
      fever_days: '',
      headache: false,
      body_pain: false,
      eye_pain: false,
      nausea_vomiting: false,
      abdominal_pain: false,
      rash: false,
      bleeding: false,
      platelet_count: '',
      mosquito_exposure: false,
      travel: false
    });
    setResult(null);
    setError(null);
  };

  const getDiseaseColor = (disease) => {
    const colors = {
      'Dengue': '#ff6b6b',
      'Malaria': '#4ecdc4',
      'Typhoid': '#45b7d1',
      'Viral': '#96ceb4',
      'Other': '#ffeaa7'
    };
    return colors[disease] || '#dfe6e9';
  };

  const getSeverityLevel = (confidence) => {
    if (confidence >= 90) return { level: 'High Confidence', color: '#27ae60' };
    if (confidence >= 70) return { level: 'Moderate Confidence', color: '#f39c12' };
    return { level: 'Low Confidence', color: '#e74c3c' };
  };

  return (
    <div className="App">
      <header className="app-header">
        <h1>🏥 Fever Diagnosis AI</h1>
        {apiInfo && (
          <div className="api-info">
            <span>Model: {apiInfo.model}</span>
            <span>Accuracy: {apiInfo.accuracy}</span>
            <span className="status-badge">● Online</span>
          </div>
        )}
      </header>

      <div className="main-container">
        <div className="form-section">
          <h2>Patient Information</h2>
          <form onSubmit={handleSubmit}>
            {/* Vital Signs */}
            <div className="form-group-header">
              <FaHeartbeat /> Vital Signs
            </div>
            
            <div className="input-row">
              <div className="input-group">
                <label>
                  <FaThermometerHalf /> Temperature (°F) *
                </label>
                <input
                  type="number"
                  step="0.1"
                  name="temperature"
                  value={formData.temperature}
                  onChange={handleInputChange}
                  placeholder="e.g., 103.5"
                  required
                />
              </div>

              <div className="input-group">
                <label>
                  <FaCalendarAlt /> Fever Duration (days) *
                </label>
                <input
                  type="number"
                  name="fever_days"
                  value={formData.fever_days}
                  onChange={handleInputChange}
                  placeholder="e.g., 5"
                  required
                />
              </div>
            </div>

            <div className="input-group">
              <label>
                <FaVial /> Platelet Count (×10³/μL)
              </label>
              <input
                type="number"
                name="platelet_count"
                value={formData.platelet_count}
                onChange={handleInputChange}
                placeholder="e.g., 120 (Normal: 150-400)"
              />
            </div>

            {/* Symptoms */}
            <div className="form-group-header">
              💊 Symptoms
            </div>
            
            <div className="checkbox-grid">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="headache"
                  checked={formData.headache}
                  onChange={handleInputChange}
                />
                <span>Headache</span>
              </label>

              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="body_pain"
                  checked={formData.body_pain}
                  onChange={handleInputChange}
                />
                <span>Body Pain</span>
              </label>

              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="eye_pain"
                  checked={formData.eye_pain}
                  onChange={handleInputChange}
                />
                <span>Eye Pain</span>
              </label>

              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="nausea_vomiting"
                  checked={formData.nausea_vomiting}
                  onChange={handleInputChange}
                />
                <span>Nausea/Vomiting</span>
              </label>

              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="abdominal_pain"
                  checked={formData.abdominal_pain}
                  onChange={handleInputChange}
                />
                <span>Abdominal Pain</span>
              </label>

              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="rash"
                  checked={formData.rash}
                  onChange={handleInputChange}
                />
                <span>Rash</span>
              </label>

              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="bleeding"
                  checked={formData.bleeding}
                  onChange={handleInputChange}
                />
                <span>Bleeding</span>
              </label>
            </div>

            {/* Exposure History */}
            <div className="form-group-header">
              <FaMosquito /> Exposure History
            </div>
            
            <div className="checkbox-grid">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="mosquito_exposure"
                  checked={formData.mosquito_exposure}
                  onChange={handleInputChange}
                />
                <span>Mosquito Exposure</span>
              </label>

              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="travel"
                  checked={formData.travel}
                  onChange={handleInputChange}
                />
                <span>Recent Travel</span>
              </label>
            </div>

            <div className="button-group">
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? '🔄 Analyzing...' : '🔍 Diagnose'}
              </button>
              <button type="button" className="btn-secondary" onClick={resetForm}>
                🔄 Reset
              </button>
            </div>
          </form>
        </div>

        {/* Results Section */}
        <div className="results-section">
          {error && (
            <div className="error-card">
              <h3>❌ Error</h3>
              <p>{error}</p>
            </div>
          )}

          {result && (
            <>
              <div className="result-card main-prediction">
                <h2>Diagnosis Result</h2>
                <div 
                  className="disease-badge" 
                  style={{ backgroundColor: getDiseaseColor(result.prediction) }}
                >
                  {result.prediction}
                </div>
                <div className="confidence-bar">
                  <div className="confidence-level">
                    Confidence: <strong>{result.confidence.toFixed(1)}%</strong>
                  </div>
                  <div className="progress-bar">
                    <div 
                      className="progress-fill" 
                      style={{ 
                        width: `${result.confidence}%`,
                        backgroundColor: getSeverityLevel(result.confidence).color
                      }}
                    />
                  </div>
                  <div className="severity-badge" style={{ 
                    backgroundColor: getSeverityLevel(result.confidence).color 
                  }}>
                    {getSeverityLevel(result.confidence).level}
                  </div>
                </div>
              </div>

              <div className="result-card">
                <h3>📊 All Probabilities</h3>
                <div className="probability-list">
                  {result.top_3_predictions.map((pred, idx) => (
                    <div key={idx} className="probability-item">
                      <div className="prob-header">
                        <span className="rank">#{idx + 1}</span>
                        <span className="disease-name">{pred.disease}</span>
                        <span className="prob-value">{pred.probability.toFixed(1)}%</span>
                      </div>
                      <div className="prob-bar">
                        <div 
                          className="prob-fill" 
                          style={{ 
                            width: `${pred.probability}%`,
                            backgroundColor: getDiseaseColor(pred.disease)
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="result-card">
                <h3>📋 Input Summary</h3>
                <div className="summary-grid">
                  <div className="summary-item">
                    <span className="label">Temperature:</span>
                    <span className="value">{result.input_summary.temperature}°F</span>
                  </div>
                  <div className="summary-item">
                    <span className="label">Duration:</span>
                    <span className="value">{result.input_summary.fever_days} days</span>
                  </div>
                  <div className="summary-item full-width">
                    <span className="label">Symptoms:</span>
                    <span className="value">
                      {result.input_summary.key_symptoms.length > 0 
                        ? result.input_summary.key_symptoms.join(', ')
                        : 'None reported'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="disclaimer">
                ⚠️ <strong>Disclaimer:</strong> This is an AI-assisted diagnostic tool 
                with {apiInfo?.accuracy} accuracy. Always consult a healthcare professional 
                for proper medical diagnosis and treatment.
              </div>
            </>
          )}

          {!result && !error && (
            <div className="empty-state">
              <div className="empty-icon">🩺</div>
              <h3>Ready to Diagnose</h3>
              <p>Fill in the patient information and click "Diagnose" to get AI-powered predictions.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AITesting;

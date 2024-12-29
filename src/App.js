// Import required libraries
import React, { useState } from 'react';
import { searchNpmPackages, formatDownloads } from './Utils.js';
import './App.css';

const App = () => {
  const [keywords, setKeywords] = useState('');
  const [size, setSize] = useState(10);
  const [period, setPeriod] = useState('last-month');
  const [packages, setPackages] = useState([]);
  const [totalPackages, setTotalPackages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchTrendingPackages = async () => {
    setLoading(true);
    setError('');
    try {
      const { totalPackages, packages } = await searchNpmPackages(keywords, size, period);

      setPackages(packages);
      setTotalPackages(totalPackages);
    } catch (err) {
      setError('Error fetching packages');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App">
      <div className="search-container-horizontal">
        <div className="search-inputs-horizontal">
          <label className="input-label">Keyword</label>
          <input
            type="text"
            value={keywords}
            onChange={(e) => setKeywords(e.target.value)}
            placeholder="Enter keyword (e.g., react)"
            className="text-input"
          />
        </div>
        <div className="search-inputs-horizontal">
          <label className="input-label">Top</label>
          <select value={size} onChange={(e) => setSize(Number(e.target.value))} className="select-input">
            <option value="10">10</option>
            <option value="25">25</option>
            <option value="50">50</option>
          </select>
        </div>
        <div className="search-inputs-horizontal">
          <label className="input-label">Period</label>
          <select value={period} onChange={(e) => setPeriod(e.target.value)} className="select-input">
            <option value="last-week">Last Week</option>
            <option value="last-month">Last Month</option>
            <option value="last-year">Last Year</option>
            <option value="all-time">All Time</option>
          </select>
        </div>
        <button
          onClick={fetchTrendingPackages}
          className="search-button"
          disabled={!keywords.trim()}
          title={!keywords.trim() ? 'Please enter a keyword to enable search' : ''}
        >
          Search
        </button>
      </div>
      {loading && (
        <div className="loading-overlay">
          <div className="loading-spinner"></div>
          <p>&nbsp;Loading packages...</p>
        </div>
      )}
      {error && <p className="error-message">{error}</p>}
      {totalPackages > 0 && <p className="total-packages">Total Packages Found: {totalPackages}</p>}
      {!loading && !error && totalPackages === 0 && <p className="no-packages-message">No packages found</p>}

      <div className="leaderboard">
        {packages.map((pkg, index) => (
          <div className="package-card" key={index}>
            {/* Top Section */}
            <div className="package-card-header">
              <div className="package-name-number">
                <span className="package-number">{index + 1}.</span>
                <h2 className="package-name">
                  <a href={`https://www.npmjs.com/package/${pkg.name}`} target="_blank" rel="noopener noreferrer">
                    {pkg.name}
                  </a>
                </h2>
              </div>
              <div className="package-version-license">
                <span>Version: {pkg.version}</span>
                <span>Updated: {pkg.updated}</span>
              </div>
            </div>

            {/* Keywords */}
            <div className="package-keywords">
              {pkg.keywords.map((keyword, idx) => (
                <span key={idx} className="keyword-tag">
                  {keyword}
                </span>
              ))}
            </div>

            {/* Description */}
            <p className="package-description">{pkg.description}</p>

            {/* Metadata */}
            <div className="package-metadata">
              <div className="package-downloads">Downloads: {formatDownloads(pkg.downloads)}</div>
              {/* Links */}
              <div className="package-links">
                {pkg.homepage && (
                  <a href={pkg.homepage} target="_blank" rel="noopener noreferrer" className="homepage-link">
                    Homepage
                  </a>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {packages.length ? (
        <footer className="footer-disclaimer">
          <p>
            All data is sourced from{' '}
            <a href="https://www.npmjs.com/" target="_blank" rel="noopener noreferrer">
              npm
            </a>{' '}
            registry. We do not store or modify the data.
          </p>
        </footer>
      ) : (
        ''
      )}
    </div>
  );
};

export default App;

// File: components/SeatingChart.js
import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import './SeatingChart.css';

function SeatingChart() {
  const [guests, setGuests] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // If using proxy in client/package.json, use relative URL
    axios.get('/api/guests')
      .then(response => {
        if (Array.isArray(response.data)) {
          setGuests(response.data);
        }
      })
      .catch(error => console.error('Error fetching guests:', error));
  }, []);

  const filteredGuests = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return [];

    return guests.filter(g => {
      const fullName = `${g.firstName} ${g.lastName}`.toLowerCase();
      return fullName.includes(term);
    });
  }, [guests, searchTerm]);

  return (
    <div className="find-seat-container">
      {/* Header centered vertically and horizontally */}
      <div className="header-container">
        <h1 className="title">Please Find Your Seat</h1>
        <input
          type="text"
          className="search-input"
          placeholder="Search by name"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Results in bottom half */}
      <div className="results-container">
        {filteredGuests.map(g => {
          const fullName = `${g.firstName} ${g.lastName}`.trim();
          return (
            <div key={g._id} className="result-text">
              {`${fullName} | ${g.tableNumber}`}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default SeatingChart;

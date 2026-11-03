import React, { useEffect, useState } from 'react';
import { fetchSystemHealth } from '../services/api.js';

export default function HealthCheckCard() {
  const [health, setHealth] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const runHealthCheck = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchSystemHealth();
      setHealth(data);
    } catch (err) {
      setError(err.message || 'Unable to reach FastAPI /api/health endpoint');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runHealthCheck();
  }, []);

  return (
    <section className="health-panel" aria-label="Backend Health Status">
      <div className="health-header">
        <h2>Phase 1 Foundation Status (`GET /api/health`)</h2>
        <button type="button" onClick={runHealthCheck} className="refresh-btn">
          Re-verify Endpoint
        </button>
      </div>

      {loading && <p className="muted-text">Checking FastAPI &amp; SQLite status...</p>}

      {error && (
        <p className="error-text">
          Backend check failed: {error}. Ensure FastAPI is running on port 8000.
        </p>
      )}

      {health && !loading && (
        <dl className="health-grid">
          <div>
            <dt>API Status</dt>
            <dd>{health.status}</dd>
          </div>
          <div>
            <dt>SQLite Database</dt>
            <dd>{health.database_status}</dd>
          </div>
          <div>
            <dt>Pilot Location</dt>
            <dd>{health.pilot_location}</dd>
          </div>
          <div>
            <dt>Target Languages</dt>
            <dd>{(health.supported_languages || []).join(', ')}</dd>
          </div>
          <div>
            <dt>Seeded Departments</dt>
            <dd>{health.seeded_departments_count}</dd>
          </div>
        </dl>
      )}
    </section>
  );
}

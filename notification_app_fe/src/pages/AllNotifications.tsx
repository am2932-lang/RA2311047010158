import { useState, useEffect } from 'react';
import { fetchNotifications } from '../api';
import type { Notification } from '../api';
import { useViewedStatus } from '../hooks/useViewedStatus';
import { Log } from '../logger';

export default function AllNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [typeFilter, setTypeFilter] = useState('');
  const { viewedIds, markAsViewed } = useViewedStatus();

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        await Log('frontend', 'info', 'page', `Loading AllNotifications: page=${page}`);
        // If typeFilter is empty, we don't pass it so the API ignores it or handles it
        const filter = typeFilter === '' ? undefined : typeFilter;
        const data = await fetchNotifications(page, 10, filter);
        setNotifications(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [page, typeFilter]);

  const handleNext = () => setPage(p => p + 1);
  const handlePrev = () => setPage(p => Math.max(1, p - 1));

  return (
    <div className="glass-panel">
      <header className="page-header">
        <h2>All Notifications</h2>
        <div className="controls">
          <select 
            value={typeFilter} 
            onChange={(e) => {
              setTypeFilter(e.target.value);
              setPage(1); // reset to page 1 on filter change
            }}
            className="filter-select"
          >
            <option value="">All Types</option>
            <option value="Placement">Placement</option>
            <option value="Result">Result</option>
            <option value="Event">Event</option>
          </select>
        </div>
      </header>

      {loading ? (
        <div className="loader-container"><div className="spinner"></div></div>
      ) : (
        <>
          <div className="notification-list">
            {notifications.length === 0 ? (
              <p className="empty-state">No notifications found.</p>
            ) : (
              notifications.map((n) => {
                const isViewed = viewedIds.has(n.ID);
                return (
                  <div 
                    key={n.ID} 
                    className={`notification-card ${isViewed ? 'viewed' : 'new'}`}
                    onClick={() => markAsViewed(n.ID)}
                  >
                    <div className="card-left">
                      <span className={`badge badge-${n.Type.toLowerCase()}`}>{n.Type}</span>
                    </div>
                    <div className="card-right">
                      <h3 className="message">{n.Message}</h3>
                      <p className="time">{new Date(n.Timestamp).toLocaleString()}</p>
                    </div>
                    {!isViewed && <div className="new-indicator"></div>}
                  </div>
                );
              })
            )}
          </div>
          <div className="pagination">
            <button onClick={handlePrev} disabled={page === 1} className="btn">Previous</button>
            <span className="page-info">Page {page}</span>
            <button onClick={handleNext} disabled={notifications.length < 10} className="btn">Next</button>
          </div>
        </>
      )}
    </div>
  );
}

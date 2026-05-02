import { useState, useEffect } from 'react';
import { fetchNotifications } from '../api';
import type { Notification } from '../api';
import { useViewedStatus } from '../hooks/useViewedStatus';
import { Log } from '../logger';

export default function PriorityInbox() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [typeFilter, setTypeFilter] = useState('');
  const { viewedIds, markAsViewed } = useViewedStatus();

  useEffect(() => {
    const loadAndProcess = async () => {
      setLoading(true);
      try {
        await Log('frontend', 'info', 'page', 'Loading PriorityInbox');
        // The Priority logic fetches a large chunk (or all) and then sorts client-side
        // Alternatively, use API limits if we can sort server-side, but standard approach is fetching and sorting locally.
        const filter = typeFilter === '' ? undefined : typeFilter;
        // Fetch up to 50 to get a good sample for priority sorting
        const data = await fetchNotifications(1, 50, filter);
        
        const weightMap: Record<string, number> = {
          'Placement': 3,
          'Result': 2,
          'Event': 1
        };

        const sorted = data.sort((a, b) => {
          const wA = weightMap[a.Type] || 0;
          const wB = weightMap[b.Type] || 0;
          if (wA !== wB) return wB - wA;
          return new Date(b.Timestamp).getTime() - new Date(a.Timestamp).getTime();
        });

        const topN = sorted.slice(0, 10);
        setNotifications(topN);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadAndProcess();
  }, [typeFilter]);

  return (
    <div className="glass-panel">
      <header className="page-header">
        <h2>Priority Inbox (Top 10)</h2>
        <div className="controls">
          <select 
            value={typeFilter} 
            onChange={(e) => setTypeFilter(e.target.value)}
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
        <div className="notification-list">
          {notifications.length === 0 ? (
            <p className="empty-state">No high-priority notifications found.</p>
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
      )}
    </div>
  );
}

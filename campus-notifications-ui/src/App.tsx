import { useEffect, useState } from 'react';
import axios from 'axios';
import { Log } from './logger';
import './index.css';

const API_URL = 'http://20.207.122.201/evaluation-service/notifications';
const TOKEN = import.meta.env.VITE_API_TOKEN || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiYXVkIjoiaHR0cDovLzIwLjI0NC41Ni4xNDQvZXZhbHVhdGlvbi1zZXJ2aWNlIiwiZW1haWwiOiJhbTI5MzJAc3JtaXN0LmVkdS5pbiIsImV4cCI6MTc3NzcwMzU0MCwiaWF0IjoxNzc3NzAyNjQwLCJpc3MiOiJBZmZvcmQgTWVkaWNhbCBUZWNobm9sb2dpZXMgUHJpdmF0ZSBMaW1pdGVkIiwianRpIjoiOGJhMWZjYTAtY2IxZC00ZDMyLWExMjMtYzM3MWRkNzMxMmZjIiwibG9jYWxlIjoiZW4tSU4iLCJuYW1lIjoiYW5kcmVhIG1lcmN5Iiwic3ViIjoiNmQ1MTAzODAtMjk1OC00NTdlLTk0ZmItZmU3NWVjZjZkZmI2In0sImVtYWlsIjoiYW0yOTMyQHNybWlzdC5lZHUuaW4iLCJuYW1lIjoiYW5kcmVhIG1lcmN5Iiwicm9sbE5vIjoicmEyMzExMDQ3MDEwMTU4IiwiYWNjZXNzQ29kZSI6IlFrYnB4SCIsImNsaWVudElEIjoiNmQ1MTAzODAtMjk1OC00NTdlLTk0ZmItZmU3NWVjZjZkZmI2IiwiY2xpZW50U2VjcmV0IjoiR3BNRkVzeVBTVk5XYXBkaiJ9.lYfjwN6L03EzNC32oyyEnh6A3C4I1o5xxwonme4-g7w";

interface Notification {
  ID: string;
  Type: string;
  Message: string;
  Timestamp: string;
}

function App() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAndProcess = async () => {
      try {
        await Log('frontend', 'info', 'component', 'App mounted, fetching notifications');
        const response = await axios.get(API_URL, {
          headers: { Authorization: `Bearer ${TOKEN}` }
        });
        
        const data: Notification[] = response.data.notifications || [];
        
        // Sorting logic
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

        const top10 = sorted.slice(0, 10);
        setNotifications(top10);
        await Log('frontend', 'info', 'state', `Set ${top10.length} notifications in state`);
      } catch (err: any) {
        console.error('Fetch error:', err);
        await Log('frontend', 'error', 'api', 'Failed to fetch notifications');
      } finally {
        setLoading(false);
      }
    };

    fetchAndProcess();
  }, []);

  const getTypeStyle = (type: string) => {
    if (type === 'Placement') return 'badge-placement';
    if (type === 'Result') return 'badge-result';
    return 'badge-event';
  };

  return (
    <div className="dashboard-container">
      <div className="glass-panel">
        <header className="header">
          <h1>Priority Inbox</h1>
          <p className="subtitle">Your top 10 most relevant campus updates</p>
        </header>

        {loading ? (
          <div className="loader-container">
            <div className="spinner"></div>
            <p>Fetching priorities...</p>
          </div>
        ) : (
          <div className="notification-list">
            {notifications.map((n) => (
              <div key={n.ID} className="notification-card">
                <div className="card-left">
                  <span className={`badge ${getTypeStyle(n.Type)}`}>{n.Type}</span>
                </div>
                <div className="card-right">
                  <h3 className="message">{n.Message}</h3>
                  <p className="time">{new Date(n.Timestamp).toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;

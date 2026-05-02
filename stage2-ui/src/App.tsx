import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import AllNotifications from './pages/AllNotifications';
import PriorityInbox from './pages/PriorityInbox';
import './index.css';

function App() {
  return (
    <Router>
      <div className="dashboard-container">
        <nav className="glass-nav">
          <div className="nav-logo">
            <span className="logo-icon">🔔</span> Campus Alerts
          </div>
          <div className="nav-links">
            <NavLink to="/" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
              All Notifications
            </NavLink>
            <NavLink to="/priority" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
              Priority Inbox
            </NavLink>
          </div>
        </nav>

        <main className="main-content">
          <Routes>
            <Route path="/" element={<AllNotifications />} />
            <Route path="/priority" element={<PriorityInbox />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;

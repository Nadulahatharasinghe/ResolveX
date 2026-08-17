import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';

const AdminPanel = () => {
  const { user } = useContext(AuthContext);

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadStats = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await api.get('/admin/stats');
        setStats(res.data.data);
      } catch (err) {
        if (err.response?.status === 403) {
          setError('You do not have permission to access this page.');
        } else {
          setError(err.response?.data?.message || 'Failed to load admin statistics.');
        }
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  return (
    <div>
      <Navbar />
      <div style={styles.container}>
        {/* Header */}
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>Admin Panel</h1>
            <p style={styles.subtitle}>Welcome, {user?.name}. Here is the platform overview.</p>
          </div>
          <Link to="/admin/users" style={styles.manageUsersBtn}>
            Manage Users →
          </Link>
        </div>

        {error && <div style={styles.errorBox}>{error}</div>}

        {loading ? (
          <div style={styles.loadingBox}>Loading statistics...</div>
        ) : stats ? (
          <>
            {/* Stats Grid */}
            <div style={styles.statsGrid}>
              <div style={{ ...styles.statCard, borderTop: '4px solid #7c3aed' }}>
                <span style={styles.statLabel}>Total Users</span>
                <span style={{ ...styles.statValue, color: '#7c3aed' }}>{stats.totalUsers}</span>
              </div>
              <div style={{ ...styles.statCard, borderTop: '4px solid #4f46e5' }}>
                <span style={styles.statLabel}>Total Issues</span>
                <span style={{ ...styles.statValue, color: '#4f46e5' }}>{stats.totalIssues}</span>
              </div>
              <div style={{ ...styles.statCard, borderTop: '4px solid #3b82f6' }}>
                <span style={styles.statLabel}>Open</span>
                <span style={{ ...styles.statValue, color: '#2563eb' }}>{stats.openIssues}</span>
              </div>
              <div style={{ ...styles.statCard, borderTop: '4px solid #a855f7' }}>
                <span style={styles.statLabel}>In Progress</span>
                <span style={{ ...styles.statValue, color: '#9333ea' }}>{stats.inProgressIssues}</span>
              </div>
              <div style={{ ...styles.statCard, borderTop: '4px solid #10b981' }}>
                <span style={styles.statLabel}>Resolved</span>
                <span style={{ ...styles.statValue, color: '#059669' }}>{stats.resolvedIssues}</span>
              </div>
              <div style={{ ...styles.statCard, borderTop: '4px solid #64748b' }}>
                <span style={styles.statLabel}>Closed</span>
                <span style={{ ...styles.statValue, color: '#475569' }}>{stats.closedIssues}</span>
              </div>
            </div>

            {/* Quick Links */}
            <div style={styles.quickLinks}>
              <h2 style={styles.sectionTitle}>Quick Actions</h2>
              <div style={styles.linkGrid}>
                <Link to="/admin/users" style={styles.quickCard}>
                  <span style={styles.quickIcon}>👥</span>
                  <span style={styles.quickLabel}>Manage Users</span>
                  <span style={styles.quickDesc}>View and update user roles</span>
                </Link>
                <Link to="/issues" style={styles.quickCard}>
                  <span style={styles.quickIcon}>🐛</span>
                  <span style={styles.quickLabel}>All Issues</span>
                  <span style={styles.quickDesc}>Browse, edit, or delete any issue</span>
                </Link>
                <Link to="/create-issue" style={styles.quickCard}>
                  <span style={styles.quickIcon}>➕</span>
                  <span style={styles.quickLabel}>Create Issue</span>
                  <span style={styles.quickDesc}>Add a new issue to the tracker</span>
                </Link>
              </div>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '1100px',
    margin: '30px auto',
    padding: '0 20px'
  },
  header: {
    backgroundColor: '#ffffff',
    padding: '28px 32px',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '20px',
    marginBottom: '25px'
  },
  title: {
    fontSize: '26px',
    fontWeight: 'bold',
    color: '#0f172a'
  },
  subtitle: {
    fontSize: '14px',
    color: '#64748b',
    marginTop: '4px'
  },
  manageUsersBtn: {
    backgroundColor: '#7c3aed',
    color: '#ffffff',
    padding: '10px 20px',
    borderRadius: '8px',
    textDecoration: 'none',
    fontWeight: '600',
    fontSize: '14px'
  },
  errorBox: {
    backgroundColor: '#fee2e2',
    color: '#dc2626',
    padding: '12px 16px',
    borderRadius: '8px',
    marginBottom: '20px',
    fontSize: '14px'
  },
  loadingBox: {
    textAlign: 'center',
    padding: '40px',
    color: '#64748b'
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
    gap: '18px',
    marginBottom: '30px'
  },
  statCard: {
    backgroundColor: '#ffffff',
    padding: '20px',
    borderRadius: '10px',
    boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  statLabel: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  statValue: {
    fontSize: '32px',
    fontWeight: 'bold',
    color: '#0f172a'
  },
  quickLinks: {
    backgroundColor: '#ffffff',
    padding: '24px',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
  },
  sectionTitle: {
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#0f172a',
    marginBottom: '16px'
  },
  linkGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '16px'
  },
  quickCard: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    padding: '20px',
    backgroundColor: '#f8fafc',
    borderRadius: '10px',
    border: '1px solid #e2e8f0',
    textDecoration: 'none',
    transition: 'background-color 0.15s'
  },
  quickIcon: {
    fontSize: '24px'
  },
  quickLabel: {
    fontSize: '15px',
    fontWeight: '600',
    color: '#1e293b'
  },
  quickDesc: {
    fontSize: '13px',
    color: '#64748b'
  }
};

export default AdminPanel;

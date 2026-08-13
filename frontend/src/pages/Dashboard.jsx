import { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { AuthContext } from '../context/AuthContext';
import { getIssues } from '../services/api';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [stats, setStats] = useState({
    total: 0,
    open: 0,
    inProgress: 0,
    resolved: 0,
    highPriority: 0
  });

  const [recentIssues, setRecentIssues] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      setLoading(true);
      try {
        const res = await getIssues();
        const allIssues = res.data.data || [];

        const total = allIssues.length;
        const open = allIssues.filter((i) => i.status === 'Open').length;
        const inProgress = allIssues.filter((i) => i.status === 'In Progress').length;
        const resolved = allIssues.filter((i) => i.status === 'Resolved').length;
        const highPriority = allIssues.filter((i) => i.priority === 'High').length;

        setStats({ total, open, inProgress, resolved, highPriority });
        setRecentIssues(allIssues.slice(0, 4));
      } catch (err) {
        console.error('Failed to load dashboard issue data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  return (
    <div>
      <Navbar />
      <div style={styles.container}>
        {/* Welcome Section */}
        <div style={styles.welcomeBanner}>
          <div>
            <h1 style={styles.title}>Welcome to ResolveX</h1>
            <p style={styles.subtitle}>Hello, {user?.name}! Here is your issue tracking summary.</p>
          </div>
          <div style={styles.quickActions}>
            <Link to="/create-issue" style={styles.primaryBtn}>
              + Create Issue
            </Link>
            <Link to="/issues" style={styles.secondaryBtn}>
              View All Issues
            </Link>
          </div>
        </div>

        {/* Metric Cards Grid */}
        <div style={styles.statsGrid}>
          <div style={{ ...styles.statCard, borderTop: '4px solid #4f46e5' }}>
            <span style={styles.statLabel}>Total Issues</span>
            <span style={styles.statValue}>{loading ? '-' : stats.total}</span>
          </div>

          <div style={{ ...styles.statCard, borderTop: '4px solid #3b82f6' }}>
            <span style={styles.statLabel}>Open</span>
            <span style={{ ...styles.statValue, color: '#2563eb' }}>{loading ? '-' : stats.open}</span>
          </div>

          <div style={{ ...styles.statCard, borderTop: '4px solid #a855f7' }}>
            <span style={styles.statLabel}>In Progress</span>
            <span style={{ ...styles.statValue, color: '#9333ea' }}>{loading ? '-' : stats.inProgress}</span>
          </div>

          <div style={{ ...styles.statCard, borderTop: '4px solid #10b981' }}>
            <span style={styles.statLabel}>Resolved</span>
            <span style={{ ...styles.statValue, color: '#059669' }}>{loading ? '-' : stats.resolved}</span>
          </div>

          <div style={{ ...styles.statCard, borderTop: '4px solid #f97316' }}>
            <span style={styles.statLabel}>High Priority</span>
            <span style={{ ...styles.statValue, color: '#ea580c' }}>{loading ? '-' : stats.highPriority}</span>
          </div>
        </div>

        {/* Recent Activity / Issues Section */}
        <div style={styles.recentSection}>
          <div style={styles.recentHeader}>
            <h2 style={styles.recentTitle}>Recent Issues</h2>
            <Link to="/issues" style={styles.viewAllLink}>
              View all →
            </Link>
          </div>

          {loading ? (
            <p style={{ color: '#64748b', padding: '20px' }}>Loading summary...</p>
          ) : recentIssues.length === 0 ? (
            <div style={styles.emptyCard}>
              <p>No issues registered yet.</p>
              <Link to="/create-issue" style={{ color: '#4f46e5', textDecoration: 'none', fontWeight: '500', marginTop: '6px', display: 'inline-block' }}>
                Create your first issue
              </Link>
            </div>
          ) : (
            <div style={styles.recentList}>
              {recentIssues.map((issue) => (
                <div
                  key={issue._id}
                  style={styles.recentItem}
                  onClick={() => navigate(`/issues/${issue._id}`)}
                >
                  <div>
                    <h4 style={styles.issueItemTitle}>{issue.title}</h4>
                    <span style={styles.issueMeta}>
                      {issue.issueType} • Priority: {issue.priority} • Assigned to: {issue.assignee ? issue.assignee.name : 'Unassigned'}
                    </span>
                  </div>
                  <span style={styles.statusBadge}>{issue.status}</span>
                </div>
              ))}
            </div>
          )}
        </div>
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
  welcomeBanner: {
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
  quickActions: {
    display: 'flex',
    gap: '12px'
  },
  primaryBtn: {
    backgroundColor: '#4f46e5',
    color: '#ffffff',
    padding: '10px 18px',
    borderRadius: '8px',
    textDecoration: 'none',
    fontWeight: '600',
    fontSize: '14px'
  },
  secondaryBtn: {
    backgroundColor: '#f1f5f9',
    color: '#334155',
    padding: '10px 18px',
    borderRadius: '8px',
    textDecoration: 'none',
    fontWeight: '600',
    fontSize: '14px',
    border: '1px solid #cbd5e1'
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
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
    fontSize: '28px',
    fontWeight: 'bold',
    color: '#0f172a'
  },
  recentSection: {
    backgroundColor: '#ffffff',
    padding: '24px',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
  },
  recentHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px'
  },
  recentTitle: {
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#0f172a'
  },
  viewAllLink: {
    color: '#4f46e5',
    textDecoration: 'none',
    fontSize: '14px',
    fontWeight: '500'
  },
  emptyCard: {
    padding: '30px',
    textAlign: 'center',
    color: '#64748b'
  },
  recentList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px'
  },
  recentItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 16px',
    backgroundColor: '#f8fafc',
    borderRadius: '8px',
    border: '1px solid #f1f5f9',
    cursor: 'pointer',
    transition: 'background-color 0.15s'
  },
  issueItemTitle: {
    fontSize: '15px',
    fontWeight: '600',
    color: '#1e293b'
  },
  issueMeta: {
    fontSize: '12px',
    color: '#64748b',
    marginTop: '2px',
    display: 'block'
  },
  statusBadge: {
    fontSize: '12px',
    fontWeight: '600',
    backgroundColor: '#e2e8f0',
    color: '#334155',
    padding: '4px 10px',
    borderRadius: '12px'
  }
};

export default Dashboard;

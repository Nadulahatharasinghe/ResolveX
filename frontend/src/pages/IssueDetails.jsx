import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { getIssueById, updateIssue, deleteIssue } from '../services/api';
import { AuthContext } from '../context/AuthContext';

// Translate HTTP status codes to user-friendly messages
const getErrorMessage = (err) => {
  const status = err.response?.status;
  if (status === 401) return 'You must be logged in to perform this action.';
  if (status === 403) return 'You do not have permission to perform this action.';
  if (status === 404) return 'Issue not found.';
  return err.response?.data?.message || 'An unexpected error occurred.';
};

const IssueDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const isAdmin = user?.role === 'admin';

  const [issue, setIssue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const fetchIssue = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getIssueById(id);
      setIssue(res.data.data);
    } catch (err) {
      console.error('Fetch issue details error:', err);
      setError(err.response?.data?.message || 'Failed to load issue details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIssue();
  }, [id]);

  const handleStatusChange = async (newStatus) => {
    if (!issue || issue.status === newStatus) return;
    setStatusUpdating(true);
    try {
      const res = await updateIssue(id, { status: newStatus });
      setIssue(res.data.data);
      setSuccessMsg(`Status updated to "${newStatus}"`);
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setStatusUpdating(false);
    }
  };

  const handleDelete = async () => {
    const creatorId = issue?.createdBy?._id || issue?.createdBy;
    const currentUserId = user?._id || user?.id;
    const canDelete = isAdmin || creatorId === currentUserId;

    if (!canDelete) {
      setError('Only the creator or an admin can delete this issue.');
      return;
    }

    if (window.confirm(`Are you sure you want to delete "${issue.title}"?`)) {
      try {
        await deleteIssue(id);
        navigate('/issues');
      } catch (err) {
        setError(getErrorMessage(err));
      }
    }
  };

  const getTypeBadgeStyle = (type) => {
    return type === 'Bug'
      ? { backgroundColor: '#fee2e2', color: '#991b1b', border: '1px solid #f87171' }
      : { backgroundColor: '#e0f2fe', color: '#075985', border: '1px solid #38bdf8' };
  };

  const getPriorityBadgeStyle = (prio) => {
    switch (prio) {
      case 'High':
        return { backgroundColor: '#ffedd5', color: '#9a3412', border: '1px solid #fb923c' };
      case 'Medium':
        return { backgroundColor: '#fef9c3', color: '#854d0e', border: '1px solid #facc15' };
      case 'Low':
        return { backgroundColor: '#dcfce7', color: '#166534', border: '1px solid #4ade80' };
      default:
        return { backgroundColor: '#f1f5f9', color: '#475569' };
    }
  };

  if (loading) {
    return (
      <div>
        <Navbar />
        <div style={styles.loadingContainer}>
          <p>Loading issue details...</p>
        </div>
      </div>
    );
  }

  if (error || !issue) {
    return (
      <div>
        <Navbar />
        <div style={styles.errorContainer}>
          <h2>Issue Not Found</h2>
          <p style={{ color: '#64748b', marginTop: '8px', marginBottom: '20px' }}>
            {error || 'The requested issue does not exist or you do not have permission to view it.'}
          </p>
          <Link to="/issues" style={styles.backBtn}>
            ← Back to Issues
          </Link>
        </div>
      </div>
    );
  }

  const creatorId = issue.createdBy?._id || issue.createdBy;
  const currentUserId = user?._id || user?.id;
  const isOwner = creatorId === currentUserId;
  const canDelete = isAdmin || isOwner;

  return (
    <div>
      <Navbar />
      <div style={styles.container}>
        <div style={{ marginBottom: '15px' }}>
          <Link to="/issues" style={styles.backLink}>
            ← Back to All Issues
          </Link>
        </div>

        {successMsg && <div style={styles.successBanner}>{successMsg}</div>}
        {error && <div style={styles.errorBanner}>{error}</div>}

        <div style={styles.mainCard}>
          {/* Top Header Row */}
          <div style={styles.headerRow}>
            <div>
              <div style={styles.badgeGroup}>
                <span style={{ ...styles.badge, ...getTypeBadgeStyle(issue.issueType) }}>
                  {issue.issueType}
                </span>
                <span style={{ ...styles.badge, ...getPriorityBadgeStyle(issue.priority) }}>
                  Priority: {issue.priority}
                </span>
              </div>
              <h1 style={styles.issueTitle}>{issue.title}</h1>
            </div>

            <div style={styles.actionGroup}>
              <button
                onClick={() => navigate(`/issues/${issue._id}/edit`)}
                style={styles.editBtn}
                id="edit-issue-btn"
              >
                Edit Issue
              </button>
              {canDelete && (
                <button
                  onClick={handleDelete}
                  style={styles.deleteBtn}
                  id="delete-issue-btn"
                >
                  Delete Issue
                </button>
              )}
            </div>
          </div>

          <hr style={styles.divider} />

          {/* Quick Status Control Bar */}
          <div style={styles.statusBox}>
            <span style={styles.statusLabel}>Current Status:</span>
            <select
              value={issue.status}
              onChange={(e) => handleStatusChange(e.target.value)}
              disabled={statusUpdating}
              style={styles.statusSelect}
              id="inline-status-select"
            >
              <option value="Open">Open</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
              <option value="Closed">Closed</option>
            </select>
            {statusUpdating && <span style={styles.updatingText}>Updating...</span>}
          </div>

          {/* Main Description */}
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Description</h3>
            <div style={styles.descriptionText}>{issue.description}</div>
          </div>

          <hr style={styles.divider} />

          {/* Metadata Grid */}
          <div style={styles.grid}>
            <div style={styles.gridItem}>
              <span style={styles.metaLabel}>Assignee</span>
              <span style={styles.metaValue}>
                {issue.assignee ? `${issue.assignee.name} (${issue.assignee.email})` : 'Unassigned'}
              </span>
            </div>

            <div style={styles.gridItem}>
              <span style={styles.metaLabel}>Created By</span>
              <span style={styles.metaValue}>
                {issue.createdBy ? `${issue.createdBy.name} (${issue.createdBy.email})` : 'Unknown'}
              </span>
            </div>

            <div style={styles.gridItem}>
              <span style={styles.metaLabel}>Due Date</span>
              <span style={styles.metaValue}>
                {issue.dueDate ? new Date(issue.dueDate).toLocaleDateString() : 'None set'}
              </span>
            </div>

            <div style={styles.gridItem}>
              <span style={styles.metaLabel}>Created Date</span>
              <span style={styles.metaValue}>
                {new Date(issue.createdAt).toLocaleString()}
              </span>
            </div>

            <div style={styles.gridItem}>
              <span style={styles.metaLabel}>Last Updated</span>
              <span style={styles.metaValue}>
                {new Date(issue.updatedAt).toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '900px',
    margin: '30px auto',
    padding: '0 20px'
  },
  backLink: {
    color: '#4f46e5',
    textDecoration: 'none',
    fontSize: '14px',
    fontWeight: '500'
  },
  backBtn: {
    display: 'inline-block',
    padding: '10px 20px',
    backgroundColor: '#4f46e5',
    color: '#fff',
    textDecoration: 'none',
    borderRadius: '6px',
    fontWeight: '500'
  },
  loadingContainer: {
    textAlign: 'center',
    padding: '60px',
    color: '#64748b'
  },
  errorContainer: {
    textAlign: 'center',
    padding: '60px 20px',
    backgroundColor: '#fff',
    maxWidth: '500px',
    margin: '50px auto',
    borderRadius: '10px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
  },
  successBanner: {
    backgroundColor: '#d1fae5',
    color: '#059669',
    padding: '12px',
    borderRadius: '8px',
    marginBottom: '20px',
    fontSize: '14px'
  },
  errorBanner: {
    backgroundColor: '#fee2e2',
    color: '#dc2626',
    padding: '12px',
    borderRadius: '8px',
    marginBottom: '20px',
    fontSize: '14px'
  },
  mainCard: {
    backgroundColor: '#ffffff',
    padding: '35px',
    borderRadius: '12px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.06)'
  },
  headerRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
    gap: '15px'
  },
  badgeGroup: {
    display: 'flex',
    gap: '10px',
    marginBottom: '10px'
  },
  badge: {
    padding: '4px 12px',
    borderRadius: '12px',
    fontSize: '13px',
    fontWeight: '600'
  },
  issueTitle: {
    fontSize: '26px',
    fontWeight: 'bold',
    color: '#0f172a',
    lineHeight: 1.3
  },
  actionGroup: {
    display: 'flex',
    gap: '10px'
  },
  editBtn: {
    padding: '8px 16px',
    backgroundColor: '#fef3c7',
    color: '#92400e',
    border: '1px solid #fde047',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '14px'
  },
  deleteBtn: {
    padding: '8px 16px',
    backgroundColor: '#fee2e2',
    color: '#b91c1c',
    border: '1px solid #fca5a5',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '14px'
  },
  divider: {
    border: 'none',
    borderTop: '1px solid #e2e8f0',
    margin: '25px 0'
  },
  statusBox: {
    backgroundColor: '#f8fafc',
    padding: '12px 18px',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  statusLabel: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#334155'
  },
  statusSelect: {
    padding: '6px 12px',
    borderRadius: '6px',
    border: '1px solid #cbd5e1',
    fontSize: '14px',
    backgroundColor: '#fff',
    outline: 'none',
    fontWeight: '600'
  },
  updatingText: {
    fontSize: '13px',
    color: '#64748b',
    fontStyle: 'italic'
  },
  section: {
    marginTop: '20px'
  },
  sectionTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#334155',
    marginBottom: '10px'
  },
  descriptionText: {
    fontSize: '15px',
    color: '#1e293b',
    lineHeight: '1.6',
    whiteSpace: 'pre-wrap',
    backgroundColor: '#fafafa',
    padding: '16px',
    borderRadius: '8px',
    border: '1px solid #f1f5f9'
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: '20px'
  },
  gridItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },
  metaLabel: {
    fontSize: '12px',
    fontWeight: '600',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  metaValue: {
    fontSize: '14px',
    color: '#0f172a',
    fontWeight: '500'
  }
};

export default IssueDetails;

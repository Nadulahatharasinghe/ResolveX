import { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { getIssues, deleteIssue } from '../services/api';
import { AuthContext } from '../context/AuthContext';

// Translate HTTP status codes to user-friendly messages
const getErrorMessage = (err) => {
  const status = err.response?.status;
  if (status === 401) return 'You must be logged in to perform this action.';
  if (status === 403) return 'You do not have permission to perform this action.';
  if (status === 404) return 'Issue not found.';
  return err.response?.data?.message || 'An unexpected error occurred.';
};

const Issues = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const isAdmin = user?.role === 'admin';

  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Search & Filter State
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [priority, setPriority] = useState('');
  const [issueType, setIssueType] = useState('');

  const fetchIssuesList = async () => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (search.trim()) params.search = search.trim();
      if (status) params.status = status;
      if (priority) params.priority = priority;
      if (issueType) params.issueType = issueType;

      const res = await getIssues(params);
      setIssues(res.data.data);
    } catch (err) {
      console.error('Fetch issues error:', err);
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIssuesList();
  }, [status, priority, issueType]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchIssuesList();
  };

  const handleClearFilters = () => {
    setSearch('');
    setStatus('');
    setPriority('');
    setIssueType('');
  };

  const handleDelete = async (id, title, createdById) => {
    const currentUserId = user?._id || user?.id;
    const canDelete = isAdmin || createdById === currentUserId;

    if (!canDelete) {
      setError('Only the issue creator or an admin can delete this issue.');
      return;
    }

    if (window.confirm(`Are you sure you want to delete "${title}"?`)) {
      try {
        await deleteIssue(id);
        setSuccessMsg('Issue deleted successfully');
        setIssues(issues.filter((issue) => issue._id !== id));
        setTimeout(() => setSuccessMsg(''), 3000);
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

  const getStatusBadgeStyle = (st) => {
    switch (st) {
      case 'Open':
        return { backgroundColor: '#dbeafe', color: '#1e40af' };
      case 'In Progress':
        return { backgroundColor: '#f3e8ff', color: '#6b21a8' };
      case 'Resolved':
        return { backgroundColor: '#d1fae5', color: '#065f46' };
      case 'Closed':
        return { backgroundColor: '#e2e8f0', color: '#475569' };
      default:
        return { backgroundColor: '#f1f5f9', color: '#475569' };
    }
  };

  return (
    <div>
      <Navbar />
      <div style={styles.pageContainer}>
        <div style={styles.headerRow}>
          <div>
            <h1 style={styles.pageTitle}>Issue Tracker</h1>
            <p style={styles.pageSubtitle}>Manage and track your software development issues</p>
          </div>
          <Link to="/create-issue" style={styles.createBtn} id="create-issue-btn">
            + Create New Issue
          </Link>
        </div>

        {error && <div style={styles.errorBanner}>{error}</div>}
        {successMsg && <div style={styles.successBanner}>{successMsg}</div>}

        {/* Search & Filter Toolbar */}
        <div style={styles.toolbar}>
          <form onSubmit={handleSearchSubmit} style={styles.searchForm}>
            <input
              type="text"
              placeholder="Search title or description..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={styles.searchInput}
              id="search-input"
            />
            <button type="submit" style={styles.searchBtn} id="search-submit">
              Search
            </button>
          </form>

          <div style={styles.filterGroup}>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              style={styles.selectInput}
              id="status-filter"
            >
              <option value="">Status: All</option>
              <option value="Open">Open</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
              <option value="Closed">Closed</option>
            </select>

            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              style={styles.selectInput}
              id="priority-filter"
            >
              <option value="">Priority: All</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>

            <select
              value={issueType}
              onChange={(e) => setIssueType(e.target.value)}
              style={styles.selectInput}
              id="type-filter"
            >
              <option value="">Type: All</option>
              <option value="Bug">Bug</option>
              <option value="Task">Task</option>
            </select>

            {(search || status || priority || issueType) && (
              <button onClick={handleClearFilters} style={styles.clearBtn} id="clear-filters-btn">
                Clear Filters
              </button>
            )}
          </div>
        </div>

        {/* Issues List / Table */}
        {loading ? (
          <div style={styles.loadingBox}>
            <p>Loading issues...</p>
          </div>
        ) : issues.length === 0 ? (
          <div style={styles.emptyBox}>
            <h3>No issues found</h3>
            <p style={{ color: '#64748b', marginTop: '6px' }}>
              Try adjusting your search criteria or create a new issue.
            </p>
          </div>
        ) : (
          <div style={styles.tableCard}>
            <div style={styles.tableWrapper}>
              <table style={styles.table}>
                <thead>
                  <tr style={styles.thRow}>
                    <th style={styles.th}>Title</th>
                    <th style={styles.th}>Type</th>
                    <th style={styles.th}>Priority</th>
                    <th style={styles.th}>Status</th>
                    <th style={styles.th}>Assignee</th>
                    <th style={styles.th}>Created</th>
                    <th style={styles.th}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {issues.map((issue) => {
                    const creatorId = issue.createdBy?._id || issue.createdBy;
                    const currentUserId = user?._id || user?.id;
                    const isOwner = creatorId?.toString() === currentUserId?.toString();
                    const canEdit   = isAdmin || isOwner;
                    const canDelete = isAdmin || isOwner;

                    return (
                      <tr key={issue._id} style={styles.tr}>
                        <td style={styles.tdTitle}>
                          <Link to={`/issues/${issue._id}`} style={styles.issueTitleLink}>
                            {issue.title}
                          </Link>
                          <div style={styles.descSnippet}>
                            {issue.description.length > 70
                              ? issue.description.substring(0, 70) + '...'
                              : issue.description}
                          </div>
                        </td>
                        <td style={styles.td}>
                          <span style={{ ...styles.badge, ...getTypeBadgeStyle(issue.issueType) }}>
                            {issue.issueType}
                          </span>
                        </td>
                        <td style={styles.td}>
                          <span style={{ ...styles.badge, ...getPriorityBadgeStyle(issue.priority) }}>
                            {issue.priority}
                          </span>
                        </td>
                        <td style={styles.td}>
                          <span style={{ ...styles.badge, ...getStatusBadgeStyle(issue.status) }}>
                            {issue.status}
                          </span>
                        </td>
                        <td style={styles.td}>
                          {issue.assignee ? (
                            <span style={styles.assigneeName}>{issue.assignee.name}</span>
                          ) : (
                            <span style={styles.unassigned}>Unassigned</span>
                          )}
                        </td>
                        <td style={styles.tdDate}>
                          {new Date(issue.createdAt).toLocaleDateString()}
                        </td>
                        <td style={styles.tdActions}>
                          <button
                            onClick={() => navigate(`/issues/${issue._id}`)}
                            style={styles.viewActionBtn}
                          >
                            View
                          </button>
                          {canEdit && (
                            <button
                              onClick={() => navigate(`/issues/${issue._id}/edit`)}
                              style={styles.editActionBtn}
                            >
                              Edit
                            </button>
                          )}
                          {canDelete && (
                            <button
                              onClick={() => handleDelete(issue._id, issue.title, creatorId)}
                              style={styles.deleteActionBtn}
                            >
                              Delete
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  pageContainer: {
    maxWidth: '1100px',
    margin: '30px auto',
    padding: '0 20px'
  },
  headerRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '25px',
    flexWrap: 'wrap',
    gap: '15px'
  },
  pageTitle: {
    fontSize: '28px',
    fontWeight: 'bold',
    color: '#0f172a'
  },
  pageSubtitle: {
    color: '#64748b',
    fontSize: '14px',
    marginTop: '4px'
  },
  createBtn: {
    backgroundColor: '#4f46e5',
    color: '#ffffff',
    padding: '10px 20px',
    borderRadius: '8px',
    textDecoration: 'none',
    fontWeight: '600',
    fontSize: '14px',
    boxShadow: '0 2px 4px rgba(79, 70, 229, 0.2)'
  },
  errorBanner: {
    backgroundColor: '#fee2e2',
    color: '#dc2626',
    padding: '12px',
    borderRadius: '8px',
    marginBottom: '20px',
    fontSize: '14px'
  },
  successBanner: {
    backgroundColor: '#d1fae5',
    color: '#059669',
    padding: '12px',
    borderRadius: '8px',
    marginBottom: '20px',
    fontSize: '14px'
  },
  toolbar: {
    backgroundColor: '#ffffff',
    padding: '16px',
    borderRadius: '10px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    marginBottom: '25px',
    display: 'flex',
    flexDirection: 'column',
    gap: '15px'
  },
  searchForm: {
    display: 'flex',
    gap: '10px'
  },
  searchInput: {
    flex: 1,
    padding: '10px 14px',
    border: '1px solid #cbd5e1',
    borderRadius: '6px',
    fontSize: '14px',
    outline: 'none'
  },
  searchBtn: {
    padding: '10px 20px',
    backgroundColor: '#334155',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: '500'
  },
  filterGroup: {
    display: 'flex',
    gap: '12px',
    flexWrap: 'wrap',
    alignItems: 'center'
  },
  selectInput: {
    padding: '8px 12px',
    border: '1px solid #cbd5e1',
    borderRadius: '6px',
    fontSize: '14px',
    backgroundColor: '#fff',
    outline: 'none'
  },
  clearBtn: {
    padding: '8px 14px',
    backgroundColor: '#f1f5f9',
    color: '#475569',
    border: '1px solid #cbd5e1',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '13px'
  },
  tableCard: {
    backgroundColor: '#ffffff',
    borderRadius: '10px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
    overflow: 'hidden'
  },
  tableWrapper: {
    overflowX: 'auto'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    textAlign: 'left'
  },
  thRow: {
    backgroundColor: '#f8fafc',
    borderBottom: '1px solid #e2e8f0'
  },
  th: {
    padding: '14px 16px',
    fontSize: '13px',
    fontWeight: '600',
    color: '#475569',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  tr: {
    borderBottom: '1px solid #f1f5f9',
    transition: 'background-color 0.15s'
  },
  tdTitle: {
    padding: '14px 16px',
    minWidth: '220px'
  },
  issueTitleLink: {
    fontSize: '15px',
    fontWeight: '600',
    color: '#1e293b',
    textDecoration: 'none'
  },
  descSnippet: {
    fontSize: '13px',
    color: '#64748b',
    marginTop: '3px'
  },
  td: {
    padding: '14px 16px',
    fontSize: '14px',
    whiteSpace: 'nowrap'
  },
  tdDate: {
    padding: '14px 16px',
    fontSize: '13px',
    color: '#64748b',
    whiteSpace: 'nowrap'
  },
  tdActions: {
    padding: '14px 16px',
    whiteSpace: 'nowrap'
  },
  badge: {
    display: 'inline-block',
    padding: '4px 10px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '600'
  },
  assigneeName: {
    color: '#334155',
    fontWeight: '500'
  },
  unassigned: {
    color: '#94a3b8',
    fontStyle: 'italic'
  },
  viewActionBtn: {
    padding: '5px 10px',
    backgroundColor: '#e0f2fe',
    color: '#0369a1',
    border: 'none',
    borderRadius: '4px',
    marginRight: '6px',
    cursor: 'pointer',
    fontSize: '13px'
  },
  editActionBtn: {
    padding: '5px 10px',
    backgroundColor: '#fef3c7',
    color: '#92400e',
    border: 'none',
    borderRadius: '4px',
    marginRight: '6px',
    cursor: 'pointer',
    fontSize: '13px'
  },
  deleteActionBtn: {
    padding: '5px 10px',
    backgroundColor: '#fee2e2',
    color: '#b91c1c',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '13px'
  },
  loadingBox: {
    textAlign: 'center',
    padding: '40px',
    backgroundColor: '#fff',
    borderRadius: '8px',
    color: '#64748b'
  },
  emptyBox: {
    textAlign: 'center',
    padding: '50px',
    backgroundColor: '#fff',
    borderRadius: '8px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
  }
};

export default Issues;

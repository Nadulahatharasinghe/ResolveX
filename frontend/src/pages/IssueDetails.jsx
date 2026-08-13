import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { getIssueById, deleteIssue, changeStatus } from '../services/api';
import { AuthContext } from '../context/AuthContext';

const getErrorMessage = (err) => {
  const status = err.response?.status;
  if (status === 401) return 'You must be logged in to perform this action.';
  if (status === 403) return err.response?.data?.message || 'You do not have permission to perform this action.';
  if (status === 404) return 'Issue not found.';
  return err.response?.data?.message || 'An unexpected error occurred.';
};

const STATUS_OPTIONS = ['Open', 'In Progress', 'Resolved', 'Closed'];

const statusColors = {
  'Open':        { backgroundColor: '#dbeafe', color: '#1e40af' },
  'In Progress': { backgroundColor: '#f3e8ff', color: '#6b21a8' },
  'Resolved':    { backgroundColor: '#d1fae5', color: '#065f46' },
  'Closed':      { backgroundColor: '#e2e8f0', color: '#475569' },
};

const IssueDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const isAdmin = user?.role === 'admin';

  const [issue, setIssue]           = useState(null);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Status-change modal state
  const [pendingStatus, setPendingStatus] = useState('');   // new status user picked
  const [showModal, setShowModal]         = useState(false);
  const [statusComment, setStatusComment] = useState('');
  const [commentError, setCommentError]   = useState('');
  const [statusUpdating, setStatusUpdating] = useState(false);

  const fetchIssue = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getIssueById(id);
      setIssue(res.data.data);
    } catch (err) {
      console.error('Fetch issue details error:', err);
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchIssue(); }, [id]);

  // Step 1 — user picks a new status from the dropdown
  const handleStatusSelect = (newStatus) => {
    if (!issue || issue.status === newStatus) return;
    setPendingStatus(newStatus);
    setStatusComment('');
    setCommentError('');
    setShowModal(true);
  };

  // Step 2 — user submits the modal with a required comment
  const handleStatusConfirm = async () => {
    if (!statusComment.trim()) {
      setCommentError('Please describe why you are changing the status.');
      return;
    }
    setStatusUpdating(true);
    setCommentError('');
    try {
      const res = await changeStatus(id, pendingStatus, statusComment.trim());
      setIssue(res.data.data);
      setSuccessMsg(`Status changed to "${pendingStatus}"`);
      setTimeout(() => setSuccessMsg(''), 4000);
      setShowModal(false);
      setStatusComment('');
    } catch (err) {
      setCommentError(getErrorMessage(err));
    } finally {
      setStatusUpdating(false);
    }
  };

  const handleModalCancel = () => {
    setShowModal(false);
    setPendingStatus('');
    setStatusComment('');
    setCommentError('');
  };

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete "${issue.title}"?`)) {
      try {
        await deleteIssue(id);
        navigate('/issues');
      } catch (err) {
        setError(getErrorMessage(err));
      }
    }
  };

  const getTypeBadgeStyle = (type) =>
    type === 'Bug'
      ? { backgroundColor: '#fee2e2', color: '#991b1b', border: '1px solid #f87171' }
      : { backgroundColor: '#e0f2fe', color: '#075985', border: '1px solid #38bdf8' };

  const getPriorityBadgeStyle = (prio) => {
    switch (prio) {
      case 'High':   return { backgroundColor: '#ffedd5', color: '#9a3412', border: '1px solid #fb923c' };
      case 'Medium': return { backgroundColor: '#fef9c3', color: '#854d0e', border: '1px solid #facc15' };
      case 'Low':    return { backgroundColor: '#dcfce7', color: '#166534', border: '1px solid #4ade80' };
      default:       return { backgroundColor: '#f1f5f9', color: '#475569' };
    }
  };

  if (loading) {
    return (
      <div><Navbar />
        <div style={styles.loadingContainer}><p>Loading issue details...</p></div>
      </div>
    );
  }

  if (error || !issue) {
    return (
      <div><Navbar />
        <div style={styles.errorContainer}>
          <h2>{error?.includes('not authorized') || error?.includes('permission') ? 'Access Denied' : 'Issue Not Found'}</h2>
          <p style={{ color: '#64748b', marginTop: '8px', marginBottom: '20px' }}>
            {error || 'The requested issue does not exist or you do not have permission to view it.'}
          </p>
          <Link to="/issues" style={styles.backBtn}>← Back to Issues</Link>
        </div>
      </div>
    );
  }

  const creatorId    = issue.createdBy?._id || issue.createdBy;
  const currentUserId = user?._id || user?.id;
  const isOwner      = creatorId?.toString() === currentUserId?.toString();
  const canEdit      = isAdmin || isOwner;
  const canDelete    = isAdmin || isOwner;

  return (
    <div>
      <Navbar />
      <div style={styles.container}>

        {/* Status-change modal */}
        {showModal && (
          <div style={styles.modalOverlay}>
            <div style={styles.modal}>
              <h3 style={styles.modalTitle}>Change Status to "{pendingStatus}"</h3>
              <p style={styles.modalSubtitle}>
                Please describe why you are changing the status. This is required.
              </p>
              <textarea
                value={statusComment}
                onChange={(e) => { setStatusComment(e.target.value); setCommentError(''); }}
                placeholder="e.g. Fixed the null-pointer exception in login handler..."
                rows={4}
                style={{ ...styles.modalTextarea, ...(commentError ? { borderColor: '#ef4444' } : {}) }}
                autoFocus
              />
              {commentError && <p style={styles.modalError}>{commentError}</p>}
              <div style={styles.modalBtns}>
                <button onClick={handleModalCancel} style={styles.modalCancelBtn} disabled={statusUpdating}>
                  Cancel
                </button>
                <button onClick={handleStatusConfirm} style={styles.modalConfirmBtn} disabled={statusUpdating}>
                  {statusUpdating ? 'Saving...' : 'Confirm Change'}
                </button>
              </div>
            </div>
          </div>
        )}

        <div style={{ marginBottom: '15px' }}>
          <Link to="/issues" style={styles.backLink}>← Back to All Issues</Link>
        </div>

        {successMsg && <div style={styles.successBanner}>{successMsg}</div>}
        {error      && <div style={styles.errorBanner}>{error}</div>}

        <div style={styles.mainCard}>
          {/* Header row */}
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
              {canEdit && (
                <button
                  onClick={() => navigate(`/issues/${issue._id}/edit`)}
                  style={styles.editBtn}
                  id="edit-issue-btn"
                >
                  Edit Issue
                </button>
              )}
              {canDelete && (
                <button onClick={handleDelete} style={styles.deleteBtn} id="delete-issue-btn">
                  Delete Issue
                </button>
              )}
            </div>
          </div>

          <hr style={styles.divider} />

          {/* Status control — available to ALL authenticated users */}
          <div style={styles.statusBox}>
            <span style={styles.statusLabel}>Current Status:</span>
            <select
              value={issue.status}
              onChange={(e) => handleStatusSelect(e.target.value)}
              style={styles.statusSelect}
              id="inline-status-select"
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <span style={{ ...styles.statusBadge, ...(statusColors[issue.status] || {}) }}>
              {issue.status}
            </span>
          </div>

          {/* Description */}
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Description</h3>
            <div style={styles.descriptionText}>{issue.description}</div>
          </div>

          <hr style={styles.divider} />

          {/* Metadata grid */}
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
              <span style={styles.metaValue}>{new Date(issue.createdAt).toLocaleString()}</span>
            </div>
            <div style={styles.gridItem}>
              <span style={styles.metaLabel}>Last Updated</span>
              <span style={styles.metaValue}>{new Date(issue.updatedAt).toLocaleString()}</span>
            </div>
          </div>

          {/* Status History */}
          {issue.statusHistory && issue.statusHistory.length > 0 && (
            <>
              <hr style={styles.divider} />
              <div style={styles.section}>
                <h3 style={styles.sectionTitle}>Status History</h3>
                <div style={styles.historyList}>
                  {[...issue.statusHistory].reverse().map((entry, idx) => (
                    <div key={idx} style={styles.historyItem}>
                      <div style={styles.historyHeader}>
                        <span style={{ ...styles.historyStatusBadge, ...(statusColors[entry.status] || {}) }}>
                          {entry.status}
                        </span>
                        <span style={styles.historyMeta}>
                          by <strong>{entry.changedBy?.name || 'Unknown'}</strong>
                          {' · '}
                          {new Date(entry.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <p style={styles.historyComment}>{entry.comment}</p>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

const styles = {
  container:        { maxWidth: '900px', margin: '30px auto', padding: '0 20px' },
  backLink:         { color: '#4f46e5', textDecoration: 'none', fontSize: '14px', fontWeight: '500' },
  backBtn:          { display: 'inline-block', padding: '10px 20px', backgroundColor: '#4f46e5', color: '#fff', textDecoration: 'none', borderRadius: '6px', fontWeight: '500' },
  loadingContainer: { textAlign: 'center', padding: '60px', color: '#64748b' },
  errorContainer:   { textAlign: 'center', padding: '60px 20px', backgroundColor: '#fff', maxWidth: '500px', margin: '50px auto', borderRadius: '10px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' },
  successBanner:    { backgroundColor: '#d1fae5', color: '#059669', padding: '12px', borderRadius: '8px', marginBottom: '20px', fontSize: '14px' },
  errorBanner:      { backgroundColor: '#fee2e2', color: '#dc2626', padding: '12px', borderRadius: '8px', marginBottom: '20px', fontSize: '14px' },
  mainCard:         { backgroundColor: '#ffffff', padding: '35px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.06)' },
  headerRow:        { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '15px' },
  badgeGroup:       { display: 'flex', gap: '10px', marginBottom: '10px' },
  badge:            { padding: '4px 12px', borderRadius: '12px', fontSize: '13px', fontWeight: '600' },
  issueTitle:       { fontSize: '26px', fontWeight: 'bold', color: '#0f172a', lineHeight: 1.3 },
  actionGroup:      { display: 'flex', gap: '10px' },
  editBtn:          { padding: '8px 16px', backgroundColor: '#fef3c7', color: '#92400e', border: '1px solid #fde047', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '14px' },
  deleteBtn:        { padding: '8px 16px', backgroundColor: '#fee2e2', color: '#b91c1c', border: '1px solid #fca5a5', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '14px' },
  divider:          { border: 'none', borderTop: '1px solid #e2e8f0', margin: '25px 0' },
  statusBox:        { backgroundColor: '#f8fafc', padding: '12px 18px', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' },
  statusLabel:      { fontSize: '14px', fontWeight: '600', color: '#334155' },
  statusSelect:     { padding: '6px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px', backgroundColor: '#fff', outline: 'none', fontWeight: '600', cursor: 'pointer' },
  statusBadge:      { padding: '4px 12px', borderRadius: '12px', fontSize: '13px', fontWeight: '700' },
  section:          { marginTop: '20px' },
  sectionTitle:     { fontSize: '16px', fontWeight: '600', color: '#334155', marginBottom: '12px' },
  descriptionText:  { fontSize: '15px', color: '#1e293b', lineHeight: '1.6', whiteSpace: 'pre-wrap', backgroundColor: '#fafafa', padding: '16px', borderRadius: '8px', border: '1px solid #f1f5f9' },
  grid:             { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' },
  gridItem:         { display: 'flex', flexDirection: 'column', gap: '4px' },
  metaLabel:        { fontSize: '12px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' },
  metaValue:        { fontSize: '14px', color: '#0f172a', fontWeight: '500' },

  // Status history
  historyList:      { display: 'flex', flexDirection: 'column', gap: '12px' },
  historyItem:      { backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '14px 16px' },
  historyHeader:    { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px', flexWrap: 'wrap' },
  historyStatusBadge:{ padding: '3px 10px', borderRadius: '10px', fontSize: '12px', fontWeight: '700' },
  historyMeta:      { fontSize: '13px', color: '#64748b' },
  historyComment:   { fontSize: '14px', color: '#1e293b', margin: 0, lineHeight: '1.5' },

  // Modal
  modalOverlay: {
    position: 'fixed', inset: 0,
    backgroundColor: 'rgba(0,0,0,0.45)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 999, padding: '20px'
  },
  modal: {
    backgroundColor: '#fff', borderRadius: '12px',
    padding: '32px', width: '100%', maxWidth: '480px',
    boxShadow: '0 8px 30px rgba(0,0,0,0.15)'
  },
  modalTitle:    { fontSize: '18px', fontWeight: 'bold', color: '#0f172a', marginBottom: '8px' },
  modalSubtitle: { fontSize: '14px', color: '#64748b', marginBottom: '16px' },
  modalTextarea: {
    width: '100%', padding: '10px 12px', fontSize: '14px',
    border: '1px solid #cbd5e1', borderRadius: '6px',
    resize: 'vertical', fontFamily: 'inherit', outline: 'none',
    boxSizing: 'border-box'
  },
  modalError:      { color: '#dc2626', fontSize: '13px', marginTop: '6px' },
  modalBtns:       { display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' },
  modalCancelBtn:  { padding: '9px 18px', backgroundColor: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1', borderRadius: '6px', cursor: 'pointer', fontWeight: '500', fontSize: '14px' },
  modalConfirmBtn: { padding: '9px 20px', backgroundColor: '#4f46e5', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '14px' },
};

export default IssueDetails;

import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { getIssueById, updateIssue, getUsers } from '../services/api';
import { AuthContext } from '../context/AuthContext';

const EditIssue = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const isAdmin = user?.role === 'admin';

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    issueType: 'Bug',
    priority: 'Medium',
    status: 'Open',
    assignee: '',
    dueDate: ''
  });

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError('');
      try {
        const [issueRes, usersRes] = await Promise.all([
          getIssueById(id),
          getUsers()
        ]);

        const issue = issueRes.data.data;
        setUsers(usersRes.data.data);

        // Format dueDate to YYYY-MM-DD if exists
        let formattedDueDate = '';
        if (issue.dueDate) {
          formattedDueDate = new Date(issue.dueDate).toISOString().split('T')[0];
        }

        setFormData({
          title: issue.title || '',
          description: issue.description || '',
          issueType: issue.issueType || 'Bug',
          priority: issue.priority || 'Medium',
          status: issue.status || 'Open',
          assignee: issue.assignee?._id || issue.assignee || '',
          dueDate: formattedDueDate
        });
      } catch (err) {
        console.error('Edit issue fetch error:', err);
        const status = err.response?.status;
        if (status === 403) {
          setError('You are not authorized to edit this issue.');
        } else if (status === 404) {
          setError('Issue not found.');
        } else {
          setError(err.response?.data?.message || 'Failed to load issue data');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const { title, description, issueType, priority, status, assignee, dueDate } = formData;

  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!title.trim() || !description.trim()) {
      setError('Please provide both title and description');
      return;
    }

    if (title.trim().length < 3) {
      setError('Title must be at least 3 characters long');
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        title: title.trim(),
        description: description.trim(),
        issueType,
        priority,
        // Only admins can submit a status change — non-admins omit it entirely
        ...(isAdmin ? { status } : {}),
        assignee: assignee || null,
        dueDate: dueDate || null
      };

      await updateIssue(id, payload);
      navigate(`/issues/${id}`);
    } catch (err) {
      const status = err.response?.status;
      if (status === 403) {
        setError(err.response?.data?.message || 'You are not authorized to edit this issue.');
      } else {
        setError(err.response?.data?.message || 'Failed to update issue');
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div>
        <Navbar />
        <div style={styles.loadingContainer}>
          <p>Loading issue for editing...</p>
        </div>
      </div>
    );
  }

  // Show error page for 403/404 instead of a broken form
  if (error && !formData.title) {
    return (
      <div>
        <Navbar />
        <div style={styles.errorContainer}>
          <h2>{error.includes('authorized') ? 'Access Denied' : 'Error'}</h2>
          <p style={{ color: '#64748b', marginTop: '8px', marginBottom: '20px' }}>{error}</p>
          <button onClick={() => navigate('/issues')} style={styles.backBtn}>
            ← Back to Issues
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <div style={styles.container}>
        <div style={styles.card}>
          <h1 style={styles.title}>Edit Issue</h1>
          <p style={styles.subtitle}>Update issue parameters and information</p>

          {error && <div style={styles.errorBox}>{error}</div>}

          <form onSubmit={onSubmit} style={styles.form}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>
                Title <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="text"
                name="title"
                value={title}
                onChange={onChange}
                placeholder="Summary of the issue"
                style={styles.input}
                id="edit-issue-title"
                required
              />
            </div>

            <div style={styles.row}>
              <div style={styles.col}>
                <label style={styles.label}>
                  Type <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <select
                  name="issueType"
                  value={issueType}
                  onChange={onChange}
                  style={styles.select}
                  id="edit-issue-type"
                >
                  <option value="Bug">Bug</option>
                  <option value="Task">Task</option>
                </select>
              </div>

              <div style={styles.col}>
                <label style={styles.label}>
                  Priority <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <select
                  name="priority"
                  value={priority}
                  onChange={onChange}
                  style={styles.select}
                  id="edit-issue-priority"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>

              <div style={styles.col}>
                <label style={styles.label}>Status</label>
                {isAdmin ? (
                  <select
                    name="status"
                    value={status}
                    onChange={onChange}
                    style={styles.select}
                    id="edit-issue-status"
                  >
                    <option value="Open">Open</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Resolved">Resolved</option>
                    <option value="Closed">Closed</option>
                  </select>
                ) : (
                  <div style={styles.statusReadOnly}>{status}</div>
                )}
              </div>
            </div>

            <div style={styles.row}>
              <div style={styles.colHalf}>
                <label style={styles.label}>Assignee</label>
                <select
                  name="assignee"
                  value={assignee}
                  onChange={onChange}
                  style={styles.select}
                  id="edit-issue-assignee"
                >
                  <option value="">Unassigned</option>
                  {users.map((u) => (
                    <option key={u._id} value={u._id}>
                      {u.name} ({u.email})
                    </option>
                  ))}
                </select>
              </div>

              <div style={styles.colHalf}>
                <label style={styles.label}>Due Date</label>
                <input
                  type="date"
                  name="dueDate"
                  value={dueDate}
                  onChange={onChange}
                  style={styles.input}
                  id="edit-issue-duedate"
                />
              </div>
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>
                Description <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <textarea
                name="description"
                value={description}
                onChange={onChange}
                rows={5}
                style={styles.textarea}
                id="edit-issue-description"
                required
              />
            </div>

            <div style={styles.btnRow}>
              <button
                type="button"
                onClick={() => navigate(`/issues/${id}`)}
                style={styles.cancelBtn}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                style={styles.submitBtn}
                id="edit-issue-submit-btn"
              >
                {submitting ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '800px',
    margin: '30px auto',
    padding: '0 20px'
  },
  loadingContainer: {
    textAlign: 'center',
    padding: '60px',
    color: '#64748b'
  },
  card: {
    backgroundColor: '#ffffff',
    padding: '35px',
    borderRadius: '12px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.06)'
  },
  title: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#0f172a'
  },
  subtitle: {
    fontSize: '14px',
    color: '#64748b',
    marginTop: '4px',
    marginBottom: '25px'
  },
  errorBox: {
    backgroundColor: '#fee2e2',
    color: '#dc2626',
    padding: '12px',
    borderRadius: '8px',
    marginBottom: '20px',
    fontSize: '14px'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px'
  },
  label: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#334155'
  },
  input: {
    padding: '10px 14px',
    border: '1px solid #cbd5e1',
    borderRadius: '6px',
    fontSize: '14px',
    outline: 'none',
    width: '100%'
  },
  textarea: {
    padding: '12px 14px',
    border: '1px solid #cbd5e1',
    borderRadius: '6px',
    fontSize: '14px',
    outline: 'none',
    resize: 'vertical',
    fontFamily: 'inherit'
  },
  select: {
    padding: '10px 12px',
    border: '1px solid #cbd5e1',
    borderRadius: '6px',
    fontSize: '14px',
    backgroundColor: '#fff',
    outline: 'none',
    width: '100%'
  },
  row: {
    display: 'flex',
    gap: '15px',
    flexWrap: 'wrap'
  },
  col: {
    flex: 1,
    minWidth: '160px',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px'
  },
  colHalf: {
    flex: 1,
    minWidth: '240px',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px'
  },
  btnRow: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px',
    marginTop: '10px'
  },
  cancelBtn: {
    padding: '10px 20px',
    backgroundColor: '#f1f5f9',
    color: '#475569',
    border: '1px solid #cbd5e1',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: '500',
    fontSize: '14px'
  },
  submitBtn: {
    padding: '10px 24px',
    backgroundColor: '#4f46e5',
    color: '#ffffff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '14px'
  },
  statusReadOnly: {
    padding: '10px 12px',
    border: '1px solid #e2e8f0',
    borderRadius: '6px',
    fontSize: '14px',
    backgroundColor: '#f8fafc',
    color: '#475569',
    fontWeight: '500'
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
  backBtn: {
    padding: '10px 20px',
    backgroundColor: '#4f46e5',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: '500',
    fontSize: '14px'
  }
};

export default EditIssue;

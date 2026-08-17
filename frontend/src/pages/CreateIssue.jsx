import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar';
import { createIssue, getUsers } from '../services/api';

const CreateIssue = () => {
  const navigate = useNavigate();

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
  const [attachments, setAttachments] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await getUsers();
        setUsers(res.data.data);
      } catch (err) {
        console.error('Failed to load users for assignee list:', err);
      }
    };
    fetchUsers();
  }, []);

  const { title, description, issueType, priority, status, assignee, dueDate } = formData;

  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const remainingSlots = 5 - attachments.length;
    const selectedFiles = files.slice(0, remainingSlots);

    try {
      const fileData = await Promise.all(
        selectedFiles.map((file) => new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve({
            name: file.name,
            type: file.type || 'application/octet-stream',
            size: file.size,
            dataUrl: reader.result
          });
          reader.onerror = () => reject(new Error(`Failed to read ${file.name}`));
          reader.readAsDataURL(file);
        }))
      );

      setAttachments((prev) => [...prev, ...fileData]);
      e.target.value = '';
    } catch (uploadError) {
      setError(uploadError.message || 'Failed to process uploaded files');
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Frontend Validation
    if (!title.trim() || !description.trim()) {
      setError('Please provide both title and description');
      return;
    }

    if (title.trim().length < 3) {
      setError('Title must be at least 3 characters long');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        title: title.trim(),
        description: description.trim(),
        issueType,
        priority,
        status,
        assignee: assignee || null,
        dueDate: dueDate || null,
        attachments
      };

      const res = await createIssue(payload);
      toast.success('Issue created successfully!');
      const createdId = res.data.data._id;
      navigate(`/issues/${createdId}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create issue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Navbar />
      <div style={styles.container}>
        <div style={styles.card}>
          <h1 style={styles.title}>Create New Issue</h1>
          <p style={styles.subtitle}>Report a bug or track a project task</p>

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
                placeholder="Brief summary of the issue"
                style={styles.input}
                id="create-issue-title"
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
                  id="create-issue-type"
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
                  id="create-issue-priority"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>

              <div style={styles.col}>
                <label style={styles.label}>Status</label>
                <select
                  name="status"
                  value={status}
                  onChange={onChange}
                  style={styles.select}
                  id="create-issue-status"
                >
                  <option value="Open">Open</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                  <option value="Closed">Closed</option>
                </select>
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
                  id="create-issue-assignee"
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
                  id="create-issue-duedate"
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
                placeholder="Detailed description of the issue, steps to reproduce, or requirements..."
                rows={5}
                style={styles.textarea}
                id="create-issue-description"
                required
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Attachments (optional)</label>
              <input
                type="file"
                accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt"
                multiple
                onChange={handleFileUpload}
                style={styles.fileInput}
              />
              {attachments.length > 0 && (
                <div style={styles.attachmentList}>
                  {attachments.map((file, index) => (
                    <div key={`${file.name}-${index}`} style={styles.attachmentItem}>
                      <span>📎 {file.name}</span>
                      <button
                        type="button"
                        onClick={() => setAttachments((prev) => prev.filter((_, i) => i !== index))}
                        style={styles.removeAttachmentBtn}
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={styles.btnRow}>
              <button
                type="button"
                onClick={() => navigate('/issues')}
                style={styles.cancelBtn}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                style={styles.submitBtn}
                id="create-issue-submit-btn"
              >
                {loading ? 'Creating...' : 'Create Issue'}
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
  fileInput: {
    padding: '10px 12px',
    border: '1px solid #cbd5e1',
    borderRadius: '6px',
    backgroundColor: '#f8fafc',
    fontSize: '14px'
  },
  attachmentList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    marginTop: '6px'
  },
  attachmentItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '10px',
    backgroundColor: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    padding: '8px 12px',
    fontSize: '13px',
    color: '#334155'
  },
  removeAttachmentBtn: {
    backgroundColor: '#fee2e2',
    color: '#b91c1c',
    border: 'none',
    borderRadius: '6px',
    padding: '4px 8px',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: '600'
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
  }
};

export default CreateIssue;

import { useState, useEffect, useContext } from 'react';
import Navbar from '../components/Navbar';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';

const AdminUsers = () => {
  const { user: currentUser } = useContext(AuthContext);

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [updatingId, setUpdatingId] = useState(null);

  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/admin/users');
      setUsers(res.data.data);
    } catch (err) {
      if (err.response?.status === 403) {
        setError('You do not have permission to view this page.');
      } else {
        setError(err.response?.data?.message || 'Failed to load users.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async (userId, newRole) => {
    setUpdatingId(userId);
    setError('');
    setSuccessMsg('');
    try {
      const res = await api.put(`/admin/users/${userId}/role`, { role: newRole });
      setSuccessMsg(res.data.message || 'Role updated successfully.');
      // Update local state to reflect change
      setUsers((prev) =>
        prev.map((u) => (u._id === userId ? { ...u, role: newRole } : u))
      );
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update role.');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div>
      <Navbar />
      <div style={styles.container}>
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>User Management</h1>
            <p style={styles.subtitle}>View all users and manage their roles.</p>
          </div>
          <span style={styles.countBadge}>{users.length} users</span>
        </div>

        {error && <div style={styles.errorBox}>{error}</div>}
        {successMsg && <div style={styles.successBox}>{successMsg}</div>}

        {loading ? (
          <div style={styles.loadingBox}>Loading users...</div>
        ) : users.length === 0 ? (
          <div style={styles.emptyBox}>No users found.</div>
        ) : (
          <div style={styles.tableCard}>
            <div style={styles.tableWrapper}>
              <table style={styles.table}>
                <thead>
                  <tr style={styles.thRow}>
                    <th style={styles.th}>Name</th>
                    <th style={styles.th}>Email</th>
                    <th style={styles.th}>Role</th>
                    <th style={styles.th}>Registered</th>
                    <th style={styles.th}>Change Role</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => {
                    const isSelf = u._id === (currentUser?._id || currentUser?.id);
                    const isUpdating = updatingId === u._id;

                    return (
                      <tr key={u._id} style={styles.tr}>
                        <td style={styles.td}>
                          <span style={styles.userName}>{u.name}</span>
                          {isSelf && <span style={styles.youBadge}> (you)</span>}
                        </td>
                        <td style={styles.td}>{u.email}</td>
                        <td style={styles.td}>
                          <span style={u.role === 'admin' ? styles.adminBadge : styles.userBadge}>
                            {u.role === 'admin' ? 'Admin' : 'User'}
                          </span>
                        </td>
                        <td style={styles.tdDate}>
                          {new Date(u.createdAt).toLocaleDateString()}
                        </td>
                        <td style={styles.td}>
                          {isSelf ? (
                            <span style={styles.selfNote}>Cannot change own role</span>
                          ) : (
                            <select
                              value={u.role}
                              onChange={(e) => handleRoleChange(u._id, e.target.value)}
                              disabled={isUpdating}
                              style={styles.roleSelect}
                              aria-label={`Change role for ${u.name}`}
                            >
                              <option value="user">User</option>
                              <option value="admin">Admin</option>
                            </select>
                          )}
                          {isUpdating && <span style={styles.updatingText}> Saving...</span>}
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
  container: {
    maxWidth: '1100px',
    margin: '30px auto',
    padding: '0 20px'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '25px',
    flexWrap: 'wrap',
    gap: '15px'
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
  countBadge: {
    backgroundColor: '#f1f5f9',
    color: '#475569',
    padding: '6px 14px',
    borderRadius: '20px',
    fontSize: '14px',
    fontWeight: '600',
    border: '1px solid #e2e8f0'
  },
  errorBox: {
    backgroundColor: '#fee2e2',
    color: '#dc2626',
    padding: '12px 16px',
    borderRadius: '8px',
    marginBottom: '20px',
    fontSize: '14px'
  },
  successBox: {
    backgroundColor: '#d1fae5',
    color: '#059669',
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
  emptyBox: {
    textAlign: 'center',
    padding: '50px',
    backgroundColor: '#fff',
    borderRadius: '8px',
    color: '#64748b'
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
    borderBottom: '1px solid #f1f5f9'
  },
  td: {
    padding: '14px 16px',
    fontSize: '14px',
    color: '#1e293b',
    verticalAlign: 'middle'
  },
  tdDate: {
    padding: '14px 16px',
    fontSize: '13px',
    color: '#64748b',
    whiteSpace: 'nowrap'
  },
  userName: {
    fontWeight: '600'
  },
  youBadge: {
    fontSize: '12px',
    color: '#94a3b8',
    fontStyle: 'italic'
  },
  adminBadge: {
    display: 'inline-block',
    fontSize: '11px',
    fontWeight: '700',
    backgroundColor: '#7c3aed',
    color: '#fff',
    padding: '3px 10px',
    borderRadius: '10px',
    textTransform: 'uppercase',
    letterSpacing: '0.4px'
  },
  userBadge: {
    display: 'inline-block',
    fontSize: '11px',
    fontWeight: '700',
    backgroundColor: '#0369a1',
    color: '#fff',
    padding: '3px 10px',
    borderRadius: '10px',
    textTransform: 'uppercase',
    letterSpacing: '0.4px'
  },
  roleSelect: {
    padding: '6px 10px',
    border: '1px solid #cbd5e1',
    borderRadius: '6px',
    fontSize: '13px',
    backgroundColor: '#fff',
    cursor: 'pointer',
    outline: 'none'
  },
  selfNote: {
    fontSize: '12px',
    color: '#94a3b8',
    fontStyle: 'italic'
  },
  updatingText: {
    fontSize: '12px',
    color: '#64748b',
    marginLeft: '6px',
    fontStyle: 'italic'
  }
};

export default AdminUsers;

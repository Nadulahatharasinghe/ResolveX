import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const { name, email, password } = formData;

  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Frontend validation
    if (!name || !email || !password) {
      setError('Please fill in all fields');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      const res = await api.post('/auth/register', formData);
      setSuccess(res.data.message || 'Registration successful! Redirecting to login...');
      setFormData({ name: '', email: '', password: '' });
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>ResolveX</h1>
        <h2 style={styles.subtitle}>Create Account</h2>

        {error && <div style={styles.error}>{error}</div>}
        {success && <div style={styles.success}>{success}</div>}

        <form onSubmit={onSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Name</label>
            <input
              type="text"
              name="name"
              value={name}
              onChange={onChange}
              placeholder="Enter your name"
              style={styles.input}
              id="register-name"
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Email</label>
            <input
              type="email"
              name="email"
              value={email}
              onChange={onChange}
              placeholder="Enter your email"
              style={styles.input}
              id="register-email"
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Password</label>
            <input
              type="password"
              name="password"
              value={password}
              onChange={onChange}
              placeholder="Enter your password"
              style={styles.input}
              id="register-password"
            />
          </div>

          <button type="submit" style={styles.button} disabled={loading} id="register-submit">
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>

        <p style={styles.link}>
          Already have an account? <Link to="/login" style={styles.anchor}>Login</Link>
        </p>
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
    padding: '20px'
  },
  card: {
    backgroundColor: '#fff',
    padding: '40px',
    borderRadius: '8px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    width: '100%',
    maxWidth: '400px'
  },
  title: {
    textAlign: 'center',
    color: '#333',
    marginBottom: '5px',
    fontSize: '28px'
  },
  subtitle: {
    textAlign: 'center',
    color: '#666',
    marginBottom: '25px',
    fontSize: '18px',
    fontWeight: 'normal'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px'
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '5px'
  },
  label: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#333'
  },
  input: {
    padding: '10px 12px',
    border: '1px solid #ddd',
    borderRadius: '6px',
    fontSize: '14px',
    outline: 'none',
    transition: 'border-color 0.2s'
  },
  button: {
    padding: '12px',
    backgroundColor: '#4f46e5',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    fontSize: '16px',
    cursor: 'pointer',
    marginTop: '10px'
  },
  error: {
    backgroundColor: '#fee2e2',
    color: '#dc2626',
    padding: '10px',
    borderRadius: '6px',
    marginBottom: '15px',
    fontSize: '14px'
  },
  success: {
    backgroundColor: '#d1fae5',
    color: '#059669',
    padding: '10px',
    borderRadius: '6px',
    marginBottom: '15px',
    fontSize: '14px'
  },
  link: {
    textAlign: 'center',
    marginTop: '20px',
    color: '#666',
    fontSize: '14px'
  },
  anchor: {
    color: '#4f46e5',
    textDecoration: 'none'
  }
};

export default Register;

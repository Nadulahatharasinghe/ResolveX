import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const Dashboard = () => {
  const { user, logout } = useContext(AuthContext);

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>Welcome to ResolveX</h1>
        <p style={styles.subtitle}>Hello, {user?.name}!</p>
        <p style={styles.text}>You are successfully authenticated.</p>
        <p style={styles.text}>Email: {user?.email}</p>
        <button onClick={logout} style={styles.button} id="logout-button">
          Logout
        </button>
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
    maxWidth: '500px',
    textAlign: 'center'
  },
  title: {
    color: '#333',
    marginBottom: '10px',
    fontSize: '28px'
  },
  subtitle: {
    color: '#4f46e5',
    fontSize: '20px',
    marginBottom: '15px'
  },
  text: {
    color: '#666',
    fontSize: '16px',
    marginBottom: '10px'
  },
  button: {
    padding: '12px 30px',
    backgroundColor: '#dc2626',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    fontSize: '16px',
    cursor: 'pointer',
    marginTop: '20px'
  }
};

export default Dashboard;

import { useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <nav style={styles.navbar}>
      <div style={styles.container}>
        <div style={styles.brandGroup}>
          <Link to="/dashboard" style={styles.brand}>
            🚀 ResolveX
          </Link>
          <div style={styles.navLinks}>
            <Link
              to="/dashboard"
              style={{
                ...styles.link,
                ...(isActive('/dashboard') ? styles.activeLink : {})
              }}
            >
              Dashboard
            </Link>
            <Link
              to="/issues"
              style={{
                ...styles.link,
                ...(isActive('/issues') ? styles.activeLink : {})
              }}
            >
              Issues
            </Link>
            <Link
              to="/create-issue"
              style={{
                ...styles.link,
                ...(isActive('/create-issue') ? styles.activeLink : {})
              }}
            >
              + Create Issue
            </Link>
          </div>
        </div>

        <div style={styles.userGroup}>
          <span style={styles.userName}>{user?.name}</span>
          <button onClick={logout} style={styles.logoutBtn} id="nav-logout-btn">
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

const styles = {
  navbar: {
    backgroundColor: '#1e293b',
    color: '#fff',
    padding: '12px 24px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
    position: 'sticky',
    top: 0,
    zIndex: 100
  },
  container: {
    maxWidth: '1100px',
    margin: '0 auto',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: '15px'
  },
  brandGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '30px'
  },
  brand: {
    fontSize: '20px',
    fontWeight: 'bold',
    color: '#38bdf8',
    textDecoration: 'none',
    letterSpacing: '0.5px'
  },
  navLinks: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px'
  },
  link: {
    color: '#94a3b8',
    textDecoration: 'none',
    fontSize: '14px',
    fontWeight: '500',
    padding: '6px 12px',
    borderRadius: '6px',
    transition: 'all 0.2s'
  },
  activeLink: {
    color: '#ffffff',
    backgroundColor: '#334155'
  },
  userGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px'
  },
  userName: {
    fontSize: '14px',
    color: '#cbd5e1',
    fontWeight: '500'
  },
  logoutBtn: {
    backgroundColor: '#ef4444',
    color: '#fff',
    border: 'none',
    padding: '6px 14px',
    borderRadius: '6px',
    fontSize: '14px',
    cursor: 'pointer',
    fontWeight: '500'
  }
};

export default Navbar;

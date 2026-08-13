import { useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Navbar = () => {
  const { user, isAdmin, logout } = useContext(AuthContext);
  const location = useLocation();

  const isActive = (path) =>
    location.pathname === path || location.pathname.startsWith(path + '/');

  return (
    <nav style={styles.navbar}>
      <div style={styles.container}>
        {/* Brand + Nav Links */}
        <div style={styles.brandGroup}>
          <Link to="/dashboard" style={styles.brand}>
            🚀 ResolveX
          </Link>
          <div style={styles.navLinks}>
            <Link
              to="/dashboard"
              style={{ ...styles.link, ...(isActive('/dashboard') ? styles.activeLink : {}) }}
            >
              Dashboard
            </Link>
            <Link
              to="/issues"
              style={{ ...styles.link, ...(isActive('/issues') ? styles.activeLink : {}) }}
            >
              Issues
            </Link>
            <Link
              to="/create-issue"
              style={{ ...styles.link, ...(isActive('/create-issue') ? styles.activeLink : {}) }}
            >
              + Create Issue
            </Link>

            {/* Admin-only navigation links */}
            {isAdmin && (
              <>
                <Link
                  to="/admin"
                  style={{ ...styles.link, ...(isActive('/admin') && location.pathname === '/admin' ? styles.activeLink : {}) }}
                >
                  Admin Panel
                </Link>
                <Link
                  to="/admin/users"
                  style={{ ...styles.link, ...(isActive('/admin/users') ? styles.activeLink : {}) }}
                >
                  Users
                </Link>
              </>
            )}
          </div>
        </div>

        {/* User info + role badge + logout */}
        <div style={styles.userGroup}>
          <span style={styles.userName}>{user?.name}</span>
          <span style={isAdmin ? styles.adminBadge : styles.userBadge}>
            {isAdmin ? 'Admin' : 'User'}
          </span>
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
    gap: '30px',
    flexWrap: 'wrap'
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
    gap: '4px',
    flexWrap: 'wrap'
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
    gap: '10px'
  },
  userName: {
    fontSize: '14px',
    color: '#cbd5e1',
    fontWeight: '500'
  },
  adminBadge: {
    fontSize: '11px',
    fontWeight: '700',
    backgroundColor: '#7c3aed',
    color: '#fff',
    padding: '3px 8px',
    borderRadius: '10px',
    letterSpacing: '0.4px',
    textTransform: 'uppercase'
  },
  userBadge: {
    fontSize: '11px',
    fontWeight: '700',
    backgroundColor: '#0369a1',
    color: '#fff',
    padding: '3px 8px',
    borderRadius: '10px',
    letterSpacing: '0.4px',
    textTransform: 'uppercase'
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

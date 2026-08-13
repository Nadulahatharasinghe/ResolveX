import { useContext, useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

function Avatar({ name, size = 32 }) {
  const initials = name ? name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) : '?';
  const colors = ['#4f46e5','#7c3aed','#0ea5e9','#10b981','#f59e0b'];
  const color  = colors[(name?.charCodeAt(0) || 0) % colors.length];
  return (
    <div style={{ width: size, height: size, borderRadius: '50%', backgroundColor: color,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.36, fontWeight: '700', color: '#fff', flexShrink: 0, userSelect: 'none', cursor: 'pointer' }}>
      {initials}
    </div>
  );
}

export default function Navbar() {
  const { user, isAdmin, logout } = useContext(AuthContext);
  const location  = useLocation();
  const navigate  = useNavigate();
  const [menuOpen,    setMenuOpen]    = useState(false); // mobile hamburger
  const [dropOpen,    setDropOpen]    = useState(false); // user dropdown
  const dropRef = useRef(null);

  const isActive = (path) =>
    location.pathname === path || (path !== '/dashboard' && location.pathname.startsWith(path));

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e) => { if (dropRef.current && !dropRef.current.contains(e.target)) setDropOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Close mobile menu on route change
  useEffect(() => { setMenuOpen(false); }, [location.pathname]);

  const navLinks = [
    { to: '/dashboard',    label: 'Dashboard' },
    { to: '/issues',       label: 'Issues' },
    { to: '/create-issue', label: '+ Create' },
    ...(isAdmin ? [
      { to: '/admin',       label: 'Admin' },
      { to: '/admin/users', label: 'Users' },
    ] : []),
  ];

  return (
    <nav style={s.navbar}>
      <div style={s.inner}>
        {/* Brand */}
        <Link to="/dashboard" style={s.brand}>🚀 ResolveX</Link>

        {/* Desktop nav links */}
        <div style={s.desktopLinks}>
          {navLinks.map(({ to, label }) => (
            <Link key={to} to={to} style={{ ...s.link, ...(isActive(to) ? s.activeLink : {}) }}>
              {label}
            </Link>
          ))}
        </div>

        {/* Right side */}
        <div style={s.right}>
          {/* User avatar dropdown */}
          <div ref={dropRef} style={s.dropWrap}>
            <button style={s.avatarBtn} onClick={() => setDropOpen(v => !v)} aria-label="User menu">
              <Avatar name={user?.name} />
              <div style={s.avatarInfo} className="hide-mobile">
                <span style={s.avatarName}>{user?.name}</span>
                <span style={isAdmin ? s.adminBadge : s.userBadge}>{isAdmin ? 'Admin' : 'User'}</span>
              </div>
              <span style={{ color: '#94a3b8', fontSize: '10px', marginLeft: '2px' }}>▾</span>
            </button>

            {dropOpen && (
              <div style={s.dropdown}>
                <div style={s.dropHeader}>
                  <strong style={{ color: '#0f172a', fontSize: '14px' }}>{user?.name}</strong>
                  <span style={{ color: '#64748b', fontSize: '12px' }}>{user?.email}</span>
                </div>
                <div style={s.dropDivider} />
                <button style={s.dropItem} onClick={() => { navigate('/profile'); setDropOpen(false); }}>
                  👤 My Profile
                </button>
                <div style={s.dropDivider} />
                <button style={{ ...s.dropItem, color: '#ef4444' }} onClick={() => { logout(); setDropOpen(false); }}>
                  🚪 Sign Out
                </button>
              </div>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            style={s.hamburger}
            className="show-mobile-only"
            onClick={() => setMenuOpen(v => !v)}
            aria-label="Toggle menu"
          >
            {menuOpen ? '✕' : '☰'}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div style={s.mobileMenu}>
          {navLinks.map(({ to, label }) => (
            <Link key={to} to={to} style={{ ...s.mobileLink, ...(isActive(to) ? s.mobileLinkActive : {}) }}>
              {label}
            </Link>
          ))}
          <div style={s.mobileDivider} />
          <Link to="/profile" style={s.mobileLink}>👤 My Profile</Link>
          <button style={s.mobileLogout} onClick={logout}>🚪 Sign Out</button>
        </div>
      )}
    </nav>
  );
}

const s = {
  navbar:    { backgroundColor: '#1e293b', position: 'sticky', top: 0, zIndex: 200, boxShadow: '0 2px 12px rgba(0,0,0,0.18)' },
  inner:     { maxWidth: '1200px', margin: '0 auto', padding: '0 20px', height: '58px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' },
  brand:     { fontSize: '18px', fontWeight: '800', color: '#38bdf8', textDecoration: 'none', letterSpacing: '-0.3px', flexShrink: 0 },
  desktopLinks:{ display: 'flex', alignItems: 'center', gap: '2px', flex: 1, paddingLeft: '20px' },
  link:      { color: '#94a3b8', textDecoration: 'none', fontSize: '14px', fontWeight: '500', padding: '6px 12px', borderRadius: '6px', transition: 'all 0.15s', whiteSpace: 'nowrap' },
  activeLink:{ color: '#fff', backgroundColor: '#334155' },
  right:     { display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 },

  // Avatar dropdown
  dropWrap:   { position: 'relative' },
  avatarBtn:  { display: 'flex', alignItems: 'center', gap: '8px', background: 'none', border: 'none', cursor: 'pointer', padding: '4px 8px', borderRadius: '8px', transition: 'background 0.15s' },
  avatarInfo: { display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '1px' },
  avatarName: { fontSize: '13px', fontWeight: '600', color: '#e2e8f0', lineHeight: 1 },
  adminBadge: { fontSize: '10px', fontWeight: '700', backgroundColor: '#7c3aed', color: '#fff', padding: '1px 7px', borderRadius: '10px', textTransform: 'uppercase' },
  userBadge:  { fontSize: '10px', fontWeight: '700', backgroundColor: '#0369a1', color: '#fff', padding: '1px 7px', borderRadius: '10px', textTransform: 'uppercase' },
  dropdown:   { position: 'absolute', right: 0, top: 'calc(100% + 8px)', width: '220px', background: '#fff', borderRadius: '10px', boxShadow: '0 8px 28px rgba(0,0,0,0.14)', overflow: 'hidden', zIndex: 300, border: '1px solid #e2e8f0' },
  dropHeader: { padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: '2px', backgroundColor: '#f8fafc' },
  dropDivider:{ height: '1px', backgroundColor: '#f1f5f9' },
  dropItem:   { display: 'block', width: '100%', padding: '11px 16px', textAlign: 'left', background: 'none', border: 'none', fontSize: '14px', cursor: 'pointer', color: '#374151', fontFamily: 'inherit', fontWeight: '500', transition: 'background 0.15s' },

  // Mobile
  hamburger:  { background: 'none', border: 'none', color: '#e2e8f0', fontSize: '22px', cursor: 'pointer', padding: '4px 8px', lineHeight: 1 },
  mobileMenu: { backgroundColor: '#1e293b', borderTop: '1px solid #334155', padding: '10px 16px 16px' },
  mobileLink: { display: 'block', padding: '10px 12px', color: '#cbd5e1', textDecoration: 'none', fontSize: '15px', fontWeight: '500', borderRadius: '6px' },
  mobileLinkActive: { color: '#fff', backgroundColor: '#334155' },
  mobileDivider: { height: '1px', backgroundColor: '#334155', margin: '8px 0' },
  mobileLogout: { display: 'block', width: '100%', padding: '10px 12px', color: '#f87171', background: 'none', border: 'none', fontSize: '15px', fontWeight: '500', cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit', borderRadius: '6px' },
};

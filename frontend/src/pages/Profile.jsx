import { useState, useContext, useEffect } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar';
import { AuthContext } from '../context/AuthContext';
import { updateProfile, changePassword, getIssues } from '../services/api';

const fade = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.3 } } };

function Avatar({ name, size = 64 }) {
  const initials = name ? name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) : '?';
  const colors = ['#4f46e5','#7c3aed','#0ea5e9','#10b981','#f59e0b','#ef4444'];
  const color  = colors[name?.charCodeAt(0) % colors.length] || '#4f46e5';
  return (
    <div style={{ width: size, height: size, borderRadius: '50%', backgroundColor: color,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.36, fontWeight: '700', color: '#fff', flexShrink: 0, userSelect: 'none' }}>
      {initials}
    </div>
  );
}

export default function Profile() {
  const { user, login, token } = useContext(AuthContext);

  // Profile form
  const [name,  setName]  = useState(user?.name  || '');
  const [email, setEmail] = useState(user?.email || '');
  const [profileErrors, setProfileErrors] = useState({});
  const [savingProfile, setSavingProfile] = useState(false);

  // Password form
  const [currentPw, setCurrentPw]   = useState('');
  const [newPw,      setNewPw]      = useState('');
  const [confirmPw,  setConfirmPw]  = useState('');
  const [showCur, setShowCur] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [pwErrors, setPwErrors] = useState({});
  const [savingPw, setSavingPw] = useState(false);

  // Stats
  const [stats, setStats]     = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getIssues();
        const all = res.data.data || [];
        const myId = user?.id || user?._id;
        const created  = all.filter(i => (i.createdBy?._id || i.createdBy) === myId).length;
        const assigned = all.filter(i => (i.assignee?._id || i.assignee) === myId).length;
        const resolved = all.filter(i => (i.createdBy?._id || i.createdBy) === myId && i.status === 'Resolved').length;
        setStats({ created, assigned, resolved });
      } catch { setStats({ created: 0, assigned: 0, resolved: 0 }); }
      finally { setLoadingStats(false); }
    };
    load();
  }, [user]);

  const validateProfile = () => {
    const e = {};
    if (!name.trim()) e.name = 'Name is required';
    if (!email.trim()) e.email = 'Email is required';
    else if (!/^\S+@\S+\.\S+$/.test(email)) e.email = 'Enter a valid email';
    return e;
  };

  const handleSaveProfile = async (evt) => {
    evt.preventDefault();
    const e = validateProfile();
    if (Object.keys(e).length) { setProfileErrors(e); return; }
    setProfileErrors({});
    setSavingProfile(true);
    try {
      const res = await updateProfile({ name: name.trim(), email: email.trim() });
      login(res.data.user, token); // refresh AuthContext user
      toast.success('Profile updated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally { setSavingProfile(false); }
  };

  const validatePw = () => {
    const e = {};
    if (!currentPw) e.currentPw = 'Current password is required';
    if (!newPw)     e.newPw = 'New password is required';
    else if (newPw.length < 6) e.newPw = 'At least 6 characters required';
    if (!confirmPw) e.confirmPw = 'Please confirm your new password';
    else if (confirmPw !== newPw) e.confirmPw = 'Passwords do not match';
    return e;
  };

  const handleChangePw = async (evt) => {
    evt.preventDefault();
    const e = validatePw();
    if (Object.keys(e).length) { setPwErrors(e); return; }
    setPwErrors({});
    setSavingPw(true);
    try {
      await changePassword({ currentPassword: currentPw, newPassword: newPw });
      toast.success('Password changed successfully!');
      setCurrentPw(''); setNewPw(''); setConfirmPw('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally { setSavingPw(false); }
  };

  return (
    <div>
      <Navbar />
      <div style={s.page} className="page-enter">
        <div style={s.container}>
          {/* Header card */}
          <motion.div style={s.headerCard} variants={fade} initial="hidden" animate="show">
            <Avatar name={user?.name} size={72} />
            <div>
              <h1 style={s.userName}>{user?.name}</h1>
              <p style={s.userEmail}>{user?.email}</p>
              <span style={user?.role === 'admin' ? s.adminBadge : s.userBadge}>
                {user?.role === 'admin' ? '⚡ Admin' : '👤 User'}
              </span>
            </div>
          </motion.div>

          <div style={s.grid}>
            {/* Left col */}
            <div style={s.leftCol}>
              {/* Profile form */}
              <motion.div style={s.card} variants={fade} initial="hidden" animate="show" transition={{ delay: 0.05 }}>
                <h2 style={s.sectionTitle}>Profile Information</h2>
                <form onSubmit={handleSaveProfile} style={s.form} noValidate>
                  <div style={s.field}>
                    <label style={s.label}>Full name</label>
                    <input value={name} onChange={e => { setName(e.target.value); setProfileErrors(p => ({...p,name:''})); }}
                      style={{ ...s.input, ...(profileErrors.name ? s.inputErr : {}) }} placeholder="Your name" />
                    {profileErrors.name && <span style={s.errMsg}>{profileErrors.name}</span>}
                  </div>
                  <div style={s.field}>
                    <label style={s.label}>Email address</label>
                    <input type="email" value={email} onChange={e => { setEmail(e.target.value); setProfileErrors(p => ({...p,email:''})); }}
                      style={{ ...s.input, ...(profileErrors.email ? s.inputErr : {}) }} placeholder="you@example.com" />
                    {profileErrors.email && <span style={s.errMsg}>{profileErrors.email}</span>}
                  </div>
                  <div style={s.field}>
                    <label style={s.label}>Role</label>
                    <div style={s.readOnly}>{user?.role === 'admin' ? 'Administrator' : 'User'}</div>
                  </div>
                  <motion.button type="submit" style={{ ...s.btn, ...(savingProfile ? s.btnDis : {}) }}
                    disabled={savingProfile} whileHover={!savingProfile ? { scale: 1.02 } : {}} whileTap={!savingProfile ? { scale: 0.98 } : {}}>
                    {savingProfile ? 'Saving…' : 'Save Changes'}
                  </motion.button>
                </form>
              </motion.div>

              {/* Change password */}
              <motion.div style={s.card} variants={fade} initial="hidden" animate="show" transition={{ delay: 0.1 }}>
                <h2 style={s.sectionTitle}>Change Password</h2>
                <form onSubmit={handleChangePw} style={s.form} noValidate>
                  {[
                    { label: 'Current password', val: currentPw, set: setCurrentPw, show: showCur, toggle: () => setShowCur(v=>!v), key: 'currentPw' },
                    { label: 'New password',     val: newPw,     set: setNewPw,     show: showNew, toggle: () => setShowNew(v=>!v), key: 'newPw' },
                    { label: 'Confirm new password', val: confirmPw, set: setConfirmPw, show: showNew, toggle: () => {}, key: 'confirmPw' },
                  ].map(({ label, val, set, show, toggle, key }) => (
                    <div key={key} style={s.field}>
                      <label style={s.label}>{label}</label>
                      <div style={s.pwWrap}>
                        <input type={show ? 'text' : 'password'} value={val}
                          onChange={e => { set(e.target.value); setPwErrors(p => ({...p,[key]:''})); }}
                          style={{ ...s.input, ...s.pwInput, ...(pwErrors[key] ? s.inputErr : {}) }}
                          placeholder="••••••••" />
                        {key !== 'confirmPw' && (
                          <button type="button" style={s.eyeBtn} onClick={toggle} tabIndex={-1}>{show ? '🙈' : '👁️'}</button>
                        )}
                      </div>
                      {pwErrors[key] && <span style={s.errMsg}>{pwErrors[key]}</span>}
                    </div>
                  ))}
                  <motion.button type="submit" style={{ ...s.btn, ...s.btnDanger, ...(savingPw ? s.btnDis : {}) }}
                    disabled={savingPw} whileHover={!savingPw ? { scale: 1.02 } : {}} whileTap={!savingPw ? { scale: 0.98 } : {}}>
                    {savingPw ? 'Updating…' : 'Update Password'}
                  </motion.button>
                </form>
              </motion.div>
            </div>

            {/* Right col — stats */}
            <div style={s.rightCol}>
              <motion.div style={s.card} variants={fade} initial="hidden" animate="show" transition={{ delay: 0.08 }}>
                <h2 style={s.sectionTitle}>My Activity</h2>
                {loadingStats ? (
                  <div style={s.statsGrid}>
                    {[1,2,3].map(i => <div key={i} className="skeleton" style={s.statSkeleton} />)}
                  </div>
                ) : (
                  <div style={s.statsGrid}>
                    {[
                      { label: 'Issues Created',  value: stats?.created,  color: '#4f46e5', icon: '📋' },
                      { label: 'Assigned to Me',  value: stats?.assigned, color: '#0ea5e9', icon: '👤' },
                      { label: 'Issues Resolved', value: stats?.resolved, color: '#10b981', icon: '✅' },
                    ].map(({ label, value, color, icon }) => (
                      <motion.div key={label} style={{ ...s.statCard, borderTop: `3px solid ${color}` }}
                        whileHover={{ y: -2, boxShadow: '0 6px 20px rgba(0,0,0,0.08)' }}>
                        <span style={s.statIcon}>{icon}</span>
                        <span style={{ ...s.statValue, color }}>{value}</span>
                        <span style={s.statLabel}>{label}</span>
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>

              <motion.div style={{ ...s.card, ...s.infoCard }} variants={fade} initial="hidden" animate="show" transition={{ delay: 0.12 }}>
                <h2 style={s.sectionTitle}>Account Info</h2>
                <div style={s.infoRow}><span style={s.infoKey}>Member since</span><span style={s.infoVal}>{new Date().getFullYear()}</span></div>
                <div style={s.infoRow}><span style={s.infoKey}>Account type</span><span style={s.infoVal}>{user?.role === 'admin' ? 'Administrator' : 'Standard User'}</span></div>
                <div style={s.infoRow}><span style={s.infoKey}>User ID</span><span style={{ ...s.infoVal, fontSize: '11px', fontFamily: 'monospace', color: '#94a3b8' }}>{user?.id || user?._id}</span></div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const s = {
  page:        { background: '#f1f5f9', minHeight: 'calc(100vh - 58px)', padding: '30px 20px' },
  container:   { maxWidth: '1000px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' },
  headerCard:  { background: '#fff', borderRadius: '14px', boxShadow: '0 2px 10px rgba(0,0,0,0.06)', padding: '28px 32px', display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' },
  userName:    { fontSize: '22px', fontWeight: '700', color: '#0f172a' },
  userEmail:   { fontSize: '14px', color: '#64748b', marginTop: '2px' },
  adminBadge:  { display: 'inline-block', marginTop: '8px', fontSize: '12px', fontWeight: '700', backgroundColor: '#7c3aed', color: '#fff', padding: '3px 10px', borderRadius: '20px' },
  userBadge:   { display: 'inline-block', marginTop: '8px', fontSize: '12px', fontWeight: '700', backgroundColor: '#0369a1', color: '#fff', padding: '3px 10px', borderRadius: '20px' },
  grid:        { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', alignItems: 'start' },
  leftCol:     { display: 'flex', flexDirection: 'column', gap: '24px' },
  rightCol:    { display: 'flex', flexDirection: 'column', gap: '24px' },
  card:        { background: '#fff', borderRadius: '14px', boxShadow: '0 2px 10px rgba(0,0,0,0.06)', padding: '28px' },
  sectionTitle:{ fontSize: '16px', fontWeight: '700', color: '#0f172a', marginBottom: '20px' },
  form:        { display: 'flex', flexDirection: 'column', gap: '16px' },
  field:       { display: 'flex', flexDirection: 'column', gap: '5px' },
  label:       { fontSize: '13px', fontWeight: '600', color: '#374151' },
  input:       { padding: '10px 14px', border: '1.5px solid #e2e8f0', borderRadius: '8px', fontSize: '14px', fontFamily: 'inherit', outline: 'none', backgroundColor: '#fafafa', width: '100%' },
  inputErr:    { borderColor: '#ef4444', backgroundColor: '#fff5f5' },
  readOnly:    { padding: '10px 14px', border: '1.5px solid #f1f5f9', borderRadius: '8px', fontSize: '14px', backgroundColor: '#f8fafc', color: '#64748b' },
  pwWrap:      { position: 'relative', display: 'flex', alignItems: 'center' },
  pwInput:     { paddingRight: '44px' },
  eyeBtn:      { position: 'absolute', right: '10px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px', lineHeight: 1, padding: '4px' },
  errMsg:      { fontSize: '12px', color: '#ef4444' },
  btn:         { padding: '11px 20px', background: 'linear-gradient(135deg,#4f46e5,#6366f1)', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit' },
  btnDanger:   { background: 'linear-gradient(135deg,#ef4444,#f87171)' },
  btnDis:      { opacity: 0.65, cursor: 'not-allowed' },
  statsGrid:   { display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '14px' },
  statSkeleton:{ height: '90px', borderRadius: '10px' },
  statCard:    { background: '#f8fafc', borderRadius: '10px', padding: '16px 12px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', transition: 'all 0.18s' },
  statIcon:    { fontSize: '22px' },
  statValue:   { fontSize: '26px', fontWeight: '800' },
  statLabel:   { fontSize: '11px', fontWeight: '600', color: '#64748b', textAlign: 'center', textTransform: 'uppercase', letterSpacing: '0.4px' },
  infoCard:    { },
  infoRow:     { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #f1f5f9' },
  infoKey:     { fontSize: '13px', color: '#64748b', fontWeight: '500' },
  infoVal:     { fontSize: '13px', color: '#0f172a', fontWeight: '600' },
};

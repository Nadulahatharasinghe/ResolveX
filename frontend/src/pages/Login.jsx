import { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';

export default function Login() {
  const navigate = useNavigate();
  const { login, isAuthenticated, isAdmin } = useContext(AuthContext);

  const [email, setEmail]     = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw]   = useState(false);
  const [errors, setErrors]   = useState({});
  const [loading, setLoading] = useState(false);

  // Redirect already-authenticated users away from login
  useEffect(() => {
    if (isAuthenticated) {
      navigate(isAdmin ? '/admin' : '/dashboard', { replace: true });
    }
  }, [isAuthenticated, isAdmin, navigate]);

  const validate = () => {
    const e = {};
    if (!email.trim()) e.email = 'Email is required';
    else if (!/^\S+@\S+\.\S+$/.test(email)) e.email = 'Enter a valid email address';
    if (!password) e.password = 'Password is required';
    return e;
  };

  const handleSubmit = async (evt) => {
    evt.preventDefault();
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setErrors({});
    setLoading(true);
    try {
      const res = await api.post('/auth/login', { email, password });
      const userData = res.data.user;
      login(userData, res.data.token);
      toast.success(`Welcome back, ${userData.name}!`);
      // Admins go straight to admin panel
      navigate(userData?.role === 'admin' ? '/admin' : '/dashboard');
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed. Please try again.';
      toast.error(msg);
      setErrors({ form: msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={s.page}>
      <motion.div
        style={s.card}
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
      >
        <div style={s.logoRow}>
          <span style={s.logoIcon}>🚀</span>
          <span style={s.logoText}>ResolveX</span>
        </div>
        <h1 style={s.title}>Sign in to your account</h1>
        <p style={s.sub}>Track and resolve issues faster</p>

        <form onSubmit={handleSubmit} style={s.form} noValidate>
          {/* Email */}
          <div style={s.field}>
            <label style={s.label}>Email address</label>
            <input
              type="email"
              value={email}
              onChange={e => { setEmail(e.target.value); setErrors(p => ({ ...p, email: '' })); }}
              placeholder="you@example.com"
              style={{ ...s.input, ...(errors.email ? s.inputErr : {}) }}
              autoComplete="email"
              id="login-email"
            />
            {errors.email && <span style={s.errMsg}>{errors.email}</span>}
          </div>

          {/* Password */}
          <div style={s.field}>
            <label style={s.label}>Password</label>
            <div style={s.pwWrap}>
              <input
                type={showPw ? 'text' : 'password'}
                value={password}
                onChange={e => { setPassword(e.target.value); setErrors(p => ({ ...p, password: '' })); }}
                placeholder="Enter your password"
                style={{ ...s.input, ...s.pwInput, ...(errors.password ? s.inputErr : {}) }}
                autoComplete="current-password"
                id="login-password"
              />
              <button type="button" style={s.eyeBtn} onClick={() => setShowPw(v => !v)} tabIndex={-1} aria-label="Toggle password visibility">
                {showPw ? '🙈' : '👁️'}
              </button>
            </div>
            {errors.password && <span style={s.errMsg}>{errors.password}</span>}
          </div>

          <motion.button
            type="submit"
            style={{ ...s.btn, ...(loading ? s.btnDisabled : {}) }}
            disabled={loading}
            whileHover={!loading ? { scale: 1.02 } : {}}
            whileTap={!loading ? { scale: 0.98 } : {}}
            id="login-submit"
          >
            {loading && <span style={s.spinner} />}
            {loading ? 'Signing in…' : 'Sign In'}
          </motion.button>
        </form>

        <p style={s.footer}>
          Don't have an account?{' '}
          <Link to="/register" style={s.link}>Create one</Link>
        </p>
      </motion.div>
    </div>
  );
}

const s = {
  page:       { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg,#eef2ff 0%,#f8fafc 60%,#f0fdf4 100%)', padding: '20px' },
  card:       { background: '#fff', borderRadius: '16px', boxShadow: '0 8px 40px rgba(79,70,229,0.10)', padding: '44px 40px', width: '100%', maxWidth: '420px' },
  logoRow:    { display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center', marginBottom: '20px' },
  logoIcon:   { fontSize: '28px' },
  logoText:   { fontSize: '22px', fontWeight: '800', color: '#4f46e5', letterSpacing: '-0.5px' },
  title:      { textAlign: 'center', fontSize: '20px', fontWeight: '700', color: '#0f172a', marginBottom: '4px' },
  sub:        { textAlign: 'center', fontSize: '14px', color: '#64748b', marginBottom: '28px' },
  form:       { display: 'flex', flexDirection: 'column', gap: '18px' },
  field:      { display: 'flex', flexDirection: 'column', gap: '5px' },
  label:      { fontSize: '13px', fontWeight: '600', color: '#374151' },
  input:      { padding: '10px 14px', border: '1.5px solid #e2e8f0', borderRadius: '8px', fontSize: '14px', fontFamily: 'inherit', outline: 'none', transition: 'border-color 0.18s', width: '100%', backgroundColor: '#fafafa' },
  inputErr:   { borderColor: '#ef4444', backgroundColor: '#fff5f5' },
  pwWrap:     { position: 'relative', display: 'flex', alignItems: 'center' },
  pwInput:    { paddingRight: '44px' },
  eyeBtn:     { position: 'absolute', right: '10px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px', lineHeight: 1, padding: '4px' },
  errMsg:     { fontSize: '12px', color: '#ef4444', marginTop: '2px' },
  btn:        { marginTop: '6px', padding: '12px', background: 'linear-gradient(135deg,#4f46e5,#6366f1)', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontFamily: 'inherit' },
  btnDisabled:{ opacity: 0.7, cursor: 'not-allowed' },
  spinner:    { width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block' },
  footer:     { textAlign: 'center', marginTop: '22px', fontSize: '14px', color: '#64748b' },
  link:       { color: '#4f46e5', fontWeight: '600', textDecoration: 'none' },
};

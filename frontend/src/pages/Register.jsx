import { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';

function passwordStrength(pw) {
  if (!pw) return 0;
  let s = 0;
  if (pw.length >= 6)  s++;
  if (pw.length >= 10) s++;
  if (/[A-Z]/.test(pw)) s++;
  if (/[0-9]/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  return s; // 0-5
}

const strengthLabel = [null, 'Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];
const strengthColor = [null, '#ef4444', '#f97316', '#eab308', '#22c55e', '#10b981'];

export default function Register() {
  const navigate = useNavigate();
  const { isAuthenticated } = useContext(AuthContext);

  const [name, setName]         = useState('');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm]   = useState('');
  const [showPw, setShowPw]     = useState(false);
  const [showCf, setShowCf]     = useState(false);
  const [errors, setErrors]     = useState({});
  const [loading, setLoading]   = useState(false);

  useEffect(() => {
    if (isAuthenticated) navigate('/dashboard', { replace: true });
  }, [isAuthenticated, navigate]);

  const strength = passwordStrength(password);

  const validate = () => {
    const e = {};
    if (!name.trim())    e.name = 'Name is required';
    if (!email.trim())   e.email = 'Email is required';
    else if (!/^\S+@\S+\.\S+$/.test(email)) e.email = 'Enter a valid email address';
    if (!password)       e.password = 'Password is required';
    else if (password.length < 6) e.password = 'At least 6 characters required';
    if (!confirm)        e.confirm = 'Please confirm your password';
    else if (confirm !== password) e.confirm = 'Passwords do not match';
    return e;
  };

  const handleSubmit = async (evt) => {
    evt.preventDefault();
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setErrors({});
    setLoading(true);
    try {
      await api.post('/auth/register', { name, email, password });
      toast.success('Account created! Please sign in.');
      navigate('/login');
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed.';
      toast.error(msg);
      setErrors({ form: msg });
    } finally {
      setLoading(false);
    }
  };

  const clr = (field) => setErrors(p => ({ ...p, [field]: '' }));

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
        <h1 style={s.title}>Create your account</h1>
        <p style={s.sub}>Start tracking issues in seconds</p>

        <form onSubmit={handleSubmit} style={s.form} noValidate>
          {/* Name */}
          <div style={s.field}>
            <label style={s.label}>Full name</label>
            <input type="text" value={name} onChange={e => { setName(e.target.value); clr('name'); }}
              placeholder="Jane Smith" style={{ ...s.input, ...(errors.name ? s.inputErr : {}) }}
              autoComplete="name" id="register-name" />
            {errors.name && <span style={s.errMsg}>{errors.name}</span>}
          </div>

          {/* Email */}
          <div style={s.field}>
            <label style={s.label}>Email address</label>
            <input type="email" value={email} onChange={e => { setEmail(e.target.value); clr('email'); }}
              placeholder="jane@example.com" style={{ ...s.input, ...(errors.email ? s.inputErr : {}) }}
              autoComplete="email" id="register-email" />
            {errors.email && <span style={s.errMsg}>{errors.email}</span>}
          </div>

          {/* Password */}
          <div style={s.field}>
            <label style={s.label}>Password</label>
            <div style={s.pwWrap}>
              <input type={showPw ? 'text' : 'password'} value={password}
                onChange={e => { setPassword(e.target.value); clr('password'); }}
                placeholder="Min. 6 characters"
                style={{ ...s.input, ...s.pwInput, ...(errors.password ? s.inputErr : {}) }}
                autoComplete="new-password" id="register-password" />
              <button type="button" style={s.eyeBtn} onClick={() => setShowPw(v => !v)} tabIndex={-1}>
                {showPw ? '🙈' : '👁️'}
              </button>
            </div>
            {/* Strength meter */}
            {password && (
              <div style={{ marginTop: '6px' }}>
                <div style={s.strengthBar}>
                  {[1,2,3,4,5].map(n => (
                    <div key={n} style={{ ...s.strengthSeg, backgroundColor: n <= strength ? strengthColor[strength] : '#e2e8f0' }} />
                  ))}
                </div>
                <span style={{ fontSize: '11px', color: strengthColor[strength], fontWeight: '600' }}>
                  {strengthLabel[strength]}
                </span>
              </div>
            )}
            {errors.password && <span style={s.errMsg}>{errors.password}</span>}
          </div>

          {/* Confirm Password */}
          <div style={s.field}>
            <label style={s.label}>Confirm password</label>
            <div style={s.pwWrap}>
              <input type={showCf ? 'text' : 'password'} value={confirm}
                onChange={e => { setConfirm(e.target.value); clr('confirm'); }}
                placeholder="Re-enter your password"
                style={{ ...s.input, ...s.pwInput, ...(errors.confirm ? s.inputErr : {}) }}
                autoComplete="new-password" id="register-confirm" />
              <button type="button" style={s.eyeBtn} onClick={() => setShowCf(v => !v)} tabIndex={-1}>
                {showCf ? '🙈' : '👁️'}
              </button>
            </div>
            {/* Match indicator */}
            {confirm && (
              <span style={{ fontSize: '12px', color: confirm === password ? '#10b981' : '#ef4444', marginTop: '2px' }}>
                {confirm === password ? '✓ Passwords match' : '✗ Passwords do not match'}
              </span>
            )}
            {errors.confirm && <span style={s.errMsg}>{errors.confirm}</span>}
          </div>

          <motion.button
            type="submit"
            style={{ ...s.btn, ...(loading ? s.btnDisabled : {}) }}
            disabled={loading}
            whileHover={!loading ? { scale: 1.02 } : {}}
            whileTap={!loading ? { scale: 0.98 } : {}}
            id="register-submit"
          >
            {loading ? <span style={s.spinner} /> : null}
            {loading ? 'Creating account…' : 'Create Account'}
          </motion.button>
        </form>

        <p style={s.footer}>
          Already have an account?{' '}
          <Link to="/login" style={s.link}>Sign in</Link>
        </p>
      </motion.div>
    </div>
  );
}

const s = {
  page:        { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg,#eef2ff 0%,#f8fafc 60%,#f0fdf4 100%)', padding: '20px' },
  card:        { background: '#fff', borderRadius: '16px', boxShadow: '0 8px 40px rgba(79,70,229,0.10)', padding: '40px', width: '100%', maxWidth: '440px' },
  logoRow:     { display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center', marginBottom: '18px' },
  logoIcon:    { fontSize: '28px' },
  logoText:    { fontSize: '22px', fontWeight: '800', color: '#4f46e5', letterSpacing: '-0.5px' },
  title:       { textAlign: 'center', fontSize: '20px', fontWeight: '700', color: '#0f172a', marginBottom: '4px' },
  sub:         { textAlign: 'center', fontSize: '14px', color: '#64748b', marginBottom: '24px' },
  form:        { display: 'flex', flexDirection: 'column', gap: '16px' },
  field:       { display: 'flex', flexDirection: 'column', gap: '4px' },
  label:       { fontSize: '13px', fontWeight: '600', color: '#374151' },
  input:       { padding: '10px 14px', border: '1.5px solid #e2e8f0', borderRadius: '8px', fontSize: '14px', fontFamily: 'inherit', outline: 'none', transition: 'border-color 0.18s', width: '100%', backgroundColor: '#fafafa' },
  inputErr:    { borderColor: '#ef4444', backgroundColor: '#fff5f5' },
  pwWrap:      { position: 'relative', display: 'flex', alignItems: 'center' },
  pwInput:     { paddingRight: '44px' },
  eyeBtn:      { position: 'absolute', right: '10px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px', lineHeight: 1, padding: '4px' },
  errMsg:      { fontSize: '12px', color: '#ef4444', marginTop: '2px' },
  strengthBar: { display: 'flex', gap: '4px', marginBottom: '3px' },
  strengthSeg: { flex: 1, height: '4px', borderRadius: '2px', transition: 'background-color 0.3s' },
  btn:         { marginTop: '6px', padding: '12px', background: 'linear-gradient(135deg,#4f46e5,#6366f1)', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontFamily: 'inherit' },
  btnDisabled: { opacity: 0.7, cursor: 'not-allowed' },
  spinner:     { width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block' },
  footer:      { textAlign: 'center', marginTop: '20px', fontSize: '14px', color: '#64748b' },
  link:        { color: '#4f46e5', fontWeight: '600', textDecoration: 'none' },
};

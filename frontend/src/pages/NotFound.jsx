import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function NotFound() {
  return (
    <div style={s.page}>
      <motion.div style={s.card}
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}>
        <div style={s.emoji}>🔍</div>
        <h1 style={s.code}>404</h1>
        <h2 style={s.title}>Page not found</h2>
        <p style={s.sub}>The page you're looking for doesn't exist or has been moved.</p>
        <Link to="/dashboard" style={s.btn}>← Back to Dashboard</Link>
      </motion.div>
    </div>
  );
}

const s = {
  page:  { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f1f5f9', padding: '20px' },
  card:  { background: '#fff', borderRadius: '16px', boxShadow: '0 8px 32px rgba(0,0,0,0.08)', padding: '60px 48px', textAlign: 'center', maxWidth: '440px', width: '100%' },
  emoji: { fontSize: '56px', marginBottom: '12px' },
  code:  { fontSize: '72px', fontWeight: '800', color: '#4f46e5', lineHeight: 1, marginBottom: '8px' },
  title: { fontSize: '22px', fontWeight: '700', color: '#0f172a', marginBottom: '10px' },
  sub:   { fontSize: '15px', color: '#64748b', marginBottom: '32px', lineHeight: 1.6 },
  btn:   { display: 'inline-block', padding: '12px 28px', background: 'linear-gradient(135deg,#4f46e5,#6366f1)', color: '#fff', textDecoration: 'none', borderRadius: '8px', fontWeight: '600', fontSize: '15px' },
};

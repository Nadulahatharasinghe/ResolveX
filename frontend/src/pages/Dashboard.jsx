import { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import Navbar from '../components/Navbar';
import { AuthContext } from '../context/AuthContext';
import { getIssues } from '../services/api';

/* ── animation variants ────────────────────────────────────── */
const container = {
  hidden: {},
  show:   { transition: { staggerChildren: 0.07 } }
};
const cardVariant = {
  hidden: { opacity: 0, y: 20 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.3 } }
};

/* ── skeleton block ─────────────────────────────────────────── */
function Skeleton({ w = '100%', h = 20, radius = 6, mb = 0 }) {
  return <div className="skeleton" style={{ width: w, height: h, borderRadius: radius, marginBottom: mb }} />;
}

/* ── stat card ──────────────────────────────────────────────── */
function StatCard({ label, value, color, icon, filterKey, filterVal, loading }) {
  const navigate = useNavigate();
  const handleClick = () => {
    if (filterKey && filterVal) navigate(`/issues?${filterKey}=${encodeURIComponent(filterVal)}`);
    else navigate('/issues');
  };

  return (
    <motion.div
      variants={cardVariant}
      style={{ ...s.statCard, borderTop: `4px solid ${color}`, cursor: 'pointer' }}
      whileHover={{ y: -3, boxShadow: '0 8px 24px rgba(0,0,0,0.09)' }}
      whileTap={{ scale: 0.97 }}
      onClick={handleClick}
      title={`View ${label} issues`}
    >
      {loading ? (
        <>
          <Skeleton h={14} w="60%" mb={10} />
          <Skeleton h={36} w="40%" />
        </>
      ) : (
        <>
          <div style={s.statTop}>
            <span style={s.statLabel}>{label}</span>
            <span style={s.statIcon}>{icon}</span>
          </div>
          <motion.span
            key={value}
            style={{ ...s.statValue, color }}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
          >
            {value}
          </motion.span>
          <span style={s.statHint}>Click to filter →</span>
        </>
      )}
    </motion.div>
  );
}

/* ── donut chart ─────────────────────────────────────────────── */
const DONUT_COLORS = { Open: '#3b82f6', 'In Progress': '#a855f7', Resolved: '#10b981', Closed: '#94a3b8' };
const PRIO_COLORS  = { High: '#ef4444', Medium: '#f59e0b', Low: '#22c55e' };

function DonutCard({ title, data, colors, loading }) {
  if (loading) return (
    <div style={s.chartCard}>
      <Skeleton h={18} w="50%" mb={20} />
      <Skeleton h={200} radius={8} />
    </div>
  );
  const chartData = data.filter(d => d.value > 0);
  if (!chartData.length) return (
    <div style={s.chartCard}>
      <h3 style={s.chartTitle}>{title}</h3>
      <div style={s.chartEmpty}>No data yet</div>
    </div>
  );
  return (
    <div style={s.chartCard}>
      <h3 style={s.chartTitle}>{title}</h3>
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie data={chartData} cx="50%" cy="50%" innerRadius={55} outerRadius={85}
            paddingAngle={3} dataKey="value" nameKey="name">
            {chartData.map((entry) => (
              <Cell key={entry.name} fill={colors[entry.name] || '#cbd5e1'} />
            ))}
          </Pie>
          <Tooltip formatter={(v, n) => [v, n]} contentStyle={{ borderRadius: 8, fontSize: 13 }} />
          <Legend iconType="circle" iconSize={10} wrapperStyle={{ fontSize: 13 }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

/* ── main component ──────────────────────────────────────────── */
export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [stats, setStats] = useState({ total: 0, open: 0, inProgress: 0, resolved: 0, closed: 0, highPriority: 0 });
  const [statusData, setStatusData]   = useState([]);
  const [priorityData, setPriorityData] = useState([]);
  const [recentIssues, setRecentIssues] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await getIssues();
        const all = res.data.data || [];
        const open       = all.filter(i => i.status === 'Open').length;
        const inProgress = all.filter(i => i.status === 'In Progress').length;
        const resolved   = all.filter(i => i.status === 'Resolved').length;
        const closed     = all.filter(i => i.status === 'Closed').length;
        const high       = all.filter(i => i.priority === 'High').length;
        const med        = all.filter(i => i.priority === 'Medium').length;
        const low        = all.filter(i => i.priority === 'Low').length;
        setStats({ total: all.length, open, inProgress, resolved, closed, highPriority: high });
        setStatusData([
          { name: 'Open', value: open },
          { name: 'In Progress', value: inProgress },
          { name: 'Resolved', value: resolved },
          { name: 'Closed', value: closed },
        ]);
        setPriorityData([
          { name: 'High', value: high },
          { name: 'Medium', value: med },
          { name: 'Low', value: low },
        ]);
        setRecentIssues(all.slice(0, 5));
      } catch (err) {
        console.error('Dashboard load error:', err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const statCards = [
    { label: 'Total Issues',  value: stats.total,       color: '#4f46e5', icon: '📋', filterKey: null },
    { label: 'Open',          value: stats.open,        color: '#3b82f6', icon: '🔓', filterKey: 'status', filterVal: 'Open' },
    { label: 'In Progress',   value: stats.inProgress,  color: '#a855f7', icon: '⚡', filterKey: 'status', filterVal: 'In Progress' },
    { label: 'Resolved',      value: stats.resolved,    color: '#10b981', icon: '✅', filterKey: 'status', filterVal: 'Resolved' },
    { label: 'High Priority', value: stats.highPriority,color: '#ef4444', icon: '🔥', filterKey: 'priority', filterVal: 'High' },
  ];

  const statusBadgeStyle = (st) => {
    const m = { Open: ['#dbeafe','#1e40af'], 'In Progress': ['#f3e8ff','#6b21a8'], Resolved: ['#d1fae5','#065f46'], Closed: ['#e2e8f0','#475569'] };
    const [bg, fg] = m[st] || ['#f1f5f9','#475569'];
    return { backgroundColor: bg, color: fg, padding: '3px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '600' };
  };

  return (
    <div>
      <Navbar />
      <div style={s.page} className="page-enter">

        {/* Welcome banner */}
        <motion.div style={s.banner} initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          <div>
            <h1 style={s.bannerTitle}>Welcome back, {user?.name?.split(' ')[0]} 👋</h1>
            <p style={s.bannerSub}>Here's what's happening with your issues today.</p>
          </div>
          <div style={s.bannerActions}>
            <Link to="/create-issue" style={s.primaryBtn}>+ Create Issue</Link>
            <Link to="/issues" style={s.secondaryBtn}>View All</Link>
          </div>
        </motion.div>

        {/* Stat cards */}
        <motion.div style={s.statsGrid} variants={container} initial="hidden" animate="show">
          {statCards.map(card => (
            <StatCard key={card.label} {...card} loading={loading} />
          ))}
        </motion.div>

        {/* Charts row */}
        <div style={s.chartsRow}>
          <DonutCard title="Issues by Status"   data={statusData}   colors={DONUT_COLORS} loading={loading} />
          <DonutCard title="Issues by Priority" data={priorityData} colors={PRIO_COLORS}  loading={loading} />
        </div>

        {/* Recent issues */}
        <div style={s.recentCard}>
          <div style={s.recentHeader}>
            <h2 style={s.recentTitle}>Recent Issues</h2>
            <Link to="/issues" style={s.viewAll}>View all →</Link>
          </div>

          {loading ? (
            <div style={s.recentList}>
              {[1,2,3,4].map(i => (
                <div key={i} style={s.recentSkeletonRow}>
                  <div>
                    <Skeleton h={15} w={260} mb={6} />
                    <Skeleton h={12} w={160} />
                  </div>
                  <Skeleton h={24} w={80} radius={20} />
                </div>
              ))}
            </div>
          ) : recentIssues.length === 0 ? (
            <div style={s.empty}>
              <span style={s.emptyIcon}>📭</span>
              <p style={s.emptyTitle}>No issues yet</p>
              <p style={s.emptySub}>Create your first issue to get started</p>
              <Link to="/create-issue" style={s.emptyBtn}>+ Create Issue</Link>
            </div>
          ) : (
            <motion.div style={s.recentList} variants={container} initial="hidden" animate="show">
              {recentIssues.map(issue => (
                <motion.div key={issue._id} variants={cardVariant} style={s.recentRow}
                  whileHover={{ backgroundColor: '#f1f5f9' }}
                  onClick={() => navigate(`/issues/${issue._id}`)}>
                  <div>
                    <p style={s.recentIssueTitle}>{issue.title}</p>
                    <span style={s.recentMeta}>
                      {issue.issueType} · {issue.priority} · {issue.assignee?.name || 'Unassigned'}
                    </span>
                  </div>
                  <span style={statusBadgeStyle(issue.status)}>{issue.status}</span>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>

      </div>
    </div>
  );
}

const s = {
  page:           { maxWidth: '1100px', margin: '0 auto', padding: '28px 20px', display: 'flex', flexDirection: 'column', gap: '24px' },
  banner:         { background: '#fff', borderRadius: '14px', boxShadow: '0 2px 10px rgba(0,0,0,0.06)', padding: '28px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' },
  bannerTitle:    { fontSize: '22px', fontWeight: '800', color: '#0f172a' },
  bannerSub:      { fontSize: '14px', color: '#64748b', marginTop: '4px' },
  bannerActions:  { display: 'flex', gap: '12px', flexWrap: 'wrap' },
  primaryBtn:     { backgroundColor: '#4f46e5', color: '#fff', padding: '10px 20px', borderRadius: '8px', textDecoration: 'none', fontWeight: '600', fontSize: '14px' },
  secondaryBtn:   { backgroundColor: '#f1f5f9', color: '#334155', padding: '10px 20px', borderRadius: '8px', textDecoration: 'none', fontWeight: '600', fontSize: '14px', border: '1px solid #e2e8f0' },

  statsGrid:      { display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(175px,1fr))', gap: '16px' },
  statCard:       { background: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', gap: '6px', minHeight: '110px' },
  statTop:        { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  statLabel:      { fontSize: '12px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' },
  statIcon:       { fontSize: '18px' },
  statValue:      { fontSize: '32px', fontWeight: '800', lineHeight: 1 },
  statHint:       { fontSize: '11px', color: '#94a3b8', marginTop: '2px' },

  chartsRow:      { display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: '20px' },
  chartCard:      { background: '#fff', borderRadius: '14px', boxShadow: '0 2px 10px rgba(0,0,0,0.06)', padding: '24px' },
  chartTitle:     { fontSize: '15px', fontWeight: '700', color: '#0f172a', marginBottom: '4px' },
  chartEmpty:     { textAlign: 'center', padding: '60px 0', color: '#94a3b8', fontSize: '14px' },

  recentCard:     { background: '#fff', borderRadius: '14px', boxShadow: '0 2px 10px rgba(0,0,0,0.06)', padding: '24px' },
  recentHeader:   { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' },
  recentTitle:    { fontSize: '16px', fontWeight: '700', color: '#0f172a' },
  viewAll:        { fontSize: '13px', color: '#4f46e5', textDecoration: 'none', fontWeight: '600' },
  recentList:     { display: 'flex', flexDirection: 'column', gap: '2px' },
  recentRow:      { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 14px', borderRadius: '8px', cursor: 'pointer', transition: 'background-color 0.15s', gap: '12px' },
  recentSkeletonRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 14px', gap: '12px' },
  recentIssueTitle: { fontSize: '14px', fontWeight: '600', color: '#1e293b', marginBottom: '3px' },
  recentMeta:     { fontSize: '12px', color: '#94a3b8' },

  empty:          { textAlign: 'center', padding: '40px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' },
  emptyIcon:      { fontSize: '40px' },
  emptyTitle:     { fontSize: '16px', fontWeight: '700', color: '#0f172a' },
  emptySub:       { fontSize: '14px', color: '#64748b' },
  emptyBtn:       { marginTop: '8px', padding: '10px 20px', background: '#4f46e5', color: '#fff', textDecoration: 'none', borderRadius: '8px', fontWeight: '600', fontSize: '14px' },
};

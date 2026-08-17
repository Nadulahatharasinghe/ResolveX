import { useState, useEffect, useContext } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar';
import { getIssues, deleteIssue } from '../services/api';
import { AuthContext } from '../context/AuthContext';

/* ── helpers ─────────────────────────────────────────────────── */
function Skeleton({ w = '100%', h = 16, radius = 6 }) {
  return <div className="skeleton" style={{ width: w, height: h, borderRadius: radius }} />;
}

function SkeletonRow() {
  return (
    <tr>
      <td style={s.tdTitle}><Skeleton h={15} /><div style={{ marginTop: 6 }}><Skeleton h={12} w="70%" /></div></td>
      <td style={s.td}><Skeleton h={22} w={60} radius={20} /></td>
      <td style={s.td}><Skeleton h={22} w={60} radius={20} /></td>
      <td style={s.td}><Skeleton h={22} w={80} radius={20} /></td>
      <td style={s.td}><Skeleton h={14} w={90} /></td>
      <td style={s.td}><Skeleton h={14} w={70} /></td>
      <td style={s.tdActions}><Skeleton h={28} w={120} radius={6} /></td>
    </tr>
  );
}

const typeBadge   = t => t === 'Bug' ? { bg:'#fee2e2', fg:'#991b1b' } : { bg:'#e0f2fe', fg:'#075985' };
const prioColor   = p => ({ High:['#ffedd5','#9a3412'], Medium:['#fef9c3','#854d0e'], Low:['#dcfce7','#166534'] }[p] || ['#f1f5f9','#475569']);
const statusStyle = st => {
  const m = { Open:['#dbeafe','#1e40af'], 'In Progress':['#f3e8ff','#6b21a8'], Resolved:['#d1fae5','#065f46'], Closed:['#e2e8f0','#475569'] };
  const [bg,fg] = m[st] || ['#f1f5f9','#475569'];
  return { backgroundColor:bg, color:fg };
};

/* ── delete confirmation modal ───────────────────────────────── */
function DeleteModal({ title, onConfirm, onCancel, loading }) {
  return (
    <motion.div style={s.overlay} initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}>
      <motion.div style={s.modal} initial={{ scale:0.88, opacity:0 }} animate={{ scale:1, opacity:1 }} exit={{ scale:0.88, opacity:0 }} transition={{ duration:0.2 }}>
        <div style={s.modalIcon}>🗑️</div>
        <h3 style={s.modalTitle}>Delete Issue</h3>
        <p style={s.modalBody}>Are you sure you want to delete <strong>"{title}"</strong>? This cannot be undone.</p>
        <div style={s.modalBtns}>
          <button style={s.modalCancel} onClick={onCancel} disabled={loading}>Cancel</button>
          <button style={{ ...s.modalConfirm, ...(loading ? s.btnDis : {}) }} onClick={onConfirm} disabled={loading}>
            {loading ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ── main component ──────────────────────────────────────────── */
export default function Issues() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useContext(AuthContext);
  const isAdmin = user?.role === 'admin';

  const [issues, setIssues]       = useState([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState('');
  const [status, setStatus]       = useState(searchParams.get('status') || '');
  const [priority, setPriority]   = useState(searchParams.get('priority') || '');
  const [issueType, setIssueType] = useState('');

  // Delete modal
  const [deleteTarget, setDeleteTarget] = useState(null); // { id, title }
  const [deleting, setDeleting]         = useState(false);

  const fetchList = async (params = {}) => {
    setLoading(true);
    try {
      const res = await getIssues(params);
      setIssues(res.data.data || []);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load issues');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const p = {};
    if (status)    p.status    = status;
    if (priority)  p.priority  = priority;
    if (issueType) p.issueType = issueType;
    if (search.trim()) p.search = search.trim();
    fetchList(p);
  }, [status, priority, issueType]);

  const handleSearch = (e) => { e.preventDefault(); const p = {}; if (search.trim()) p.search = search.trim(); if (status) p.status = status; if (priority) p.priority = priority; if (issueType) p.issueType = issueType; fetchList(p); };

  const clearFilters = () => { setSearch(''); setStatus(''); setPriority(''); setIssueType(''); fetchList({}); };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteIssue(deleteTarget.id);
      setIssues(prev => prev.filter(i => i._id !== deleteTarget.id));
      toast.success('Issue deleted');
      setDeleteTarget(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete issue');
    } finally {
      setDeleting(false);
    }
  };

  const hasFilters = search || status || priority || issueType;

  return (
    <div>
      <Navbar />
      <AnimatePresence>
        {deleteTarget && (
          <DeleteModal
            title={deleteTarget.title}
            onConfirm={confirmDelete}
            onCancel={() => setDeleteTarget(null)}
            loading={deleting}
          />
        )}
      </AnimatePresence>

      <div style={s.page} className="page-enter">
        {/* Header */}
        <div style={s.header}>
          <div>
            <h1 style={s.pageTitle}>Issue Tracker</h1>
            <p style={s.pageSub}>Manage and track your software issues</p>
          </div>
          <Link to="/create-issue" style={s.createBtn}>+ New Issue</Link>
        </div>

        {/* Search + filters toolbar */}
        <div style={s.toolbar}>
          <form onSubmit={handleSearch} style={s.searchRow}>
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search title or description…" style={s.searchInput} />
            <button type="submit" style={s.searchBtn}>Search</button>
          </form>
          <div style={s.filterRow}>
            {[
              { val: status,    set: setStatus,    placeholder: 'Status: All',   options: ['Open','In Progress','Resolved','Closed'] },
              { val: priority,  set: setPriority,  placeholder: 'Priority: All', options: ['Low','Medium','High'] },
              { val: issueType, set: setIssueType, placeholder: 'Type: All',     options: ['Bug','Task'] },
            ].map(({ val, set, placeholder, options }) => (
              <select key={placeholder} value={val} onChange={e => set(e.target.value)} style={s.select}>
                <option value="">{placeholder}</option>
                {options.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            ))}
            {hasFilters && (
              <button onClick={clearFilters} style={s.clearBtn}>✕ Clear</button>
            )}
          </div>
        </div>

        {/* Table */}
        <div style={s.tableCard}>
          <div style={s.tableWrap}>
            <table style={s.table}>
              <thead>
                <tr style={s.thead}>
                  {['Title','Type','Priority','Status','Assignee','Created','Actions'].map(h => (
                    <th key={h} style={s.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
                ) : issues.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ padding: 0, border: 'none' }}>
                      <div style={s.empty}>
                        <span style={s.emptyIcon}>{hasFilters ? '🔍' : '📭'}</span>
                        <p style={s.emptyTitle}>{hasFilters ? 'No matching issues' : 'No issues yet'}</p>
                        <p style={s.emptySub}>{hasFilters ? 'Try adjusting your filters.' : 'Create your first issue to get started.'}</p>
                        {hasFilters
                          ? <button style={s.emptyBtn} onClick={clearFilters}>Clear Filters</button>
                          : <Link to="/create-issue" style={s.emptyBtn}>+ Create Issue</Link>}
                      </div>
                    </td>
                  </tr>
                ) : (
                  <AnimatePresence>
                    {issues.map((issue, idx) => {
                      const creatorId    = issue.createdBy?._id || issue.createdBy;
                      const currentUserId = user?._id || user?.id;
                      const isOwner  = creatorId?.toString() === currentUserId?.toString();
                      const canEdit  = isAdmin || isOwner;
                      const canDelete = isAdmin || isOwner;
                      const [pBg, pFg] = prioColor(issue.priority);
                      const { bg: tBg, fg: tFg } = typeBadge(issue.issueType);

                      return (
                        <motion.tr key={issue._id} style={s.tr}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          transition={{ delay: idx * 0.04, duration: 0.22 }}
                          className="table-row-hover"
                        >
                          <td style={s.tdTitle}>
                            <Link to={`/issues/${issue._id}`} style={s.issueLink}>{issue.title}</Link>
                            <div style={s.desc}>{issue.description.length > 60 ? issue.description.slice(0,60)+'…' : issue.description}</div>
                          </td>
                          <td style={s.td}><span style={{ ...s.badge, backgroundColor: tBg, color: tFg }}>{issue.issueType}</span></td>
                          <td style={s.td}><span style={{ ...s.badge, backgroundColor: pBg, color: pFg }}>{issue.priority}</span></td>
                          <td style={s.td}><span style={{ ...s.badge, ...statusStyle(issue.status) }}>{issue.status}</span></td>
                          <td style={s.td}>{issue.assignee ? <span style={s.assignee}>{issue.assignee.name}</span> : <span style={s.unassigned}>—</span>}</td>
                          <td style={s.tdDate}>{new Date(issue.createdAt).toLocaleDateString()}</td>
                          <td style={s.tdActions}>
                            <button onClick={() => navigate(`/issues/${issue._id}`)} style={s.btnView}>View</button>
                            {canEdit   && <button onClick={() => navigate(`/issues/${issue._id}/edit`)} style={s.btnEdit}>Edit</button>}
                            {canDelete && <button onClick={() => setDeleteTarget({ id: issue._id, title: issue.title })} style={s.btnDel}>Delete</button>}
                          </td>
                        </motion.tr>
                      );
                    })}
                  </AnimatePresence>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

const s = {
  page:       { maxWidth: '1200px', margin: '0 auto', padding: '28px 20px', display: 'flex', flexDirection: 'column', gap: '20px' },
  header:     { display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' },
  pageTitle:  { fontSize: '26px', fontWeight: '800', color: '#0f172a' },
  pageSub:    { fontSize: '14px', color: '#64748b', marginTop: '2px' },
  createBtn:  { backgroundColor: '#4f46e5', color: '#fff', padding: '10px 20px', borderRadius: '8px', textDecoration: 'none', fontWeight: '600', fontSize: '14px', boxShadow: '0 2px 8px rgba(79,70,229,0.25)' },
  toolbar:    { background: '#fff', borderRadius: '12px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' },
  searchRow:  { display: 'flex', gap: '10px' },
  searchInput:{ flex: 1, padding: '9px 14px', border: '1.5px solid #e2e8f0', borderRadius: '8px', fontSize: '14px', fontFamily: 'inherit', outline: 'none', backgroundColor: '#fafafa' },
  searchBtn:  { padding: '9px 20px', backgroundColor: '#334155', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '500', cursor: 'pointer', fontFamily: 'inherit' },
  filterRow:  { display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' },
  select:     { padding: '8px 12px', border: '1.5px solid #e2e8f0', borderRadius: '8px', fontSize: '13px', backgroundColor: '#fff', outline: 'none', cursor: 'pointer', fontFamily: 'inherit' },
  clearBtn:   { padding: '8px 14px', backgroundColor: '#f1f5f9', color: '#ef4444', border: '1px solid #fecaca', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '600', fontFamily: 'inherit' },
  tableCard:  { background: '#fff', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.06)', overflow: 'hidden' },
  tableWrap:  { overflowX: 'auto' },
  table:      { width: '100%', borderCollapse: 'collapse', textAlign: 'left' },
  thead:      { backgroundColor: '#f8fafc', borderBottom: '1.5px solid #e2e8f0' },
  th:         { padding: '13px 16px', fontSize: '12px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', whiteSpace: 'nowrap' },
  tr:         { borderBottom: '1px solid #f1f5f9' },
  tdTitle:    { padding: '14px 16px', minWidth: '200px' },
  td:         { padding: '14px 16px', whiteSpace: 'nowrap' },
  tdDate:     { padding: '14px 16px', fontSize: '13px', color: '#94a3b8', whiteSpace: 'nowrap' },
  tdActions:  { padding: '14px 16px', whiteSpace: 'nowrap' },
  badge:      { display: 'inline-block', padding: '3px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '600' },
  issueLink:  { fontSize: '14px', fontWeight: '600', color: '#1e293b', textDecoration: 'none' },
  desc:       { fontSize: '12px', color: '#94a3b8', marginTop: '3px' },
  assignee:   { fontSize: '13px', fontWeight: '500', color: '#334155' },
  unassigned: { fontSize: '13px', color: '#cbd5e1' },
  btnView:    { padding: '5px 10px', backgroundColor: '#e0f2fe', color: '#0369a1', border: 'none', borderRadius: '5px', marginRight: '5px', cursor: 'pointer', fontSize: '12px', fontWeight: '500', fontFamily: 'inherit' },
  btnEdit:    { padding: '5px 10px', backgroundColor: '#fef3c7', color: '#92400e', border: 'none', borderRadius: '5px', marginRight: '5px', cursor: 'pointer', fontSize: '12px', fontWeight: '500', fontFamily: 'inherit' },
  btnDel:     { padding: '5px 10px', backgroundColor: '#fee2e2', color: '#b91c1c', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '12px', fontWeight: '500', fontFamily: 'inherit' },
  empty:      { padding: '60px 20px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' },
  emptyIcon:  { fontSize: '44px' },
  emptyTitle: { fontSize: '16px', fontWeight: '700', color: '#0f172a' },
  emptySub:   { fontSize: '14px', color: '#64748b' },
  emptyBtn:   { marginTop: '6px', padding: '9px 20px', background: '#4f46e5', color: '#fff', textDecoration: 'none', borderRadius: '8px', fontWeight: '600', fontSize: '14px', border: 'none', cursor: 'pointer', fontFamily: 'inherit' },
  overlay:    { position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999, padding: '20px' },
  modal:      { background: '#fff', borderRadius: '16px', padding: '36px 32px', maxWidth: '420px', width: '100%', boxShadow: '0 12px 40px rgba(0,0,0,0.15)', textAlign: 'center' },
  modalIcon:  { fontSize: '40px', marginBottom: '12px' },
  modalTitle: { fontSize: '18px', fontWeight: '700', color: '#0f172a', marginBottom: '8px' },
  modalBody:  { fontSize: '14px', color: '#64748b', marginBottom: '24px', lineHeight: 1.6 },
  modalBtns:  { display: 'flex', gap: '12px', justifyContent: 'center' },
  modalCancel:{ padding: '10px 24px', background: '#f1f5f9', color: '#475569', border: '1px solid #e2e8f0', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '600', fontFamily: 'inherit' },
  modalConfirm:{ padding: '10px 24px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '600', fontFamily: 'inherit' },
  btnDis:     { opacity: 0.65, cursor: 'not-allowed' },
};

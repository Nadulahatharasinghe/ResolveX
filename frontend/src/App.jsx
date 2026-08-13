import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import Login       from './pages/Login';
import Register    from './pages/Register';
import Dashboard   from './pages/Dashboard';
import Issues      from './pages/Issues';
import CreateIssue from './pages/CreateIssue';
import IssueDetails from './pages/IssueDetails';
import EditIssue   from './pages/EditIssue';
import AdminPanel  from './pages/AdminPanel';
import AdminUsers  from './pages/AdminUsers';
import Profile     from './pages/Profile';
import NotFound    from './pages/NotFound';

function App() {
  return (
    <AuthProvider>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3500,
          style: { fontFamily: 'Inter, sans-serif', fontSize: '14px', borderRadius: '10px', boxShadow: '0 4px 16px rgba(0,0,0,0.12)' },
          success: { iconTheme: { primary: '#10b981', secondary: '#fff' } },
          error:   { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
        }}
      />
      <Router>
        <Routes>
          {/* Public */}
          <Route path="/login"    element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Authenticated */}
          <Route path="/dashboard"       element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/issues"          element={<ProtectedRoute><Issues /></ProtectedRoute>} />
          <Route path="/create-issue"    element={<ProtectedRoute><CreateIssue /></ProtectedRoute>} />
          <Route path="/issues/:id"      element={<ProtectedRoute><IssueDetails /></ProtectedRoute>} />
          <Route path="/issues/:id/edit" element={<ProtectedRoute><EditIssue /></ProtectedRoute>} />
          <Route path="/profile"         element={<ProtectedRoute><Profile /></ProtectedRoute>} />

          {/* Admin-only */}
          <Route path="/admin"       element={<AdminRoute><AdminPanel /></AdminRoute>} />
          <Route path="/admin/users" element={<AdminRoute><AdminUsers /></AdminRoute>} />

          {/* 404 */}
          <Route path="/404" element={<NotFound />} />
          <Route path="*"    element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;

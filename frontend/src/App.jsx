import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Issues from './pages/Issues';
import CreateIssue from './pages/CreateIssue';
import IssueDetails from './pages/IssueDetails';
import EditIssue from './pages/EditIssue';
import AdminPanel from './pages/AdminPanel';
import AdminUsers from './pages/AdminUsers';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/login"    element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Authenticated routes */}
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/issues"    element={<ProtectedRoute><Issues /></ProtectedRoute>} />
          <Route path="/create-issue" element={<ProtectedRoute><CreateIssue /></ProtectedRoute>} />
          <Route path="/issues/:id"   element={<ProtectedRoute><IssueDetails /></ProtectedRoute>} />
          <Route path="/issues/:id/edit" element={<ProtectedRoute><EditIssue /></ProtectedRoute>} />

          {/* Admin-only routes */}
          <Route path="/admin"       element={<AdminRoute><AdminPanel /></AdminRoute>} />
          <Route path="/admin/users" element={<AdminRoute><AdminUsers /></AdminRoute>} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;

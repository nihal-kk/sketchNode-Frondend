import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import Sidebar        from './components/Sidebar';
import Login          from './pages/Login';
import Register       from './pages/Register';
import Dashboard      from './pages/Dashboard';
import Attendance     from './pages/Attendance';
import DailyTasks     from './pages/DailyTasks';
import WeeklyTasks    from './pages/WeeklyTasks';
import Analytics      from './pages/Analytics';
import Profile        from './pages/Profile';
import { useAuth }    from './context/AuthContext';

function AppLayout({ children }) {
  return (
    <div className="flex min-h-screen bg-bg">
      <Sidebar />
      <main className="flex-1 lg:ml-60 min-h-screen overflow-y-auto">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
          {children}
        </div>
      </main>
    </div>
  );
}

export default function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/login"    element={!user ? <Login />    : <Navigate to="/dashboard" replace />} />
      <Route path="/register" element={!user ? <Register /> : <Navigate to="/dashboard" replace />} />

      <Route path="/dashboard"    element={<ProtectedRoute><AppLayout><Dashboard /></AppLayout></ProtectedRoute>} />
      <Route path="/attendance"   element={<ProtectedRoute><AppLayout><Attendance /></AppLayout></ProtectedRoute>} />
      <Route path="/tasks/daily"  element={<ProtectedRoute><AppLayout><DailyTasks /></AppLayout></ProtectedRoute>} />
      <Route path="/tasks/weekly" element={<ProtectedRoute><AppLayout><WeeklyTasks /></AppLayout></ProtectedRoute>} />
      <Route path="/analytics"    element={<ProtectedRoute><AppLayout><Analytics /></AppLayout></ProtectedRoute>} />
      <Route path="/profile"      element={<ProtectedRoute><AppLayout><Profile /></AppLayout></ProtectedRoute>} />

      <Route path="*" element={<Navigate to={user ? '/dashboard' : '/login'} replace />} />
    </Routes>
  );
}

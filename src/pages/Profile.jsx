import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Calendar, LogOut } from 'lucide-react';

export default function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  const fields = [
    { Icon: User,     label: 'Full Name',     value: user?.name },
    { Icon: Mail,     label: 'Email Address', value: user?.email },
    { Icon: Calendar, label: 'Member Since',  value: user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '—' },
  ];

  return (
    <div className="space-y-6 max-w-lg">
      <div>
        <h1 className="text-2xl font-bold text-white">Profile</h1>
        <p className="text-muted text-sm mt-1">Your account information</p>
      </div>

      {/* Avatar */}
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-primary/15 border-2 border-primary/30 flex items-center justify-center text-2xl text-primary font-bold">
          {user?.name?.[0]?.toUpperCase()}
        </div>
        <div>
          <p className="text-white font-semibold text-lg">{user?.name}</p>
          <p className="text-muted text-sm">{user?.email}</p>
        </div>
      </div>

      {/* Info */}
      <div className="card space-y-4">
        {fields.map(({ Icon, label, value }) => (
          <div key={label} className="flex items-center gap-4 py-2 border-b border-border last:border-0">
            <div className="p-2 rounded-lg bg-[#0D1117] border border-border">
              <Icon className="w-4 h-4 text-muted" />
            </div>
            <div>
              <p className="text-muted text-xs font-mono uppercase tracking-widest">{label}</p>
              <p className="text-white text-sm font-medium mt-0.5">{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Logout */}
      <button onClick={handleLogout}
        className="btn-danger w-full flex items-center justify-center gap-2 py-3">
        <LogOut className="w-4 h-4" /> Sign out of Sketchnode
      </button>
    </div>
  );
}

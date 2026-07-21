import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/axios';
import { Clock, Coffee, CheckSquare, Zap, TrendingUp, BarChart2 } from 'lucide-react';

function StatCard({ label, value, sub, Icon, accent }) {
  return (
    <div className="card flex items-start gap-4">
      <div className={`p-2.5 rounded-lg ${accent}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="min-w-0">
        <p className="text-muted text-xs font-mono uppercase tracking-widest mb-1">{label}</p>
        <p className="text-white text-2xl font-bold font-mono">{value}</p>
        {sub && <p className="text-muted text-xs mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

const STATUS_MAP = {
  working:     { label: 'Working',     cls: 'badge-working' },
  on_break:    { label: 'On Break',    cls: 'badge-break' },
  not_started: { label: 'Not Started', cls: 'badge-idle' },
};

export default function Dashboard() {
  const { user }      = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/dashboard')
      .then(r => setData(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const status = STATUS_MAP[data?.attendanceStatus] ?? STATUS_MAP.not_started;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">
            Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'},{' '}
            <span className="text-primary">{user?.name?.split(' ')[0]}</span>
          </h1>
          <p className="text-muted text-sm mt-1">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <span className={status.cls}>{status.label}</span>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        <StatCard
          label="Study Time Today"
          value={data?.studyFormattedToday || '0m'}
          sub="Active work time"
          Icon={Clock}
          accent="bg-primary/10 text-primary"
        />
        <StatCard
          label="Break Time Today"
          value={data?.breakFormattedToday || '0m'}
          sub="Total outside time"
          Icon={Coffee}
          accent="bg-yellow-500/10 text-yellow-400"
        />
        <StatCard
          label="Daily Progress"
          value={`${data?.dailyTasksCompleted ?? 0} / ${data?.dailyTasksTotal ?? 0}`}
          sub="Tasks completed today"
          Icon={CheckSquare}
          accent="bg-blue-500/10 text-blue-400"
        />
        <StatCard
          label="Weekly Progress"
          value={`${data?.weeklyProgressPercent ?? 0}%`}
          sub={`${data?.weeklyTasksCompleted ?? 0} of ${data?.weeklyTasksTotal ?? 0} weekly tasks`}
          Icon={TrendingUp}
          accent="bg-purple-500/10 text-purple-400"
        />
        <StatCard
          label="Current Status"
          value={status.label}
          sub="Attendance status"
          Icon={Zap}
          accent="bg-primary/10 text-primary"
        />
        <StatCard
          label="Weekly Tasks"
          value={`${data?.weeklyTasksCompleted ?? 0} done`}
          sub={`${data?.weeklyTasksTotal ?? 0} total this week`}
          Icon={BarChart2}
          accent="bg-orange-500/10 text-orange-400"
        />
      </div>

      {/* Daily progress bar */}
      {(data?.dailyTasksTotal ?? 0) > 0 && (
        <div className="card">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-white">Daily Task Progress</span>
            <span className="text-primary font-mono text-sm">
              {data.dailyTasksCompleted}/{data.dailyTasksTotal}
            </span>
          </div>
          <div className="h-2 bg-border rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-500"
              style={{ width: `${Math.round((data.dailyTasksCompleted / data.dailyTasksTotal) * 100)}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

import { useState, useEffect } from 'react';
import api from '../utils/axios';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Clock, Coffee, RotateCcw, TrendingUp } from 'lucide-react';

function StatCard({ label, value, Icon, color }) {
  return (
    <div className="card flex items-start gap-4">
      <div className={`p-2.5 rounded-lg ${color}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-muted text-xs font-mono uppercase tracking-widest mb-1">{label}</p>
        <p className="text-white text-xl font-bold font-mono">{value}</p>
      </div>
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border rounded-lg px-3 py-2 text-xs">
      <p className="text-white font-medium mb-1">{label}</p>
      {payload.map(p => (
        <p key={p.dataKey} style={{ color: p.color }}>
          {p.name}: {p.value}m
        </p>
      ))}
    </div>
  );
};

export default function Analytics() {
  const [today, setToday]   = useState(null);
  const [weekly, setWeekly] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.get('/analytics/today'), api.get('/analytics/weekly')])
      .then(([t, w]) => { setToday(t.data); setWeekly(w.data); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const chartData = weekly?.dailyBreakdown?.map(d => ({
    date: new Date(d.date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short' }),
    Study: d.studyMinutes,
    Break: d.breakMinutes,
  })) ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Analytics</h1>
        <p className="text-muted text-sm mt-1">Your productivity metrics</p>
      </div>

      {/* Today */}
      <div>
        <h2 className="text-sm font-mono uppercase tracking-widest text-muted mb-3">Today</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard label="Study Time"   value={today?.studyFormatted ?? '0m'} Icon={Clock}      color="bg-primary/10 text-primary" />
          <StatCard label="Break Time"   value={today?.breakFormatted ?? '0m'} Icon={Coffee}     color="bg-yellow-500/10 text-yellow-400" />
          <StatCard label="Breaks Taken" value={today?.breakCount ?? 0}        Icon={RotateCcw}  color="bg-blue-500/10 text-blue-400" />
          <StatCard
            label="Tasks Done"
            value={`${today?.dailyTasksCompleted ?? 0}/${today?.dailyTasksTotal ?? 0}`}
            Icon={TrendingUp} color="bg-purple-500/10 text-purple-400"
          />
        </div>
      </div>

      {/* Join/leave times */}
      {(today?.latestJoinTime || today?.latestLeaveTime) && (
        <div className="card flex gap-8">
          {today.latestJoinTime && (
            <div>
              <p className="text-muted text-xs font-mono uppercase tracking-widest">Latest Join</p>
              <p className="text-white font-mono text-lg mt-1">
                {new Date(today.latestJoinTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          )}
          {today.latestLeaveTime && (
            <div>
              <p className="text-muted text-xs font-mono uppercase tracking-widest">Latest Leave</p>
              <p className="text-white font-mono text-lg mt-1">
                {new Date(today.latestLeaveTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Weekly chart */}
      <div className="card">
        <h2 className="text-sm font-mono uppercase tracking-widest text-muted mb-4">This Week</h2>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} barGap={4}>
              <XAxis dataKey="date" tick={{ fill: '#8B949E', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#8B949E', fontSize: 11 }} axisLine={false} tickLine={false} unit="m" width={36} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
              <Legend wrapperStyle={{ fontSize: 12, color: '#8B949E' }} />
              <Bar dataKey="Study" fill="#22C55E" radius={[3, 3, 0, 0]} />
              <Bar dataKey="Break" fill="#EAB308" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Weekly summary */}
      {weekly && (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
          <div className="card text-center">
            <p className="text-muted text-xs font-mono uppercase tracking-widest mb-2">Total Study</p>
            <p className="text-primary text-xl font-bold font-mono">
              {Math.floor(weekly.totalStudyMinutes / 60)}h {weekly.totalStudyMinutes % 60}m
            </p>
          </div>
          <div className="card text-center">
            <p className="text-muted text-xs font-mono uppercase tracking-widest mb-2">Weekly Tasks</p>
            <p className="text-white text-xl font-bold font-mono">
              {weekly.weeklyTasksCompleted}/{weekly.weeklyTasksTotal}
            </p>
          </div>
          <div className="card text-center col-span-2 lg:col-span-1">
            <p className="text-muted text-xs font-mono uppercase tracking-widest mb-2">Weekly Progress</p>
            <p className="text-primary text-xl font-bold font-mono">{weekly.weeklyProgressPercent}%</p>
          </div>
        </div>
      )}
    </div>
  );
}

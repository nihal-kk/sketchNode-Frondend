import { useState, useEffect } from 'react';
import api from '../utils/axios';
import { Play, Pause, RotateCcw, Clock, Coffee, AlertCircle } from 'lucide-react';

const REASONS = ['Lunch', 'Tea', 'Phone', 'Family', 'Emergency', 'Internet', 'Other'];

function fmt(m) {
  const h = Math.floor(m / 60), min = Math.round(m % 60);
  if (h === 0) return `${min}m`;
  if (min === 0) return `${h}h`;
  return `${h}h ${min}m`;
}

function fmtTime(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

export default function Attendance() {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy]       = useState(false);
  const [reason, setReason]   = useState('Lunch');
  const [showLeave, setShowLeave] = useState(false);
  const [error, setError]     = useState('');

  const load = () =>
    api.get('/attendance/today').then(r => setData(r.data)).catch(console.error).finally(() => setLoading(false));

  useEffect(() => { load(); }, []);

  const act = async (endpoint, body) => {
    setError(''); setBusy(true);
    try {
      const r = await api.post(`/attendance/${endpoint}`, body);
      setData(r.data);
      setShowLeave(false);
    } catch (err) {
      setError(err.response?.data?.error || 'Action failed');
    } finally { setBusy(false); }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const status = data?.status ?? 'not_started';

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-white">Attendance</h1>
        <p className="text-muted text-sm mt-1">Track your work and break sessions</p>
      </div>

      {error && (
        <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-3 py-2.5 rounded-lg">
          <AlertCircle className="w-4 h-4" /> {error}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Study Time', value: fmt(data?.studyMinutes ?? 0), Icon: Clock, color: 'text-primary' },
          { label: 'Outside Time', value: fmt(data?.breakMinutes ?? 0), Icon: Coffee, color: 'text-yellow-400' },
          { label: 'Breaks', value: data?.breakCount ?? 0, Icon: RotateCcw, color: 'text-blue-400' },
        ].map(({ label, value, Icon, color }) => (
          <div key={label} className="card text-center">
            <Icon className={`w-5 h-5 ${color} mx-auto mb-2`} />
            <p className={`text-xl font-bold font-mono ${color}`}>{value}</p>
            <p className="text-muted text-xs mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Join time info */}
      {data?.latestJoinTime && (
        <div className="flex gap-4 text-sm text-muted font-mono">
          <span>Latest join: <span className="text-white">{fmtTime(data.latestJoinTime)}</span></span>
          {data.latestLeaveTime && (
            <span>Latest leave: <span className="text-white">{fmtTime(data.latestLeaveTime)}</span></span>
          )}
        </div>
      )}

      {/* Action panel */}
      <div className="card space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-white font-semibold">Current Status</span>
          <span className={
            status === 'working'     ? 'badge-working' :
            status === 'on_break'    ? 'badge-break'   : 'badge-idle'
          }>
            {status === 'working' ? 'Working' : status === 'on_break' ? 'On Break' : 'Not Started'}
          </span>
        </div>

        {/* JOIN */}
        {status === 'not_started' && (
          <button onClick={() => act('join')} disabled={busy}
            className="btn-primary w-full py-3 flex items-center justify-center gap-2 text-base">
            <Play className="w-5 h-5" /> Join Work
          </button>
        )}

        {/* LEAVE */}
        {status === 'working' && !showLeave && (
          <button onClick={() => setShowLeave(true)} disabled={busy}
            className="btn-secondary w-full py-3 flex items-center justify-center gap-2 text-base border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10">
            <Pause className="w-5 h-5" /> Take a Break
          </button>
        )}

        {/* Leave form */}
        {status === 'working' && showLeave && (
          <div className="space-y-3 border border-yellow-500/20 rounded-lg p-4">
            <p className="text-sm text-white font-medium">Select reason for leaving</p>
            <select value={reason} onChange={e => setReason(e.target.value)} className="input">
              {REASONS.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
            <div className="flex gap-2">
              <button onClick={() => act('leave', { reason })} disabled={busy}
                className="flex-1 py-2 bg-yellow-500 text-black rounded-lg font-semibold text-sm hover:bg-yellow-400 transition-colors">
                Confirm Leave
              </button>
              <button onClick={() => setShowLeave(false)} className="px-4 py-2 btn-secondary text-sm rounded-lg">
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* REJOIN */}
        {status === 'on_break' && (
          <button onClick={() => act('rejoin')} disabled={busy}
            className="btn-primary w-full py-3 flex items-center justify-center gap-2 text-base">
            <RotateCcw className="w-5 h-5" /> Join Again
          </button>
        )}
      </div>

      {/* Break history */}
      {(data?.breaks?.length ?? 0) > 0 && (
        <div className="card space-y-2">
          <h3 className="text-white font-semibold text-sm mb-3">Break History</h3>
          {data.breaks.map((b, i) => (
            <div key={i} className="flex items-center justify-between py-2 border-b border-border last:border-0">
              <div className="flex items-center gap-2">
                <span className="badge-break">{b.reason}</span>
                <span className="text-muted text-xs font-mono">{fmtTime(b.leaveTime)}</span>
                {b.returnTime && <span className="text-muted text-xs font-mono">→ {fmtTime(b.returnTime)}</span>}
              </div>
              {!b.returnTime && <span className="text-yellow-400 text-xs font-mono">ongoing</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

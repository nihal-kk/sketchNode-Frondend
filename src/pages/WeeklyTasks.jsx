import { useState, useEffect } from 'react';
import api from '../utils/axios';
import { Plus, Trash2, Check, AlertCircle, ChevronDown, ChevronRight } from 'lucide-react';

export default function WeeklyTasks() {
  const [tasks, setTasks]   = useState([]);
  const [input, setInput]   = useState('');
  const [week, setWeek]     = useState(1);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy]     = useState(false);
  const [error, setError]   = useState('');
  const [collapsed, setCollapsed] = useState({});

  useEffect(() => {
    api.get('/tasks/weekly').then(r => setTasks(r.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  const addTask = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    setBusy(true); setError('');
    try {
      const r = await api.post('/tasks/weekly', { title: input.trim(), weekNumber: week });
      setTasks(t => [...t, r.data]);
      setInput('');
    } catch (err) { setError(err.response?.data?.error || 'Failed'); }
    finally { setBusy(false); }
  };

  const toggle = async (id) => {
    const prev = tasks;
    setTasks(t => t.map(x => x.id === id ? { ...x, completed: !x.completed } : x));
    try { await api.patch(`/tasks/weekly/${id}/toggle`); }
    catch { setTasks(prev); }
  };

  const remove = async (id) => {
    const prev = tasks;
    setTasks(t => t.filter(x => x.id !== id));
    try { await api.delete(`/tasks/weekly/${id}`); }
    catch { setTasks(prev); }
  };

  // Group by weekNumber
  const groups = tasks.reduce((acc, t) => {
    const w = t.weekNumber;
    if (!acc[w]) acc[w] = [];
    acc[w].push(t);
    return acc;
  }, {});
  const weeks = Object.keys(groups).map(Number).sort((a, b) => a - b);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-white">Weekly Tasks</h1>
        <p className="text-muted text-sm mt-1">Track your progress week by week</p>
      </div>

      {/* Add task */}
      <form onSubmit={addTask} className="card space-y-3">
        <p className="text-white text-sm font-medium">Add New Task</p>
        <input value={input} onChange={e => setInput(e.target.value)}
          placeholder="Task title..." className="input" disabled={busy} />
        <div className="flex items-center gap-2">
          <select value={week} onChange={e => setWeek(Number(e.target.value))} className="input w-auto">
            {Array.from({ length: 12 }, (_, i) => i + 1).map(n => (
              <option key={n} value={n}>Week {n}</option>
            ))}
          </select>
          <button type="submit" disabled={busy || !input.trim()} className="btn-primary flex items-center gap-1 px-4">
            <Plus className="w-4 h-4" /> Add
          </button>
        </div>
        {error && (
          <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-3 py-2 rounded-lg">
            <AlertCircle className="w-4 h-4" /> {error}
          </div>
        )}
      </form>

      {/* Week groups */}
      {weeks.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-muted text-sm">No tasks yet. Add your first weekly task above.</p>
        </div>
      ) : (
        weeks.map(w => {
          const wTasks = groups[w];
          const done   = wTasks.filter(t => t.completed).length;
          const pct    = Math.round((done / wTasks.length) * 100);
          const open   = !collapsed[w];
          return (
            <div key={w} className="card space-y-3">
              {/* Week header */}
              <button onClick={() => setCollapsed(c => ({ ...c, [w]: !c[w] }))}
                className="w-full flex items-center justify-between group">
                <div className="flex items-center gap-2">
                  {open ? <ChevronDown className="w-4 h-4 text-muted" /> : <ChevronRight className="w-4 h-4 text-muted" />}
                  <span className="text-white font-semibold">Week {w}</span>
                  <span className="text-muted text-xs font-mono ml-1">{done}/{wTasks.length}</span>
                </div>
                <span className={`font-mono text-sm font-bold ${pct === 100 ? 'text-primary' : 'text-white'}`}>{pct}%</span>
              </button>

              {/* Progress bar */}
              <div className="h-1.5 bg-border rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-500"
                  style={{ width: `${pct}%` }}
                />
              </div>

              {/* Task list */}
              {open && (
                <div className="space-y-1.5 pt-1">
                  {wTasks.map(task => (
                    <div key={task.id}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg border transition-all ${
                        task.completed ? 'bg-primary/5 border-primary/20' : 'bg-[#0D1117] border-border'
                      }`}
                    >
                      <button onClick={() => toggle(task.id)}
                        className={`w-5 h-5 rounded flex-shrink-0 border-2 flex items-center justify-center transition-all ${
                          task.completed ? 'bg-primary border-primary' : 'border-muted hover:border-primary'
                        }`}
                      >
                        {task.completed && <Check className="w-3 h-3 text-black" strokeWidth={3} />}
                      </button>
                      <span className={`flex-1 text-sm ${task.completed ? 'line-through text-muted' : 'text-white'}`}>
                        {task.title}
                      </span>
                      <button onClick={() => remove(task.id)}
                        className="text-muted hover:text-red-400 transition-colors p-1">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}

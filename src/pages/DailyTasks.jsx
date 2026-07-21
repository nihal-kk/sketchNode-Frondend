import { useState, useEffect } from 'react';
import api from '../utils/axios';
import { Plus, Trash2, Check, AlertCircle } from 'lucide-react';

export default function DailyTasks() {
  const [tasks, setTasks]   = useState([]);
  const [input, setInput]   = useState('');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy]     = useState(false);
  const [error, setError]   = useState('');

  useEffect(() => {
    api.get('/tasks/daily').then(r => setTasks(r.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  const addTask = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    setBusy(true); setError('');
    try {
      const r = await api.post('/tasks/daily', { title: input.trim() });
      setTasks(t => [...t, r.data]);
      setInput('');
    } catch (err) { setError(err.response?.data?.error || 'Failed'); }
    finally { setBusy(false); }
  };

  const toggle = async (id) => {
    const prev = tasks;
    setTasks(t => t.map(x => x.id === id ? { ...x, completed: !x.completed } : x));
    try { await api.patch(`/tasks/daily/${id}/toggle`); }
    catch { setTasks(prev); }
  };

  const remove = async (id) => {
    const prev = tasks;
    setTasks(t => t.filter(x => x.id !== id));
    try { await api.delete(`/tasks/daily/${id}`); }
    catch { setTasks(prev); }
  };

  const completed = tasks.filter(t => t.completed).length;

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Daily Tasks</h1>
          <p className="text-muted text-sm mt-1">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
        </div>
        {tasks.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-primary font-bold font-mono text-lg">{completed}</span>
            <span className="text-muted font-mono">/ {tasks.length}</span>
            <span className="text-muted text-sm">completed</span>
          </div>
        )}
      </div>

      {/* Progress bar */}
      {tasks.length > 0 && (
        <div>
          <div className="h-1.5 bg-border rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-500"
              style={{ width: `${tasks.length ? Math.round((completed / tasks.length) * 100) : 0}%` }}
            />
          </div>
          <p className="text-right text-xs text-muted font-mono mt-1">
            {tasks.length ? Math.round((completed / tasks.length) * 100) : 0}%
          </p>
        </div>
      )}

      {/* Add task */}
      <form onSubmit={addTask} className="flex gap-2">
        <input
          value={input} onChange={e => setInput(e.target.value)}
          placeholder="Add a new task..." className="input flex-1"
          disabled={busy}
        />
        <button type="submit" disabled={busy || !input.trim()} className="btn-primary px-4 flex items-center gap-1">
          <Plus className="w-4 h-4" /> Add
        </button>
      </form>

      {error && (
        <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-3 py-2 rounded-lg">
          <AlertCircle className="w-4 h-4" /> {error}
        </div>
      )}

      {/* Task list */}
      <div className="space-y-2">
        {tasks.length === 0 && (
          <div className="card text-center py-12">
            <Check className="w-10 h-10 text-border mx-auto mb-3" />
            <p className="text-muted text-sm">No tasks yet. Add your first task above.</p>
          </div>
        )}
        {tasks.map(task => (
          <div key={task.id}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg border transition-all duration-200 ${
              task.completed ? 'bg-primary/5 border-primary/20' : 'bg-card border-border hover:border-border/80'
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
              className="text-muted hover:text-red-400 transition-colors p-1 rounded">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

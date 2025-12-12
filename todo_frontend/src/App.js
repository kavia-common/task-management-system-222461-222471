import React, { useEffect, useMemo, useState } from 'react';
import './App.css';
import { TasksAPI, getApiBaseUrl } from './api';

/**
 * Minimal, modern To-Do app UI wired to backend.
 * Features:
 * - List tasks
 * - Add new task
 * - Edit task title
 * - Toggle complete
 * - Delete task
 * - Loading and error states
 * - Theme toggle
 */

// PUBLIC_INTERFACE
function App() {
  const [theme, setTheme] = useState('light');
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');
  const [actionError, setActionError] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editingValue, setEditingValue] = useState('');
  const apiBase = useMemo(() => getApiBaseUrl(), []);

  // Apply theme to document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Load tasks
  useEffect(() => {
    let active = true;
    setLoading(true);
    setFetchError('');
    TasksAPI.list()
      .then((data) => {
        if (!active) return;
        // Expecting array of tasks: { id, title, completed }
        setTasks(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        if (!active) return;
        setFetchError(err?.message || 'Failed to load tasks.');
      })
      .finally(() => {
        if (!active) return;
        setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  // PUBLIC_INTERFACE
  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const resetActionError = () => setActionError('');

  const handleAdd = async (e) => {
    e.preventDefault();
    resetActionError();
    const title = newTitle.trim();
    if (!title) return;

    try {
      const created = await TasksAPI.create({ title });
      // optimistic merge
      setTasks((prev) => [created, ...prev]);
      setNewTitle('');
    } catch (err) {
      setActionError(err?.message || 'Failed to add task.');
    }
  };

  const startEdit = (task) => {
    setEditingId(task.id);
    setEditingValue(task.title);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingValue('');
  };

  const saveEdit = async (id) => {
    resetActionError();
    const title = editingValue.trim();
    if (!title) {
      setActionError('Title cannot be empty.');
      return;
    }
    try {
      const updated = await TasksAPI.update(id, { title });
      setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)));
      cancelEdit();
    } catch (err) {
      setActionError(err?.message || 'Failed to update task.');
    }
  };

  const toggleComplete = async (task) => {
    resetActionError();
    try {
      const updated = await TasksAPI.toggle(task.id, !task.completed);
      setTasks((prev) => prev.map((t) => (t.id === task.id ? updated : t)));
    } catch (err) {
      setActionError(err?.message || 'Failed to toggle task.');
    }
  };

  const deleteTask = async (id) => {
    resetActionError();
    try {
      await TasksAPI.remove(id);
      setTasks((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      setActionError(err?.message || 'Failed to delete task.');
    }
  };

  return (
    <div className="App">
      <header className="App-header" style={{ minHeight: 'auto', paddingTop: 80, paddingBottom: 60 }}>
        <button
          className="theme-toggle"
          onClick={toggleTheme}
          aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
          {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
        </button>

        <div style={{ maxWidth: 720, width: '100%', padding: 16 }}>
          <h1 style={{ margin: 0, color: 'var(--text-primary)' }}>To-Do List</h1>
          <p className="App-link" style={{ marginTop: 4 }}>
            API: {apiBase}
          </p>

          {/* Add Form */}
          <form onSubmit={handleAdd} style={styles.card}>
            <div style={{ display: 'flex', gap: 8, width: '100%' }}>
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Add a new task..."
                aria-label="New task title"
                style={styles.input}
              />
              <button type="submit" style={styles.primaryBtn} disabled={!newTitle.trim()}>
                Add
              </button>
            </div>
          </form>

          {/* Error states */}
          {fetchError && <div role="alert" style={styles.error}>{fetchError}</div>}
          {actionError && <div role="alert" style={styles.error}>{actionError}</div>}
          {loading && <div style={styles.info}>Loading tasks...</div>}

          {/* Task List */}
          {!loading && !fetchError && (
            <ul style={{ listStyle: 'none', padding: 0, marginTop: 16, display: 'grid', gap: 12 }}>
              {tasks.length === 0 && (
                <li style={styles.card}>
                  <span style={{ color: 'var(--text-primary)' }}>No tasks yet. Create your first one above.</span>
                </li>
              )}
              {tasks.map((task) => (
                <li key={task.id} style={{ ...styles.card, display: 'flex', alignItems: 'center', gap: 12 }}>
                  <button
                    onClick={() => toggleComplete(task)}
                    aria-label={task.completed ? 'Mark as incomplete' : 'Mark as complete'}
                    title="Toggle completion"
                    style={styles.checkbox(task.completed)}
                  >
                    {task.completed ? '✓' : ''}
                  </button>

                  {editingId === task.id ? (
                    <input
                      autoFocus
                      value={editingValue}
                      onChange={(e) => setEditingValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') saveEdit(task.id);
                        if (e.key === 'Escape') cancelEdit();
                      }}
                      style={{ ...styles.input, margin: 0 }}
                    />
                  ) : (
                    <span
                      style={{
                        flex: 1,
                        color: 'var(--text-primary)',
                        textDecoration: task.completed ? 'line-through' : 'none',
                        opacity: task.completed ? 0.7 : 1,
                      }}
                    >
                      {task.title}
                    </span>
                  )}

                  {editingId === task.id ? (
                    <>
                      <button onClick={() => saveEdit(task.id)} style={styles.primaryBtn}>
                        Save
                      </button>
                      <button onClick={cancelEdit} style={styles.ghostBtn}>
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => startEdit(task)} style={styles.ghostBtn}>
                        Edit
                      </button>
                      <button onClick={() => deleteTask(task.id)} style={styles.dangerBtn}>
                        Delete
                      </button>
                    </>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </header>
    </div>
  );
}

const styles = {
  card: {
    background: 'var(--bg-primary)',
    border: '1px solid var(--border-color)',
    borderRadius: 12,
    padding: 12,
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
  },
  input: {
    flex: 1,
    padding: '10px 12px',
    borderRadius: 8,
    border: '1px solid var(--border-color)',
    outline: 'none',
    background: 'var(--bg-primary)',
    color: 'var(--text-primary)',
  },
  primaryBtn: {
    padding: '10px 14px',
    borderRadius: 8,
    border: 'none',
    background: 'var(--button-bg)',
    color: 'var(--button-text)',
    cursor: 'pointer',
    fontWeight: 600,
  },
  ghostBtn: {
    padding: '8px 12px',
    borderRadius: 8,
    border: '1px solid var(--border-color)',
    background: 'transparent',
    color: 'var(--text-primary)',
    cursor: 'pointer',
  },
  dangerBtn: {
    padding: '8px 12px',
    borderRadius: 8,
    border: '1px solid #ef4444',
    background: 'transparent',
    color: '#ef4444',
    cursor: 'pointer',
  },
  checkbox: (checked) => ({
    width: 28,
    height: 28,
    borderRadius: 6,
    border: `2px solid ${checked ? '#22c55e' : 'var(--border-color)'}`,
    color: '#22c55e',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 800,
    background: checked ? 'rgba(34,197,94,0.1)' : 'transparent',
    cursor: 'pointer',
  }),
  error: {
    marginTop: 8,
    color: '#EF4444',
    background: 'rgba(239,68,68,0.08)',
    border: '1px solid rgba(239,68,68,0.35)',
    padding: '8px 12px',
    borderRadius: 8,
  },
  info: {
    marginTop: 8,
    color: 'var(--text-primary)',
    opacity: 0.8,
  },
};

export default App;

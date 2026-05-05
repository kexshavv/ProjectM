'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useParams, useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';

export default function ProjectBoard() {
  const { data: session, status } = useSession();
  const { id } = useParams();
  const router = useRouter();

  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // New task modal
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', description: '', status: 'Todo', assignedTo: '', dueDate: '' });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated') {
      fetchData();
    }
  }, [status, id]);

  const fetchData = async () => {
    try {
      const [projRes, tasksRes, usersRes] = await Promise.all([
        fetch(`/api/projects/${id}`),
        fetch(`/api/projects/${id}/tasks`),
        fetch('/api/users')
      ]);

      if (projRes.ok) setProject(await projRes.json());
      if (tasksRes.ok) setTasks(await tasksRes.json());
      if (usersRes.ok) setUsers(await usersRes.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/projects/${id}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTask),
      });

      if (res.ok) {
        setShowTaskModal(false);
        setNewTask({ title: '', description: '', status: 'Todo', assignedTo: '', dueDate: '' });
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const updateTaskStatus = async (taskId, newStatus) => {
    // Optimistic UI update
    const previousTasks = [...tasks];
    setTasks(tasks.map(t => t._id === taskId ? { ...t, status: newStatus } : t));

    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) {
        // revert on failure
        setTasks(previousTasks);
        alert("Failed to update status. You might not have permission.");
      }
    } catch (err) {
      setTasks(previousTasks);
    }
  };

  // Drag and Drop handlers
  const handleDragStart = (e, taskId) => {
    e.dataTransfer.setData('taskId', taskId);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, newStatus) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('taskId');
    const task = tasks.find(t => t._id === taskId);
    
    // Check permission: Admin can move any task, Member can only move their own task
    if (task && task.status !== newStatus) {
      if (session?.user?.role === 'Admin' || task.assignedTo?._id === session?.user?.id) {
        updateTaskStatus(taskId, newStatus);
      } else {
        alert("You can only move tasks assigned to you.");
      }
    }
  };

  if (status === 'loading' || loading) {
    return (
      <>
        <Navbar />
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '4rem' }}>
          <div className="spinner"></div>
        </div>
      </>
    );
  }

  if (!project) {
    return (
      <>
        <Navbar />
        <div className="container" style={{ marginTop: '2rem' }}>
          <div className="alert alert-error">Project not found or you don't have access.</div>
        </div>
      </>
    );
  }

  const columns = ['Todo', 'In Progress', 'Done'];

  return (
    <>
      <Navbar />
      <main className="container" style={{ padding: '2rem 1.5rem', display: 'flex', flexDirection: 'column', height: 'calc(100vh - 70px)' }}>
        <div className="page-header" style={{ flexShrink: 0 }}>
          <div>
            <h1>{project.name}</h1>
            <p>{project.description}</p>
          </div>
          {session?.user?.role === 'Admin' && (
            <button className="btn btn-primary" onClick={() => setShowTaskModal(true)}>
              + Add Task
            </button>
          )}
        </div>

        <div className="kanban-board" style={{ flexGrow: 1 }}>
          {columns.map(col => (
            <div 
              key={col} 
              className="kanban-column glass-panel"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, col)}
            >
              <div className="kanban-header">
                {col}
                <span className="badge" style={{ background: 'rgba(255,255,255,0.1)' }}>
                  {tasks.filter(t => t.status === col).length}
                </span>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', overflowY: 'auto', flexGrow: 1, paddingRight: '0.5rem' }}>
                {tasks.filter(t => t.status === col).map(task => (
                  <div 
                    key={task._id} 
                    className="task-card"
                    draggable={(session?.user?.role === 'Admin' || task.assignedTo?._id === session?.user?.id)}
                    onDragStart={(e) => handleDragStart(e, task._id)}
                  >
                    <h4 style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>{task.title}</h4>
                    {task.description && (
                      <p style={{ fontSize: '0.875rem', marginBottom: '1rem' }}>{task.description}</p>
                    )}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                      {task.assignedTo ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'var(--accent)', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '10px', fontWeight: 'bold' }}>
                            {task.assignedTo.name.charAt(0)}
                          </div>
                          <span style={{ fontSize: '0.75rem' }}>{task.assignedTo.name}</span>
                        </div>
                      ) : (
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Unassigned</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Create Task Modal */}
        {showTaskModal && (
          <div className="modal-overlay" onClick={() => setShowTaskModal(false)}>
            <div className="modal-content glass-panel" onClick={(e) => e.stopPropagation()}>
              <h2>Create New Task</h2>
              <form onSubmit={handleCreateTask} style={{ marginTop: '1.5rem' }}>
                <div className="form-group">
                  <label className="form-label">Task Title</label>
                  <input
                    type="text"
                    className="form-input"
                    value={newTask.title}
                    onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea
                    className="form-textarea"
                    rows="3"
                    value={newTask.description}
                    onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  ></textarea>
                </div>
                <div className="form-group">
                  <label className="form-label">Assign To</label>
                  <select 
                    className="form-select"
                    value={newTask.assignedTo}
                    onChange={(e) => setNewTask({ ...newTask, assignedTo: e.target.value })}
                  >
                    <option value="">Unassigned</option>
                    {users.map(u => (
                      <option key={u._id} value={u._id}>{u.name} ({u.role})</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Due Date</label>
                  <input
                    type="date"
                    className="form-input"
                    value={newTask.dueDate}
                    onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                  />
                </div>
                <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                  <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setShowTaskModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                    Create
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Link from 'next/link';

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated') {
      fetchDashboardData();
    }
  }, [status, router]);

  const fetchDashboardData = async () => {
    try {
      const res = await fetch('/api/dashboard');
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
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

  if (!session || !data) return null;

  return (
    <>
      <Navbar />
      <main className="container" style={{ padding: '2rem 1.5rem' }}>
        <div className="page-header">
          <div>
            <h1>Dashboard</h1>
            <p>Welcome back, {session.user.name}</p>
          </div>
          {session.user.role === 'Admin' && (
            <Link href="/projects">
              <button className="btn btn-primary">Manage Projects</button>
            </Link>
          )}
        </div>

        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
          <div className="card glass-panel">
            <h3 style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>Total Projects</h3>
            <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--accent)' }}>
              {data.stats.totalProjects}
            </div>
          </div>
          <div className="card glass-panel">
            <h3 style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>Pending Tasks</h3>
            <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--warning)' }}>
              {data.stats.pendingTasks}
            </div>
          </div>
          <div className="card glass-panel">
            <h3 style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>Completed Tasks</h3>
            <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--success)' }}>
              {data.stats.completedTasks}
            </div>
          </div>
          <div className="card glass-panel" style={{ border: '1px solid var(--danger)' }}>
            <h3 style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>Overdue Tasks</h3>
            <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--danger)' }}>
              {data.stats.overdueTasks}
            </div>
          </div>
        </div>

        <h2 style={{ marginTop: '3rem' }}>Upcoming Tasks</h2>
        {data.upcomingTasks.length === 0 ? (
          <p className="glass-panel" style={{ padding: '2rem', textAlign: 'center' }}>No upcoming tasks. You're all caught up!</p>
        ) : (
          <div className="grid grid-cols-2">
            {data.upcomingTasks.map((task) => (
              <div key={task._id} className="card glass-panel">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <h4>{task.title}</h4>
                  <span className={`badge badge-${task.status.toLowerCase().replace(' ', '-')}`}>
                    {task.status}
                  </span>
                </div>
                <p style={{ fontSize: '0.875rem', marginBottom: '1rem' }}>Project: {task.project?.name}</p>
                {task.dueDate && (
                  <p style={{ 
                    fontSize: '0.875rem', 
                    color: new Date(task.dueDate) < new Date() ? 'var(--danger)' : 'var(--warning)',
                    fontWeight: new Date(task.dueDate) < new Date() ? 'bold' : 'normal'
                  }}>
                    {new Date(task.dueDate) < new Date() ? 'Overdue: ' : 'Due: '}
                    {new Date(task.dueDate).toLocaleDateString()}
                  </p>
                )}
                <div style={{ marginTop: '1rem' }}>
                  <Link href={`/projects/${task.project?._id}`}>
                    <button className="btn btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>View Board</button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </>
  );
}

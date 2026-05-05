'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();

  if (!session) return null;

  return (
    <nav className="navbar">
      <div className="container">
        <Link href="/dashboard" className="nav-link" style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>
          ProjectM
        </Link>
        <div className="nav-links">
          <Link href="/dashboard" className={`nav-link ${pathname === '/dashboard' ? 'active' : ''}`}>
            Dashboard
          </Link>
          <Link href="/projects" className={`nav-link ${pathname === '/projects' ? 'active' : ''}`}>
            Projects
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginLeft: '2rem', borderLeft: '1px solid var(--border)', paddingLeft: '2rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
              <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>{session.user.name}</span>
              <span className={`badge badge-${session.user.role.toLowerCase()}`} style={{ fontSize: '0.7rem' }}>
                {session.user.role}
              </span>
            </div>
            <button onClick={() => signOut({ callbackUrl: '/login' })} className="btn btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

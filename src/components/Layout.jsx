import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Layout({ children }) {
  const { user, signOut } = useAuth();
  const location = useLocation();

  const categories = [
    { name: 'Sorting', path: '/sorting', icon: '123' },
    { name: 'Searching', path: '/searching', icon: '?' },
    { name: 'Graph', path: '/graph', icon: 'G' },
    { name: 'Linked List', path: '/linkedlist', icon: 'L' },
  ];

  return (
    <div className="app-container">
      <header className="header">
        <Link to="/" className="header-logo">
          <span>AlgoViz</span>
        </Link>
        <nav className="header-nav">
          {user ? (
            <>
              <Link to="/dashboard" className="nav-link">
                Dashboard
              </Link>
              <button onClick={signOut} className="btn btn-outline btn-sm">
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-link">
                Sign In
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm">
                Get Started
              </Link>
            </>
          )}
        </nav>
      </header>
      <main className="main-content">
        {location.pathname !== '/' && location.pathname !== '/login' && location.pathname !== '/register' && (
          <aside className="sidebar">
            {categories.map((category) => (
              <div key={category.path} className="sidebar-section">
                <h3 className="sidebar-title">{category.name}</h3>
                <Link to={category.path} className="sidebar-link">
                  View All {category.name} Algorithms
                </Link>
              </div>
            ))}
          </aside>
        )}
        <div className="content-area">
          {children}
        </div>
      </main>
    </div>
  );
}
    
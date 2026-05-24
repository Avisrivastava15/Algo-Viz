import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Home() {
  const { user } = useAuth();

  const categories = [
    {
      name: 'Sorting Algorithms',
      path: '/sorting',
      icon: '123',
      description: 'Visualize sorting algorithms like Bubble Sort, Quick Sort, Merge Sort, and more.',
      count: 6
    },
    {
      name: 'Searching Algorithms',
      path: '/searching',
      icon: '?',
      description: 'Learn Binary Search, Linear Search and understand their time complexities.',
      count: 2
    },
    {
      name: 'Graph Algorithms',
      path: '/graph',
      icon: 'G',
      description: 'Explore BFS, DFS, Dijkstra, and Topological Sort with interactive graphs.',
      count: 4
    },
    {
      name: 'Linked List Operations',
      path: '/linkedlist',
      icon: 'L',
      description: 'Master linked list traversal, insertion, deletion, and reversal visually.',
      count: 4
    },
  ];

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <section className="hero-section">
        <h1 className="hero-title">Master Data Structures & Algorithms</h1>
        <p className="hero-subtitle">
          Learn algorithms visually with interactive animations. Understand how they work step by step, track your progress, and become a DSA expert.
        </p>
        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
          {user ? (
            <Link to="/dashboard" className="btn btn-primary btn-lg">
              Continue Learning
            </Link>
          ) : (
            <>
              <Link to="/register" className="btn btn-primary btn-lg">
                Get Started Free
              </Link>
              <Link to="/sorting" className="btn btn-outline btn-lg">
                Browse Algorithms
              </Link>
            </>
          )}
        </div>
      </section>

      <section style={{ marginTop: '48px' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '24px', textAlign: 'center' }}>
          Choose a Topic to Explore
        </h2>
        <div className="category-grid">
          {categories.map((cat) => (
            <Link key={cat.path} to={cat.path} className="category-card">
              <div className="category-icon">{cat.icon}</div>
              <h3 className="category-title">{cat.name}</h3>
              <p className="category-description">{cat.description}</p>
              <span className="category-count">{cat.count} algorithms</span>
            </Link>
          ))}
        </div>
      </section>

      <section style={{ marginTop: '64px', padding: '48px', background: 'var(--card-bg)', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '24px', textAlign: 'center' }}>
          Why Learn with AlgoViz?
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '32px' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', marginBottom: '12px' }}>1</div>
            <h3 style={{ fontWeight: '600', marginBottom: '8px' }}>Visual Learning</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
              See algorithms in action with step-by-step animations
            </p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', marginBottom: '12px' }}>2</div>
            <h3 style={{ fontWeight: '600', marginBottom: '8px' }}>Custom Input</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
              Use your own data or default examples to visualize
            </p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', marginBottom: '12px' }}>3</div>
            <h3 style={{ fontWeight: '600', marginBottom: '8px' }}>Track Progress</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
              Mark algorithms as completed and track your learning journey
            </p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', marginBottom: '12px' }}>4</div>
            <h3 style={{ fontWeight: '600', marginBottom: '8px' }}>In-depth Articles</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
              Detailed explanations with code examples and analysis
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

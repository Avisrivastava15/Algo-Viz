import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

export default function Dashboard() {
  const { user } = useAuth();
  const [topics, setTopics] = useState([]);
  const [progress, setProgress] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    try {
      const [topicsRes, progressRes] = await Promise.all([
        supabase.from('algorithm_topics').select('*').order('category').order('order_index'),
        user ? supabase.from('user_progress').select('*').eq('user_id', user.id) : { data: [] }
      ]);

      setTopics(topicsRes.data || []);
      setProgress(progressRes.data || []);
    } catch (err) {
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  const getProgress = (topicId) => {
    return progress.find(p => p.topic_id === topicId);
  };

  const getCategoryStats = (category) => {
    const categoryTopics = topics.filter(t => t.category === category);
    const completed = categoryTopics.filter(t => getProgress(t.id)?.completed).length;
    return { total: categoryTopics.length, completed };
  };

  const totalCompleted = progress.filter(p => p.completed).length;
  const totalTopics = topics.length;

  const categories = [
    { name: 'sorting', title: 'Sorting Algorithms', path: '/sorting', icon: '123' },
    { name: 'searching', title: 'Searching Algorithms', path: '/searching', icon: '?' },
    { name: 'graph', title: 'Graph Algorithms', path: '/graph', icon: 'G' },
    { name: 'linkedlist', title: 'Linked List Operations', path: '/linkedlist', icon: 'L' },
  ];

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '48px' }}>Loading...</div>;
  }

  return (
    <div>
      <h1 className="visualizer-title">Your Progress</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '32px' }}>
        Welcome back! Continue learning where you left off.
      </p>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{totalCompleted}</div>
          <div className="stat-label">Completed</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{totalTopics - totalCompleted}</div>
          <div className="stat-label">Remaining</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{totalTopics > 0 ? Math.round((totalCompleted / totalTopics) * 100) : 0}%</div>
          <div className="stat-label">Progress</div>
        </div>
      </div>

      {categories.map((cat) => {
        const stats = getCategoryStats(cat.name);
        return (
          <div key={cat.name} style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: '600' }}>{cat.title}</h2>
              <Link to={cat.path} className="btn btn-outline btn-sm">View All</Link>
            </div>
            <div className="progress-bar-container" style={{ marginBottom: '8px' }}>
              <div className="progress-bar" style={{ width: `${stats.total > 0 ? (stats.completed / stats.total) * 100 : 0}%` }}></div>
            </div>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              {stats.completed} of {stats.total} completed
            </p>
          </div>
        );
      })}

      <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginTop: '32px', marginBottom: '16px' }}>All Topics</h2>
      <div className="progress-grid">
        {topics.map((topic) => {
          const topicProgress = getProgress(topic.id);
          const isCompleted = topicProgress?.completed;

          return (
            <div key={topic.id} className="progress-card">
              <div className="progress-card-header">
                <span className="progress-card-title">{topic.name}</span>
                <span className={`progress-card-badge badge-${topic.difficulty}`}>
                  {topic.difficulty}
                </span>
              </div>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                {topic.description}
              </p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Link to={`/${topic.category}/${topic.slug}`} className="btn btn-primary btn-sm">
                  Learn
                </Link>
                {isCompleted && (
                  <span className="completed-badge">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="20,6 9,17 4,12"></polyline>
                    </svg>
                    Completed
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

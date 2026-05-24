import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function GraphCategory() {
  const [topics, setTopics] = useState([]);

  useEffect(() => {
    loadTopics();
  }, []);

  const loadTopics = async () => {
    const { data } = await supabase
      .from('algorithm_topics')
      .select('*')
      .eq('category', 'graph')
      .order('order_index');
    setTopics(data || []);
  };

  return (
    <div>
      <h1 className="visualizer-title">Graph Algorithms</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '32px' }}>
        Explore graph traversal and pathfinding algorithms with interactive visualizations.
      </p>

      <div className="progress-grid">
        {topics.map((topic) => (
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
            <Link to={`/graph/${topic.slug}`} className="btn btn-primary btn-sm">
              Visualize
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}

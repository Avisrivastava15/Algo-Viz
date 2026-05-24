import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

export default function SortingCategory() {
  const { user } = useAuth();
  const [topics, setTopics] = useState([]);

  useEffect(() => {
    loadTopics();
  }, []);

  const loadTopics = async () => {
    const { data } = await supabase
      .from('algorithm_topics')
      .select('*')
      .eq('category', 'sorting')
      .order('order_index');
    setTopics(data || []);
  };

  return (
    <div>
      <h1 className="visualizer-title">Sorting Algorithms</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '32px' }}>
        Visualize how different sorting algorithms work step by step.
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
            <Link to={`/sorting/${topic.slug}`} className="btn btn-primary btn-sm">
              Visualize
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

const searchingAlgorithms = {
  'linear-search': {
    name: 'Linear Search',
    description: 'Linear Search sequentially checks each element of the array until a match is found. It works on both sorted and unsorted arrays.',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    bestCase: 'O(1)',
    code: `function linearSearch(arr, target) {
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] === target) {
      return i; // Found at index i
    }
  }
  return -1; // Not found
}`
  },
  'binary-search': {
    name: 'Binary Search',
    description: 'Binary Search efficiently finds an element in a sorted array by repeatedly dividing the search interval in half.',
    timeComplexity: 'O(log n)',
    spaceComplexity: 'O(1)',
    bestCase: 'O(1)',
    code: `function binarySearch(arr, target) {
  let left = 0;
  let right = arr.length - 1;

  while (left <= right) {
    const mid = Math.floor((left + right) / 2);

    if (arr[mid] === target) {
      return mid; // Found
    } else if (arr[mid] < target) {
      left = mid + 1; // Search right half
    } else {
      right = mid - 1; // Search left half
    }
  }

  return -1; // Not found
}`
  }
};

const defaultArray = [2, 5, 8, 12, 16, 23, 38, 45, 56, 72];

export default function SearchingVisualizer() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const algorithm = searchingAlgorithms[slug];

  const [array, setArray] = useState(defaultArray);
  const [customInput, setCustomInput] = useState('');
  const [searchTarget, setSearchTarget] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [highlightedRange, setHighlightedRange] = useState([-1, -1]);
  const [foundIndex, setFoundIndex] = useState(-1);
  const [speed, setSpeed] = useState(50);
  const [completed, setCompleted] = useState(false);
  const [topicId, setTopicId] = useState(null);
  const [showArticle, setShowArticle] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!algorithm) {
      navigate('/searching');
      return;
    }
    loadTopicId();
    resetArray();
  }, [slug]);

  const loadTopicId = async () => {
    const { data } = await supabase
      .from('algorithm_topics')
      .select('id')
      .eq('slug', slug)
      .maybeSingle();
    if (data) setTopicId(data.id);
  };

  const resetArray = () => {
    setArray(defaultArray);
    setCurrentIndex(-1);
    setHighlightedRange([-1, -1]);
    setFoundIndex(-1);
    setCompleted(false);
    setMessage('');
  };

  const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  const getDelay = () => Math.max(200, 1000 - speed * 8);

  const handleCustomInput = () => {
    const values = customInput.split(',').map(v => parseInt(v.trim())).filter(v => !isNaN(v)).sort((a, b) => a - b);
    if (values.length > 0) {
      setArray(values);
      setCurrentIndex(-1);
      setHighlightedRange([-1, -1]);
      setFoundIndex(-1);
      setCompleted(false);
    }
  };

  const linearSearch = async () => {
    const target = parseInt(searchTarget);
    if (isNaN(target)) return;
    setIsSearching(true);
    setMessage(`Searching for ${target}...`);

    for (let i = 0; i < array.length; i++) {
      setCurrentIndex(i);
      setMessage(`Checking index ${i}: value = ${array[i]}`);
      await sleep(getDelay());

      if (array[i] === target) {
        setFoundIndex(i);
        setMessage(`Found ${target} at index ${i}!`);
        setIsSearching(false);
        setCompleted(true);
        return;
      }
    }

    setMessage(`${target} not found in array`);
    setIsSearching(false);
    setCompleted(true);
  };

  const binarySearch = async () => {
    const target = parseInt(searchTarget);
    if (isNaN(target)) return;
    setIsSearching(true);
    setMessage(`Searching for ${target} in sorted array...`);

    let left = 0;
    let right = array.length - 1;

    while (left <= right) {
      const mid = Math.floor((left + right) / 2);
      setHighlightedRange([left, right]);
      setCurrentIndex(mid);
      setMessage(`Checking middle index ${mid}: value = ${array[mid]}`);
      await sleep(getDelay());

      if (array[mid] === target) {
        setFoundIndex(mid);
        setMessage(`Found ${target} at index ${mid}!`);
        setIsSearching(false);
        setCompleted(true);
        return;
      } else if (array[mid] < target) {
        setMessage(`${array[mid]} < ${target}, searching right half`);
        left = mid + 1;
      } else {
        setMessage(`${array[mid]} > ${target}, searching left half`);
        right = mid - 1;
      }
      await sleep(getDelay() / 2);
    }

    setMessage(`${target} not found in array`);
    setIsSearching(false);
    setCompleted(true);
  };

  const startSearch = async () => {
    if (isSearching) return;
    setCurrentIndex(-1);
    setHighlightedRange([-1, -1]);
    setFoundIndex(-1);

    if (slug === 'linear-search') {
      await linearSearch();
    } else if (slug === 'binary-search') {
      await binarySearch();
    }
  };

  const markAsCompleted = async () => {
    if (!user || !topicId) return;

    const { data: existing } = await supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', user.id)
      .eq('topic_id', topicId)
      .maybeSingle();

    if (existing) {
      await supabase
        .from('user_progress')
        .update({ completed: true, completed_at: new Date().toISOString() })
        .eq('id', existing.id);
    } else {
      await supabase
        .from('user_progress')
        .insert({
          user_id: user.id,
          topic_id: topicId,
          completed: true,
          completed_at: new Date().toISOString()
        });
    }

    alert('Progress saved!');
  };

  if (!algorithm) return null;

  return (
    <div className="visualizer-container">
      <div className="visualizer-header">
        <div>
          <h1 className="visualizer-title">{algorithm.name}</h1>
          <p style={{ color: 'var(--text-secondary)' }}>{algorithm.description}</p>
        </div>
        <button className="btn btn-outline" onClick={() => setShowArticle(true)}>
          View Article
        </button>
      </div>

      <div className="card">
        <div style={{ marginBottom: '16px', display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
          <input
            type="text"
            className="form-input"
            placeholder="Custom sorted values: 2,5,8,12"
            value={customInput}
            onChange={(e) => setCustomInput(e.target.value)}
            style={{ maxWidth: '200px' }}
          />
          <button className="btn btn-secondary" onClick={handleCustomInput} disabled={isSearching}>
            Apply
          </button>
          <button className="btn btn-secondary" onClick={resetArray} disabled={isSearching}>
            Reset
          </button>
        </div>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" style={{ marginRight: '8px' }}>Search for:</label>
            <input
              type="number"
              className="form-input"
              placeholder="Value"
              value={searchTarget}
              onChange={(e) => setSearchTarget(e.target.value)}
              style={{ width: '100px' }}
            />
          </div>
          <button
            className="btn btn-primary"
            onClick={startSearch}
            disabled={isSearching || !searchTarget}
          >
            {isSearching ? 'Searching...' : 'Search'}
          </button>

          <div className="speed-control">
            <span className="speed-label">Speed:</span>
            <input
              type="range"
              className="speed-slider"
              min="1"
              max="100"
              value={speed}
              onChange={(e) => setSpeed(parseInt(e.target.value))}
              disabled={isSearching}
            />
            <span className="speed-label">{speed}%</span>
          </div>
        </div>
      </div>

      <div className="visualizer-canvas" style={{ minHeight: '250px', alignItems: 'center' }}>
        {array.map((value, idx) => {
          let className = 'array-bar';
          if (foundIndex === idx) {
            className += ' sorted';
          } else if (currentIndex === idx) {
            className += ' comparing';
          } else if (slug === 'binary-search' && idx >= highlightedRange[0] && idx <= highlightedRange[1]) {
            className += ' current';
          }

          const width = Math.max(30, Math.min(60, 500 / array.length));

          return (
            <div key={idx} className={className} style={{ height: '200px', width: `${width}px` }}>
              <span className="array-bar-value" style={{ top: '-32px', fontSize: '0.875rem' }}>
                {value}
              </span>
            </div>
          );
        })}
        {foundIndex >= 0 && (
          <div style={{ position: 'absolute', bottom: '20px', left: '50%', transform: 'translateX(-50%)', background: 'var(--success-500)', color: 'white', padding: '4px 12px', borderRadius: '4px', fontSize: '0.75rem' }}>
            Found!
          </div>
        )}
      </div>

      {message && (
        <div className="card" style={{ marginTop: '16px' }}>
          <p style={{ fontWeight: '500', color: foundIndex >= 0 ? 'var(--success-500)' : 'var(--primary-600)' }}>
            {message}
          </p>
        </div>
      )}

      {completed && (
        <div className="card" style={{ marginTop: '16px', textAlign: 'center' }}>
          {user ? (
            <button className="btn btn-success" onClick={markAsCompleted}>
              Mark as Completed
            </button>
          ) : (
            <p style={{ color: 'var(--text-secondary)' }}>Sign in to save your progress</p>
          )}
        </div>
      )}

      {showArticle && (
        <div className="modal-overlay" onClick={() => setShowArticle(false)}>
          <div className="modal-content" style={{ maxWidth: '700px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">{algorithm.name} - Article</h2>
              <button className="modal-close" onClick={() => setShowArticle(false)}>×</button>
            </div>
            <div className="article-content">
              <p>{algorithm.description}</p>

              <h3>Time Complexity</h3>
              <ul>
                <li><strong>Worst Case:</strong> {algorithm.timeComplexity}</li>
                <li><strong>Best Case:</strong> {algorithm.bestCase}</li>
                <li><strong>Space:</strong> {algorithm.spaceComplexity}</li>
              </ul>

              <h3>When to Use</h3>
              <ul>
                {slug === 'linear-search' && (
                  <>
                    <li>Small or unsorted arrays</li>
                    <li>When sorting is not feasible</li>
                    <li>Simple implementation needed</li>
                  </>
                )}
                {slug === 'binary-search' && (
                  <>
                    <li>Large sorted arrays</li>
                    <li>Frequent search operations</li>
                    <li>Need for O(log n) performance</li>
                  </>
                )}
              </ul>

              <h3>Code Implementation</h3>
              <pre><code>{algorithm.code}</code></pre>

              {user && topicId && (
                <div className="completion-section">
                  <button className="btn btn-success btn-lg" onClick={markAsCompleted}>
                    Mark as Completed
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

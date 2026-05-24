import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

const sortingAlgorithms = {
  'bubble-sort': {
    name: 'Bubble Sort',
    description: 'Bubble Sort repeatedly steps through the list, compares adjacent elements and swaps them if they are in the wrong order. The pass through the list is repeated until the list is sorted.',
    timeComplexity: 'O(n²)',
    spaceComplexity: 'O(1)',
    bestCase: 'O(n)',
    code: `function bubbleSort(arr) {
  const n = arr.length;
  for (let i = 0; i < n - 1; i++) {
    for (let j = 0; j < n - i - 1; j++) {
      if (arr[j] > arr[j + 1]) {
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
      }
    }
  }
  return arr;
}`
  },
  'selection-sort': {
    name: 'Selection Sort',
    description: 'Selection Sort divides the array into a sorted and unsorted region. It repeatedly selects the smallest element from the unsorted region and moves it to the sorted region.',
    timeComplexity: 'O(n²)',
    spaceComplexity: 'O(1)',
    bestCase: 'O(n²)',
    code: `function selectionSort(arr) {
  const n = arr.length;
  for (let i = 0; i < n - 1; i++) {
    let minIdx = i;
    for (let j = i + 1; j < n; j++) {
      if (arr[j] < arr[minIdx]) minIdx = j;
    }
    [arr[i], arr[minIdx]] = [arr[minIdx], arr[i]];
  }
  return arr;
}`
  },
  'insertion-sort': {
    name: 'Insertion Sort',
    description: 'Insertion Sort builds the final sorted array one item at a time. It iterates through the input, consuming one element each time and growing a sorted output list.',
    timeComplexity: 'O(n²)',
    spaceComplexity: 'O(1)',
    bestCase: 'O(n)',
    code: `function insertionSort(arr) {
  for (let i = 1; i < arr.length; i++) {
    let key = arr[i];
    let j = i - 1;
    while (j >= 0 && arr[j] > key) {
      arr[j + 1] = arr[j];
      j--;
    }
    arr[j + 1] = key;
  }
  return arr;
}`
  },
  'merge-sort': {
    name: 'Merge Sort',
    description: 'Merge Sort is a divide and conquer algorithm. It divides the array into halves, sorts them recursively, and then merges the sorted halves.',
    timeComplexity: 'O(n log n)',
    spaceComplexity: 'O(n)',
    bestCase: 'O(n log n)',
    code: `function mergeSort(arr) {
  if (arr.length <= 1) return arr;
  const mid = Math.floor(arr.length / 2);
  const left = mergeSort(arr.slice(0, mid));
  const right = mergeSort(arr.slice(mid));
  return merge(left, right);
}

function merge(left, right) {
  const result = [];
  while (left.length && right.length) {
    result.push(left[0] <= right[0] ? left.shift() : right.shift());
  }
  return [...result, ...left, ...right];
}`
  },
  'quick-sort': {
    name: 'Quick Sort',
    description: 'Quick Sort is a divide and conquer algorithm that picks a pivot element and partitions the array around the pivot, placing smaller elements before it and larger after.',
    timeComplexity: 'O(n log n)',
    spaceComplexity: 'O(log n)',
    bestCase: 'O(n log n)',
    code: `function quickSort(arr, low = 0, high = arr.length - 1) {
  if (low < high) {
    const pi = partition(arr, low, high);
    quickSort(arr, low, pi - 1);
    quickSort(arr, pi + 1, high);
  }
  return arr;
}

function partition(arr, low, high) {
  const pivot = arr[high];
  let i = low - 1;
  for (let j = low; j < high; j++) {
    if (arr[j] < pivot) {
      i++;
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
  }
  [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
  return i + 1;
}`
  },
  'heap-sort': {
    name: 'Heap Sort',
    description: 'Heap Sort uses a binary heap data structure. It first builds a max heap from the array, then repeatedly extracts the maximum element and rebuilds the heap.',
    timeComplexity: 'O(n log n)',
    spaceComplexity: 'O(1)',
    bestCase: 'O(n log n)',
    code: `function heapSort(arr) {
  const n = arr.length;
  for (let i = Math.floor(n / 2) - 1; i >= 0; i--)
    heapify(arr, n, i);
  for (let i = n - 1; i > 0; i--) {
    [arr[0], arr[i]] = [arr[i], arr[0]];
    heapify(arr, i, 0);
  }
  return arr;
}

function heapify(arr, n, i) {
  let largest = i;
  const left = 2 * i + 1;
  const right = 2 * i + 2;
  if (left < n && arr[left] > arr[largest]) largest = left;
  if (right < n && arr[right] > arr[largest]) largest = right;
  if (largest !== i) {
    [arr[i], arr[largest]] = [arr[largest], arr[i]];
    heapify(arr, n, largest);
  }
}`
  }
};

export default function SortingVisualizer() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const algorithm = sortingAlgorithms[slug];

  const [array, setArray] = useState([]);
  const [defaultArray] = useState([64, 34, 25, 12, 22, 11, 90, 45, 78, 33]);
  const [customInput, setCustomInput] = useState('');
  const [isSorting, setIsSorting] = useState(false);
  const [speed, setSpeed] = useState(50);
  const [highlightedIndices, setHighlightedIndices] = useState([]);
  const [sortedIndices, setSortedIndices] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [completed, setCompleted] = useState(false);
  const [topicId, setTopicId] = useState(null);
  const [showArticle, setShowArticle] = useState(false);

  const arraySize = 10;

  useEffect(() => {
    if (!algorithm) {
      navigate('/sorting');
      return;
    }
    generateArray();
    loadTopicId();
  }, [slug]);

  const loadTopicId = async () => {
    const { data } = await supabase
      .from('algorithm_topics')
      .select('id')
      .eq('slug', slug)
      .maybeSingle();
    if (data) setTopicId(data.id);
  };

  const generateArray = () => {
    const arr = [];
    for (let i = 0; i < arraySize; i++) {
      arr.push(Math.floor(Math.random() * 90) + 10);
    }
    setArray([...arr]);
    setHighlightedIndices([]);
    setSortedIndices([]);
    setCurrentIndex(-1);
    setCompleted(false);
  };

  const resetToDefault = () => {
    setArray([...defaultArray]);
    setHighlightedIndices([]);
    setSortedIndices([]);
    setCurrentIndex(-1);
    setCompleted(false);
  };

  const handleCustomInput = () => {
    const values = customInput.split(',').map(v => parseInt(v.trim())).filter(v => !isNaN(v) && v > 0);
    if (values.length > 0) {
      setArray(values);
      setHighlightedIndices([]);
      setSortedIndices([]);
      setCurrentIndex(-1);
      setCompleted(false);
    }
  };

  const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  const getDelay = () => Math.max(10, 510 - speed * 5);

  const bubbleSort = async () => {
    const arr = [...array];
    const n = arr.length;

    for (let i = 0; i < n - 1; i++) {
      for (let j = 0; j < n - i - 1; j++) {
        setCurrentIndex(j);
        setHighlightedIndices([j, j + 1]);
        await sleep(getDelay());

        if (arr[j] > arr[j + 1]) {
          [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
          setArray([...arr]);
          await sleep(getDelay());
        }
      }
      setSortedIndices(prev => [...prev, n - i - 1]);
    }
    setSortedIndices([0, ...sortedIndices]);
  };

  const selectionSort = async () => {
    const arr = [...array];
    const n = arr.length;

    for (let i = 0; i < n - 1; i++) {
      let minIdx = i;
      setCurrentIndex(i);

      for (let j = i + 1; j < n; j++) {
        setHighlightedIndices([minIdx, j]);
        await sleep(getDelay());

        if (arr[j] < arr[minIdx]) {
          minIdx = j;
        }
      }

      if (minIdx !== i) {
        [arr[i], arr[minIdx]] = [arr[minIdx], arr[i]];
        setArray([...arr]);
        await sleep(getDelay());
      }
      setSortedIndices(prev => [...prev, i]);
    }
    setSortedIndices(prev => [...prev, n - 1]);
  };

  const insertionSort = async () => {
    const arr = [...array];

    for (let i = 1; i < arr.length; i++) {
      const key = arr[i];
      let j = i - 1;
      setCurrentIndex(i);

      while (j >= 0 && arr[j] > key) {
        setHighlightedIndices([j, j + 1]);
        await sleep(getDelay());

        arr[j + 1] = arr[j];
        setArray([...arr]);
        j--;
      }
      arr[j + 1] = key;
      setArray([...arr]);
    }
    setSortedIndices(arr.map((_, i) => i));
  };

  const mergeSort = async () => {
    const arr = [...array];

    const merge = async (left, mid, right) => {
      const leftArr = arr.slice(left, mid + 1);
      const rightArr = arr.slice(mid + 1, right + 1);
      let i = 0, j = 0, k = left;

      while (i < leftArr.length && j < rightArr.length) {
        setHighlightedIndices([k]);
        await sleep(getDelay());

        if (leftArr[i] <= rightArr[j]) {
          arr[k] = leftArr[i];
          i++;
        } else {
          arr[k] = rightArr[j];
          j++;
        }
        setArray([...arr]);
        k++;
      }

      while (i < leftArr.length) {
        arr[k] = leftArr[i];
        setArray([...arr]);
        setHighlightedIndices([k]);
        await sleep(getDelay());
        i++;
        k++;
      }

      while (j < rightArr.length) {
        arr[k] = rightArr[j];
        setArray([...arr]);
        setHighlightedIndices([k]);
        await sleep(getDelay());
        j++;
        k++;
      }
    };

    const sort = async (left, right) => {
      if (left < right) {
        const mid = Math.floor((left + right) / 2);
        await sort(left, mid);
        await sort(mid + 1, right);
        await merge(left, mid, right);
      }
    };

    await sort(0, arr.length - 1);
    setSortedIndices(arr.map((_, i) => i));
  };

  const quickSort = async () => {
    const arr = [...array];

    const partition = async (low, high) => {
      const pivot = arr[high];
      let i = low - 1;

      for (let j = low; j < high; j++) {
        setHighlightedIndices([j, high]);
        await sleep(getDelay());

        if (arr[j] < pivot) {
          i++;
          [arr[i], arr[j]] = [arr[j], arr[i]];
          setArray([...arr]);
          await sleep(getDelay());
        }
      }

      [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
      setArray([...arr]);
      return i + 1;
    };

    const sort = async (low, high) => {
      if (low < high) {
        const pi = await partition(low, high);
        setSortedIndices(prev => [...prev, pi]);
        await sort(low, pi - 1);
        await sort(pi + 1, high);
      }
    };

    await sort(0, arr.length - 1);
    setSortedIndices(arr.map((_, i) => i));
  };

  const heapSort = async () => {
    const arr = [...array];
    const n = arr.length;

    const heapify = async (size, i) => {
      let largest = i;
      const left = 2 * i + 1;
      const right = 2 * i + 2;

      if (left < size && arr[left] > arr[largest]) largest = left;
      if (right < size && arr[right] > arr[largest]) largest = right;

      if (largest !== i) {
        setHighlightedIndices([i, largest]);
        await sleep(getDelay());

        [arr[i], arr[largest]] = [arr[largest], arr[i]];
        setArray([...arr]);
        await heapify(size, largest);
      }
    };

    for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
      await heapify(n, i);
    }

    for (let i = n - 1; i > 0; i--) {
      setHighlightedIndices([0, i]);
      await sleep(getDelay());

      [arr[0], arr[i]] = [arr[i], arr[0]];
      setArray([...arr]);
      setSortedIndices(prev => [...prev, i]);
      await heapify(i, 0);
    }
    setSortedIndices(arr.map((_, i) => i));
  };

  const startSort = async () => {
    if (isSorting) return;
    setIsSorting(true);
    setHighlightedIndices([]);
    setSortedIndices([]);

    switch (slug) {
      case 'bubble-sort':
        await bubbleSort();
        break;
      case 'selection-sort':
        await selectionSort();
        break;
      case 'insertion-sort':
        await insertionSort();
        break;
      case 'merge-sort':
        await mergeSort();
        break;
      case 'quick-sort':
        await quickSort();
        break;
      case 'heap-sort':
        await heapSort();
        break;
    }

    setIsSorting(false);
    setCurrentIndex(-1);
    setHighlightedIndices([]);
    setCompleted(true);
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
            placeholder="Enter values: 40,10,50,30,20"
            value={customInput}
            onChange={(e) => setCustomInput(e.target.value)}
            style={{ maxWidth: '250px' }}
          />
          <button className="btn btn-secondary" onClick={handleCustomInput} disabled={isSorting}>
            Apply
          </button>
          <button className="btn btn-secondary" onClick={resetToDefault} disabled={isSorting}>
            Default Array
          </button>
          <button className="btn btn-secondary" onClick={generateArray} disabled={isSorting}>
            Random Array
          </button>
        </div>

        <div className="visualizer-controls">
          <button
            className="btn btn-primary"
            onClick={startSort}
            disabled={isSorting}
          >
            {isSorting ? 'Sorting...' : 'Start Sort'}
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
              disabled={isSorting}
            />
            <span className="speed-label">{speed}%</span>
          </div>
        </div>
      </div>

      <div className="visualizer-canvas" style={{ minHeight: '300px' }}>
        {array.map((value, idx) => {
          const maxVal = Math.max(...array);
          const height = (value / maxVal) * 250;
          let className = 'array-bar';
          if (sortedIndices.includes(idx)) className += ' sorted';
          else if (highlightedIndices.includes(idx)) className += ' comparing';

          return (
            <div key={idx} className={className} style={{ height: `${height}px`, width: `${Math.max(25, 400 / array.length)}px` }}>
              <span className="array-bar-value">{value}</span>
            </div>
          );
        })}
      </div>

      {completed && (
        <div className="card" style={{ marginTop: '16px', textAlign: 'center' }}>
          <p style={{ marginBottom: '16px' }}>Sorting completed!</p>
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

              <h3>Algorithm Steps</h3>
              <p dangerously __suppress_dangerously_set_inners__html={{ __html: algorithm.description }} />

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

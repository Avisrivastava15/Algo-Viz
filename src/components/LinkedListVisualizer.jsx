import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

const linkedListOperations = {
  'linkedlist-traversal': {
    name: 'Linked List Traversal',
    description: 'Traversal involves visiting each node of the linked list from the head to the end, accessing the data stored in each node.',
    code: `function traverse(head) {
  let current = head;
  while (current !== null) {
    console.log(current.data);
    current = current.next;
  }
}`
  },
  'linkedlist-insertion': {
    name: 'Linked List Insertion',
    description: 'Insertion can be performed at the beginning, end, or at a specific position in the linked list.',
    code: `// Insert at beginning
function insertAtHead(head, data) {
  const newNode = { data, next: head };
  return newNode;
}

// Insert at end
function insertAtTail(head, data) {
  const newNode = { data, next: null };
  if (!head) return newNode;

  let current = head;
  while (current.next) {
    current = current.next;
  }
  current.next = newNode;
  return head;
}

// Insert at position
function insertAtPosition(head, data, pos) {
  if (pos === 0) return insertAtHead(head, data);

  let current = head;
  for (let i = 0; i < pos - 1 && current; i++) {
    current = current.next;
  }
  if (!current) return head;

  const newNode = { data, next: current.next };
  current.next = newNode;
  return head;
}`
  },
  'linkedlist-deletion': {
    name: 'Linked List Deletion',
    description: 'Deletion can remove the first node, last node, or a node at a specific position or with specific value.',
    code: `// Delete head
function deleteHead(head) {
  if (!head) return null;
  return head.next;
}

// Delete tail
function deleteTail(head) {
  if (!head || !head.next) return null;

  let current = head;
  while (current.next.next) {
    current = current.next;
  }
  current.next = null;
  return head;
}

// Delete at position
function deleteAtPosition(head, pos) {
  if (pos === 0) return deleteHead(head);

  let current = head;
  for (let i = 0; i < pos - 1 && current; i++) {
    current = current.next;
  }
  if (!current || !current.next) return head;
  current.next = current.next.next;
  return head;
}`
  },
  'linkedlist-reversal': {
    name: 'Linked List Reversal',
    description: 'Reversal changes the direction of the linked list so that the last node becomes the first and vice versa.',
    code: `// Iterative reversal
function reverse(head) {
  let prev = null;
  let current = head;

  while (current) {
    const next = current.next;
    current.next = prev;
    prev = current;
    current = next;
  }
  return prev;
}

// Recursive reversal
function reverseRecursive(head) {
  if (!head || !head.next) return head;

  const newHead = reverseRecursive(head.next);
  head.next.next = head;
  head.next = null;
  return newHead;
}`
  }
};

const defaultNodes = [10, 20, 30, 40, 50];

export default function LinkedListVisualizer() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const operation = linkedListOperations[slug];

  const [nodes, setNodes] = useState(defaultNodes.map((val, i) => ({ data: val, id: i })));
  const [customInput, setCustomInput] = useState('');
  const [insertValue, setInsertValue] = useState('');
  const [insertPosition, setInsertPosition] = useState(0);
  const [deletePosition, setDeletePosition] = useState(0);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [isAnimating, setIsAnimating] = useState(false);
  const [speed, setSpeed] = useState(50);
  const [completed, setCompleted] = useState(false);
  const [topicId, setTopicId] = useState(null);
  const [showArticle, setShowArticle] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!operation) {
      navigate('/linkedlist');
      return;
    }
    loadTopicId();
    resetToDefault();
  }, [slug]);

  const loadTopicId = async () => {
    const { data } = await supabase
      .from('algorithm_topics')
      .select('id')
      .eq('slug', slug)
      .maybeSingle();
    if (data) setTopicId(data.id);
  };

  const resetToDefault = () => {
    setNodes(defaultNodes.map((val, i) => ({ data: val, id: i })));
    setHighlightedIndex(-1);
    setCompleted(false);
    setMessage('');
  };

  const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  const getDelay = () => Math.max(200, 1000 - speed * 8);

  const handleCustomInput = () => {
    const values = customInput.split(',').map(v => parseInt(v.trim())).filter(v => !isNaN(v));
    if (values.length > 0) {
      setNodes(values.map((val, i) => ({ data: val, id: i })));
      setHighlightedIndex(-1);
      setCompleted(false);
    }
  };

  const getNewId = () => Math.max(0, ...nodes.map(n => n.id)) + 1;

  const traversal = async () => {
    setMessage('Starting traversal...');
    for (let i = 0; i < nodes.length; i++) {
      setHighlightedIndex(i);
      setMessage(`Visiting node ${i + 1}/${nodes.length}: value = ${nodes[i].data}`);
      await sleep(getDelay());
    }
    setMessage('Traversal complete!');
    setCompleted(true);
  };

  const insertAtHead = async () => {
    if (!insertValue || isNaN(parseInt(insertValue))) return;
    setIsAnimating(true);

    const newId = getNewId();
    const value = parseInt(insertValue);

    setMessage(`Inserting ${value} at head...`);
    await sleep(getDelay());

    setNodes([{ data: value, id: newId }, ...nodes]);
    setHighlightedIndex(0);
    setMessage(`Inserted ${value} at head`);
    setCompleted(true);
    setIsAnimating(false);
  };

  const insertAtTail = async () => {
    if (!insertValue || isNaN(parseInt(insertValue))) return;
    setIsAnimating(true);

    const newId = getNewId();
    const value = parseInt(insertValue);

    setMessage(`Inserting ${value} at tail...`);
    for (let i = 0; i < nodes.length; i++) {
      setHighlightedIndex(i);
      await sleep(getDelay() / 2);
    }

    setNodes([...nodes, { data: value, id: newId }]);
    setHighlightedIndex(nodes.length);
    setMessage(`Inserted ${value} at tail`);
    setCompleted(true);
    setIsAnimating(false);
  };

  const insertAtPosition = async () => {
    if (!insertValue || isNaN(parseInt(insertValue))) return;
    setIsAnimating(true);

    const newId = getNewId();
    const value = parseInt(insertValue);
    const pos = Math.min(insertPosition, nodes.length);

    setMessage(`Finding position ${pos}...`);
    for (let i = 0; i < pos; i++) {
      setHighlightedIndex(i);
      await sleep(getDelay() / 2);
    }

    setMessage(`Inserting ${value} at position ${pos}...`);
    await sleep(getDelay());

    const newNodes = [...nodes];
    newNodes.splice(pos, 0, { data: value, id: newId });
    setNodes(newNodes);
    setHighlightedIndex(pos);
    setMessage(`Inserted ${value} at position ${pos}`);
    setCompleted(true);
    setIsAnimating(false);
  };

  const deleteHead = async () => {
    if (nodes.length === 0) return;
    setIsAnimating(true);

    setMessage(`Deleting head node with value ${nodes[0].data}...`);
    setHighlightedIndex(0);
    await sleep(getDelay());

    setNodes(nodes.slice(1));
    setHighlightedIndex(-1);
    setMessage('Head node deleted');
    setCompleted(true);
    setIsAnimating(false);
  };

  const deleteTail = async () => {
    if (nodes.length === 0) return;
    setIsAnimating(true);

    const lastIdx = nodes.length - 1;
    setMessage(`Traversing to tail...`);
    for (let i = 0; i < lastIdx; i++) {
      setHighlightedIndex(i);
      await sleep(getDelay() / 2);
    }

    setHighlightedIndex(lastIdx);
    setMessage(`Deleting tail node with value ${nodes[lastIdx].data}...`);
    await sleep(getDelay());

    setNodes(nodes.slice(0, -1));
    setHighlightedIndex(-1);
    setMessage('Tail node deleted');
    setCompleted(true);
    setIsAnimating(false);
  };

  const deleteAtPosition = async () => {
    if (nodes.length === 0) return;
    setIsAnimating(true);

    const pos = Math.min(deletePosition, nodes.length - 1);

    setMessage(`Finding position ${pos}...`);
    for (let i = 0; i < pos; i++) {
      setHighlightedIndex(i);
      await sleep(getDelay() / 2);
    }

    setHighlightedIndex(pos);
    setMessage(`Deleting node at position ${pos} with value ${nodes[pos].data}...`);
    await sleep(getDelay());

    const newNodes = [...nodes];
    newNodes.splice(pos, 1);
    setNodes(newNodes);
    setHighlightedIndex(-1);
    setMessage(`Node at position ${pos} deleted`);
    setCompleted(true);
    setIsAnimating(false);
  };

  const reverseList = async () => {
    if (nodes.length <= 1) return;
    setIsAnimating(true);

    setMessage('Reversing linked list...');

    const reversed = [];
    for (let i = nodes.length - 1; i >= 0; i--) {
      setHighlightedIndex(i);
      reversed.push(nodes[i]);
      await sleep(getDelay());
    }

    setNodes(reversed.map((n, i) => ({ ...n, id: i })));
    setHighlightedIndex(-1);
    setMessage('List reversed!');
    setCompleted(true);
    setIsAnimating(false);
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

  if (!operation) return null;

  return (
    <div className="visualizer-container">
      <div className="visualizer-header">
        <div>
          <h1 className="visualizer-title">{operation.name}</h1>
          <p style={{ color: 'var(--text-secondary)' }}>{operation.description}</p>
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
            placeholder="Custom values: 10,20,30"
            value={customInput}
            onChange={(e) => setCustomInput(e.target.value)}
            style={{ maxWidth: '200px' }}
          />
          <button className="btn btn-secondary" onClick={handleCustomInput} disabled={isAnimating}>
            Apply
          </button>
          <button className="btn btn-secondary" onClick={resetToDefault} disabled={isAnimating}>
            Reset
          </button>
        </div>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center', marginBottom: '16px' }}>
          {slug === 'linkedlist-traversal' && (
            <button className="btn btn-primary" onClick={traversal} disabled={isAnimating}>
              Start Traversal
            </button>
          )}

          {slug === 'linkedlist-insertion' && (
            <>
              <input
                type="text"
                className="form-input"
                placeholder="Value"
                value={insertValue}
                onChange={(e) => setInsertValue(e.target.value)}
                style={{ maxWidth: '100px' }}
              />
              <input
                type="number"
                className="form-input"
                placeholder="Position"
                value={insertPosition}
                onChange={(e) => setInsertPosition(parseInt(e.target.value) || 0)}
                style={{ maxWidth: '100px' }}
                min="0"
              />
              <button className="btn btn-primary" onClick={insertAtHead} disabled={isAnimating}>
                Insert at Head
              </button>
              <button className="btn btn-secondary" onClick={insertAtTail} disabled={isAnimating}>
                Insert at Tail
              </button>
              <button className="btn btn-secondary" onClick={insertAtPosition} disabled={isAnimating}>
                Insert at Pos
              </button>
            </>
          )}

          {slug === 'linkedlist-deletion' && (
            <>
              <input
                type="number"
                className="form-input"
                placeholder="Position"
                value={deletePosition}
                onChange={(e) => setDeletePosition(parseInt(e.target.value) || 0)}
                style={{ maxWidth: '100px' }}
                min="0"
              />
              <button className="btn btn-primary" onClick={deleteHead} disabled={isAnimating}>
                Delete Head
              </button>
              <button className="btn btn-secondary" onClick={deleteTail} disabled={isAnimating}>
                Delete Tail
              </button>
              <button className="btn btn-secondary" onClick={deleteAtPosition} disabled={isAnimating}>
                Delete at Pos
              </button>
            </>
          )}

          {slug === 'linkedlist-reversal' && (
            <button className="btn btn-primary" onClick={reverseList} disabled={isAnimating}>
              Reverse List
            </button>
          )}

          <div className="speed-control">
            <span className="speed-label">Speed:</span>
            <input
              type="range"
              className="speed-slider"
              min="1"
              max="100"
              value={speed}
              onChange={(e) => setSpeed(parseInt(e.target.value))}
              disabled={isAnimating}
            />
            <span className="speed-label">{speed}%</span>
          </div>
        </div>
      </div>

      <div className="linkedlist-canvas" style={{ minHeight: '200px', padding: '32px', overflowX: 'auto' }}>
        {nodes.map((node, idx) => (
          <div key={node.id} className="linkedlist-node">
            <div className={`node-box ${highlightedIndex === idx ? 'highlighted' : ''}`}>
              {node.data}
            </div>
            {idx < nodes.length - 1 && <div className="node-arrow"></div>}
          </div>
        ))}
        {nodes.length === 0 && (
          <div style={{ color: 'var(--text-secondary)' }}>Empty list</div>
        )}
        {nodes.length > 0 && (
          <div className="linkedlist-node">
            <div className="node-arrow"></div>
            <div className="node-box null-node">null</div>
          </div>
        )}
      </div>

      {message && (
        <div className="card" style={{ marginTop: '16px' }}>
          <p style={{ fontWeight: '500', color: 'var(--primary-600)' }}>{message}</p>
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
              <h2 className="modal-title">{operation.name} - Article</h2>
              <button className="modal-close" onClick={() => setShowArticle(false)}>×</button>
            </div>
            <div className="article-content">
              <p>{operation.description}</p>

              <h3>Time Complexity</h3>
              <ul>
                {slug === 'linkedlist-traversal' && (
                  <li><strong>Time:</strong> O(n) - Must visit each node</li>
                )}
                {slug === 'linkedlist-insertion' && (
                  <>
                    <li><strong>At Head:</strong> O(1)</li>
                    <li><strong>At Tail/Position:</strong> O(n)</li>
                  </>
                )}
                {slug === 'linkedlist-deletion' && (
                  <>
                    <li><strong>At Head:</strong> O(1)</li>
                    <li><strong>At Tail/Position:</strong> O(n)</li>
                  </>
                )}
                {slug === 'linkedlist-reversal' && (
                  <>
                    <li><strong>Time:</strong> O(n)</li>
                    <li><strong>Space (Iterative):</strong> O(1)</li>
                    <li><strong>Space (Recursive):</strong> O(n) stack</li>
                  </>
                )}
              </ul>

              <h3>Code Implementation</h3>
              <pre><code>{operation.code}</code></pre>

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

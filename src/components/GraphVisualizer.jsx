import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

const graphAlgorithms = {
  'bfs': {
    name: 'Breadth-First Search',
    description: 'BFS explores all vertices at the current depth before moving to vertices at the next depth level. It uses a queue data structure and is useful for finding the shortest path in unweighted graphs.',
    timeComplexity: 'O(V + E)',
    spaceComplexity: 'O(V)',
    code: `function bfs(graph, start) {
  const visited = new Set();
  const queue = [start];
  const result = [];

  while (queue.length > 0) {
    const node = queue.shift();
    if (!visited.has(node)) {
      visited.add(node);
      result.push(node);
      for (const neighbor of graph[node]) {
        if (!visited.has(neighbor)) {
          queue.push(neighbor);
        }
      }
    }
  }
  return result;
}`
  },
  'dfs': {
    name: 'Depth-First Search',
    description: 'DFS explores as far as possible along each branch before backtracking. It uses a stack (or recursion) and is useful for cycle detection and topological sorting.',
    timeComplexity: 'O(V + E)',
    spaceComplexity: 'O(V)',
    code: `function dfs(graph, start, visited = new Set()) {
  visited.add(start);
  const result = [start];

  for (const neighbor of graph[start]) {
    if (!visited.has(neighbor)) {
      result.push(...dfs(graph, neighbor, visited));
    }
  }
  return result;
}`
  },
  'dijkstra': {
    name: 'Dijkstra Algorithm',
    description: 'Dijkstra finds the shortest path from a source node to all other nodes in a weighted graph with non-negative edges. It uses a priority queue to select the node with minimum distance.',
    timeComplexity: 'O((V + E) log V)',
    spaceComplexity: 'O(V)',
    code: `function dijkstra(graph, start) {
  const distances = {};
  const visited = new Set();
  const pq = [[0, start]];

  for (const node in graph) distances[node] = Infinity;
  distances[start] = 0;

  while (pq.length > 0) {
    pq.sort((a, b) => a[0] - b[0]);
    const [dist, node] = pq.shift();

    if (visited.has(node)) continue;
    visited.add(node);

    for (const [neighbor, weight] of graph[node]) {
      const newDist = dist + weight;
      if (newDist < distances[neighbor]) {
        distances[neighbor] = newDist;
        pq.push([newDist, neighbor]);
      }
    }
  }
  return distances;
}`
  },
  'topological-sort': {
    name: 'Topological Sort',
    description: 'Topological Sort produces a linear ordering of vertices such that for every directed edge (u, v), vertex u comes before v. It only works on Directed Acyclic Graphs (DAGs).',
    timeComplexity: 'O(V + E)',
    spaceComplexity: 'O(V)',
    code: `function topologicalSort(graph) {
  const visited = new Set();
  const stack = [];

  function dfs(node) {
    visited.add(node);
    for (const neighbor of graph[node] || []) {
      if (!visited.has(neighbor)) {
        dfs(neighbor);
      }
    }
    stack.push(node);
  }

  for (const node in graph) {
    if (!visited.has(node)) {
      dfs(node);
    }
  }
  return stack.reverse();
}`
  }
};

const defaultGraph = {
  nodes: [
    { id: 'A', x: 100, y: 100 },
    { id: 'B', x: 250, y: 50 },
    { id: 'C', x: 400, y: 100 },
    { id: 'D', x: 100, y: 250 },
    { id: 'E', x: 250, y: 200 },
    { id: 'F', x: 400, y: 250 },
  ],
  edges: [
    { from: 'A', to: 'B', weight: 4 },
    { from: 'A', to: 'D', weight: 2 },
    { from: 'B', to: 'C', weight: 3 },
    { from: 'B', to: 'E', weight: 1 },
    { from: 'C', to: 'F', weight: 2 },
    { from: 'D', to: 'E', weight: 3 },
    { from: 'E', to: 'F', weight: 5 },
  ]
};

export default function GraphVisualizer() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const algorithm = graphAlgorithms[slug];
  const canvasRef = useRef(null);

  const [nodes, setNodes] = useState(defaultGraph.nodes);
  const [edges, setEdges] = useState(defaultGraph.edges);
  const [startNode, setStartNode] = useState('A');
  const [visitedNodes, setVisitedNodes] = useState([]);
  const [visitedEdges, setVisitedEdges] = useState([]);
  const [currentNode, setCurrentNode] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [speed, setSpeed] = useState(50);
  const [completed, setCompleted] = useState(false);
  const [topicId, setTopicId] = useState(null);
  const [showArticle, setShowArticle] = useState(false);
  const [resultPath, setResultPath] = useState([]);
  const [distances, setDistances] = useState({});

  useEffect(() => {
    if (!algorithm) {
      navigate('/graph');
      return;
    }
    loadTopicId();
    resetGraph();
  }, [slug]);

  const loadTopicId = async () => {
    const { data } = await supabase
      .from('algorithm_topics')
      .select('id')
      .eq('slug', slug)
      .maybeSingle();
    if (data) setTopicId(data.id);
  };

  const resetGraph = () => {
    setNodes(defaultGraph.nodes);
    setEdges(defaultGraph.edges);
    setVisitedNodes([]);
    setVisitedEdges([]);
    setCurrentNode(null);
    setCompleted(false);
    setResultPath([]);
    setDistances({});
  };

  const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  const getDelay = () => Math.max(200, 1500 - speed * 12);

  const getAdjacencyList = () => {
    const adj = {};
    nodes.forEach(n => adj[n.id] = []);
    edges.forEach(e => {
      adj[e.from].push(e.to);
      if (slug !== 'topological-sort') {
        adj[e.to].push(e.from);
      }
    });
    return adj;
  };

  const getWeightedGraph = () => {
    const graph = {};
    nodes.forEach(n => graph[n.id] = []);
    edges.forEach(e => {
      graph[e.from].push([e.to, e.weight]);
      graph[e.to].push([e.from, e.weight]);
    });
    return graph;
  };

  const bfs = async () => {
    const adj = getAdjacencyList();
    const visited = new Set();
    const queue = [startNode];
    const path = [];

    while (queue.length > 0) {
      const node = queue.shift();
      if (!visited.has(node)) {
        visited.add(node);
        path.push(node);
        setCurrentNode(node);
        setVisitedNodes([...path]);
        await sleep(getDelay());

        for (const neighbor of adj[node]) {
          if (!visited.has(neighbor)) {
            queue.push(neighbor);
            setVisitedEdges(prev => {
              const edgeKey = `${node}-${neighbor}`;
              const reverseKey = `${neighbor}-${node}`;
              if (!prev.includes(edgeKey) && !prev.includes(reverseKey)) {
                return [...prev, edgeKey];
              }
              return prev;
            });
          }
        }
      }
    }
    setResultPath(path);
  };

  const dfs = async () => {
    const adj = getAdjacencyList();
    const visited = new Set();
    const path = [];

    const dfsHelper = async (node) => {
      visited.add(node);
      path.push(node);
      setCurrentNode(node);
      setVisitedNodes([...path]);
      await sleep(getDelay());

      for (const neighbor of adj[node]) {
        if (!visited.has(neighbor)) {
          setVisitedEdges(prev => {
            const edgeKey = `${node}-${neighbor}`;
            const reverseKey = `${neighbor}-${node}`;
            if (!prev.includes(edgeKey) && !prev.includes(reverseKey)) {
              return [...prev, edgeKey];
            }
            return prev;
          });
          await dfsHelper(neighbor);
        }
      }
    };

    await dfsHelper(startNode);
    setResultPath(path);
  };

  const dijkstra = async () => {
    const graph = getWeightedGraph();
    const dist = {};
    const visited = new Set();

    nodes.forEach(n => dist[n.id] = Infinity);
    dist[startNode] = 0;
    setDistances({ ...dist });

    while (visited.size < nodes.length) {
      let minNode = null;
      let minDist = Infinity;

      for (const node of nodes.map(n => n.id)) {
        if (!visited.has(node) && dist[node] < minDist) {
          minDist = dist[node];
          minNode = node;
        }
      }

      if (minNode === null) break;
      visited.add(minNode);
      setCurrentNode(minNode);
      setVisitedNodes([...visited]);
      await sleep(getDelay());

      for (const [neighbor, weight] of graph[minNode]) {
        const newDist = dist[minNode] + weight;
        if (newDist < dist[neighbor]) {
          dist[neighbor] = newDist;
          setDistances({ ...dist });
          setVisitedEdges(prev => {
            const edgeKey = `${minNode}-${neighbor}`;
            const reverseKey = `${neighbor}-${minNode}`;
            if (!prev.includes(edgeKey) && !prev.includes(reverseKey)) {
              return [...prev, edgeKey];
            }
            return prev;
          });
        }
      }
    }

    setResultPath([...visited]);
  };

  const topologicalSort = async () => {
    const adj = getAdjacencyList();
    const visited = new Set();
    const stack = [];
    const path = [];

    const dfsHelper = async (node) => {
      visited.add(node);
      path.push(node);
      setCurrentNode(node);
      setVisitedNodes([...path]);
      await sleep(getDelay());

      for (const neighbor of adj[node]) {
        if (!visited.has(neighbor)) {
          setVisitedEdges(prev => [...prev, `${node}-${neighbor}`]);
          await dfsHelper(neighbor);
        }
      }
      stack.unshift(node);
    };

    for (const node of nodes.map(n => n.id)) {
      if (!visited.has(node)) {
        await dfsHelper(node);
      }
    }

    setResultPath(stack);
  };

  const startAlgorithm = async () => {
    if (isRunning) return;
    setIsRunning(true);
    setVisitedNodes([]);
    setVisitedEdges([]);
    setResultPath([]);
    setDistances({});

    switch (slug) {
      case 'bfs':
        await bfs();
        break;
      case 'dfs':
        await dfs();
        break;
      case 'dijkstra':
        await dijkstra();
        break;
      case 'topological-sort':
        await topologicalSort();
        break;
    }

    setIsRunning(false);
    setCurrentNode(null);
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

  const isEdgeVisited = (from, to) => {
    return visitedEdges.includes(`${from}-${to}`) || visitedEdges.includes(`${to}-${from}`);
  };

  const renderEdge = (edge, idx) => {
    const fromNode = nodes.find(n => n.id === edge.from);
    const toNode = nodes.find(n => n.id === edge.to);
    if (!fromNode || !toNode) return null;

    const dx = toNode.x - fromNode.x;
    const dy = toNode.y - fromNode.y;
    const length = Math.sqrt(dx * dx + dy * dy);
    const angle = Math.atan2(dy, dx) * 180 / Math.PI;

    const visited = isEdgeVisited(edge.from, edge.to);

    return (
      <div
        key={idx}
        className={`graph-edge ${visited ? 'visited' : ''}`}
        style={{
          left: `${fromNode.x + 25}px`,
          top: `${fromNode.y + 25}px`,
          width: `${length - 50}px`,
          transform: `rotate(${angle}deg)`,
        }}
      />
    );
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
        <div style={{ marginBottom: '16px', display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" style={{ marginRight: '8px' }}>Start Node:</label>
            <select
              className="form-input"
              style={{ width: 'auto', minWidth: '80px' }}
              value={startNode}
              onChange={(e) => setStartNode(e.target.value)}
              disabled={isRunning}
            >
              {nodes.map(n => (
                <option key={n.id} value={n.id}>{n.id}</option>
              ))}
            </select>
          </div>
          <button className="btn btn-secondary" onClick={resetGraph} disabled={isRunning}>
            Reset Graph
          </button>
          <button
            className="btn btn-primary"
            onClick={startAlgorithm}
            disabled={isRunning}
          >
            {isRunning ? 'Running...' : 'Run Algorithm'}
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
              disabled={isRunning}
            />
            <span className="speed-label">{speed}%</span>
          </div>
        </div>
      </div>

      <div className="graph-canvas" style={{ position: 'relative' }}>
        {edges.map((edge, idx) => renderEdge(edge, idx))}
        {nodes.map((node) => (
          <div
            key={node.id}
            className={`graph-node ${visitedNodes.includes(node.id) ? 'visited' : ''} ${currentNode === node.id ? 'current' : ''} ${node.id === startNode ? 'start' : ''}`}
            style={{ left: `${node.x}px`, top: `${node.y}px` }}
          >
            {node.id}
          </div>
        ))}
      </div>

      {slug === 'dijkstra' && Object.keys(distances).length > 0 && (
        <div className="card" style={{ marginTop: '16px' }}>
          <h3 style={{ marginTop: 0 }}>Shortest Distances from {startNode}</h3>
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            {nodes.map(n => (
              <span key={n.id} style={{ fontSize: '0.875rem' }}>
                <strong>{n.id}:</strong> {distances[n.id] === Infinity ? '∞' : distances[n.id]}
              </span>
            ))}
          </div>
        </div>
      )}

      {resultPath.length > 0 && slug !== 'dijkstra' && (
        <div className="card" style={{ marginTop: '16px' }}>
          <h3 style={{ marginTop: 0 }}>
            {slug === 'topological-sort' ? 'Topological Order' : 'Traversal Order'}
          </h3>
          <p style={{ fontSize: '1.25rem', fontWeight: '600', color: 'var(--primary-600)' }}>
            {resultPath.join(' → ')}
          </p>
        </div>
      )}

      {completed && (
        <div className="card" style={{ marginTop: '16px', textAlign: 'center' }}>
          <p style={{ marginBottom: '16px' }}>Algorithm completed!</p>
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

              <h3>Complexity</h3>
              <ul>
                <li><strong>Time:</strong> {algorithm.timeComplexity}</li>
                <li><strong>Space:</strong> {algorithm.spaceComplexity}</li>
              </ul>

              <h3>Use Cases</h3>
              <ul>
                {slug === 'bfs' && (
                  <>
                    <li>Finding shortest path in unweighted graphs</li>
                    <li>Level-order traversal</li>
                    <li>Finding connected components</li>
                  </>
                )}
                {slug === 'dfs' && (
                  <>
                    <li>Cycle detection</li>
                    <li>Topological sorting</li>
                    <li>Finding strongly connected components</li>
                  </>
                )}
                {slug === 'dijkstra' && (
                  <>
                    <li>Shortest path in weighted graphs</li>
                    <li>GPS navigation systems</li>
                    <li>Network routing protocols</li>
                  </>
                )}
                {slug === 'topological-sort' && (
                  <>
                    <li>Task scheduling</li>
                    <li>Build systems (make, webpack)</li>
                    <li>Course prerequisite ordering</li>
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

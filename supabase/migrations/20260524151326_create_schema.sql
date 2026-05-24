/*
  # DSA Visualizer Schema

  1. New Tables
    - `algorithm_topics` - Stores all DSA algorithms with categories
      - `id` (uuid, primary key)
      - `name` (text, unique) - Algorithm name
      - `category` (text) - sorting, searching, graph, linkedlist, etc.
      - `slug` (text, unique) - URL-friendly identifier
      - `description` (text) - Brief description
      - `difficulty` (text) - easy, medium, hard
      - `order_index` (integer) - Display order within category
      - `created_at` (timestamp)
    
    - `user_progress` - Tracks user completion status for each algorithm
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `topic_id` (uuid, references algorithm_topics)
      - `completed` (boolean, default false)
      - `completed_at` (timestamp)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Users can only read/write their own progress
    - Algorithm topics are readable by all authenticated users

  3. Seed Data
    - Initial algorithm topics for sorting, searching, graph, and linked list
*/

-- Create algorithm_topics table
CREATE TABLE IF NOT EXISTS algorithm_topics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  category text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text DEFAULT '',
  difficulty text DEFAULT 'medium',
  order_index integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Create user_progress table
CREATE TABLE IF NOT EXISTS user_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  topic_id uuid NOT NULL REFERENCES algorithm_topics(id) ON DELETE CASCADE,
  completed boolean DEFAULT false,
  completed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, topic_id)
);

-- Enable RLS
ALTER TABLE algorithm_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;

-- Policies for algorithm_topics (readable by all authenticated users)
CREATE POLICY "Authenticated users can view topics"
  ON algorithm_topics FOR SELECT
  TO authenticated
  USING (true);

-- Policies for user_progress
CREATE POLICY "Users can view own progress"
  ON user_progress FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own progress"
  ON user_progress FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own progress"
  ON user_progress FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Insert seed data for algorithm topics
INSERT INTO algorithm_topics (name, category, slug, description, difficulty, order_index) VALUES
-- Sorting Algorithms
('Bubble Sort', 'sorting', 'bubble-sort', 'A simple sorting algorithm that repeatedly steps through the list, compares adjacent elements and swaps them if they are in the wrong order.', 'easy', 1),
('Selection Sort', 'sorting', 'selection-sort', 'Sorts an array by repeatedly finding the minimum element from unsorted part and putting it at the beginning.', 'easy', 2),
('Insertion Sort', 'sorting', 'insertion-sort', 'Builds the sorted array one item at a time by comparisons.', 'easy', 3),
('Merge Sort', 'sorting', 'merge-sort', 'A divide and conquer algorithm that divides the array into halves, sorts them, and merges them back.', 'medium', 4),
('Quick Sort', 'sorting', 'quick-sort', 'A divide and conquer algorithm that picks a pivot and partitions the array around it.', 'medium', 5),
('Heap Sort', 'sorting', 'heap-sort', 'Comparison-based sorting using a binary heap data structure.', 'medium', 6),

-- Searching Algorithms
('Linear Search', 'searching', 'linear-search', 'Sequentially checks each element until a match is found.', 'easy', 1),
('Binary Search', 'searching', 'binary-search', 'Searches a sorted array by repeatedly dividing the search interval in half.', 'easy', 2),

-- Graph Algorithms
('Breadth-First Search', 'graph', 'bfs', 'Explores all vertices at the current depth before moving to vertices at the next depth level.', 'medium', 1),
('Depth-First Search', 'graph', 'dfs', 'Explores as far as possible along each branch before backtracking.', 'medium', 2),
('Dijkstra Algorithm', 'graph', 'dijkstra', 'Finds the shortest path between nodes in a graph with non-negative edge weights.', 'hard', 3),
('Topological Sort', 'graph', 'topological-sort', 'Linear ordering of vertices such that for every directed edge, u comes before v.', 'hard', 4),

-- Linked List Operations
('Linked List Traversal', 'linkedlist', 'linkedlist-traversal', 'Traverse through all nodes of a linked list.', 'easy', 1),
('Linked List Insertion', 'linkedlist', 'linkedlist-insertion', 'Insert nodes at various positions in a linked list.', 'easy', 2),
('Linked List Deletion', 'linkedlist', 'linkedlist-deletion', 'Delete nodes from various positions in a linked list.', 'easy', 3),
('Linked List Reversal', 'linkedlist', 'linkedlist-reversal', 'Reverse a linked list iteratively or recursively.', 'medium', 4);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_progress_user_id ON user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_algorithm_topics_category ON algorithm_topics(category);

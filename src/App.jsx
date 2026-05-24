import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/Layout';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import SortingCategory from './pages/SortingCategory';
import GraphCategory from './pages/GraphCategory';
import LinkedListCategory from './pages/LinkedListCategory';
import SearchingCategory from './pages/SearchingCategory';
import SortingVisualizer from './components/SortingVisualizer';
import GraphVisualizer from './components/GraphVisualizer';
import LinkedListVisualizer from './components/LinkedListVisualizer';
import SearchingVisualizer from './components/SearchingVisualizer';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={<Dashboard />} />

            <Route path="/sorting" element={<SortingCategory />} />
            <Route path="/sorting/:slug" element={<SortingVisualizer />} />

            <Route path="/searching" element={<SearchingCategory />} />
            <Route path="/searching/:slug" element={<SearchingVisualizer />} />

            <Route path="/graph" element={<GraphCategory />} />
            <Route path="/graph/:slug" element={<GraphVisualizer />} />

            <Route path="/linkedlist" element={<LinkedListCategory />} />
            <Route path="/linkedlist/:slug" element={<LinkedListVisualizer />} />
          </Routes>
        </Layout>
      </Router>
    </AuthProvider>
  );
}

export default App;


import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Materials from './pages/Materials';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        {/* Modules to implement */}
        <Route path="/products" element={<div>Products Placeholder</div>} />
        <Route path="/materials" element={<Materials />} />
      </Route>
    </Routes>
  );
}

export default App;

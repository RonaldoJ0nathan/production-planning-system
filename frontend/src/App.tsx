
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Materials from './pages/Materials';
import Products from './pages/Products';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        {/* Modules to implement */}
        <Route path="/products" element={<Products />} />
        <Route path="/materials" element={<Materials />} />
      </Route>
    </Routes>
  );
}

export default App;

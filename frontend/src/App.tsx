
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        {/* Modules to implement */}
        <Route path="/products" element={<Typography sx={{p:3}}>Products Placeholder</Typography>} />
        <Route path="/materials" element={<Typography sx={{p:3}}>Raw Materials Placeholder</Typography>} />
      </Route>
    </Routes>
  );
}

// Temporary inline import until files are created
import { Typography } from '@mui/material';

export default App;

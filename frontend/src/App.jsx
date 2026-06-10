import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import ClientesPage from './pages/ClientesPage';
import MetabolismoPage from './pages/MetabolismoPage';
import EntrenamientoPage from './pages/EntrenamientoPage';
import DietasPage from './pages/DietasPage';
import ReportesPage from './pages/ReportesPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/clientes" element={<ClientesPage />} />
        <Route path="/metabolismo" element={<MetabolismoPage />} />
        <Route path="/entrenamiento" element={<EntrenamientoPage />} />
        <Route path="/dietas" element={<DietasPage />} />
        <Route path="/reportes" element={<ReportesPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

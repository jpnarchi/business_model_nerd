import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, TrendingUp, DollarSign } from 'lucide-react';
import Overview from './pages/Overview';
import ModeloAjustable from './pages/ModeloAjustable';
import EgresosAnalisis from './pages/EgresosAnalisis';
import { FinancialProvider } from './context/FinancialContext';

const Navigation = () => {
  const location = useLocation();

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <h1 className="text-xl font-bold text-gray-800">Análisis Financiero</h1>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link
                to="/"
                className={`inline-flex items-center px-1 pt-1 text-sm font-medium ${
                  location.pathname === '/' 
                    ? 'text-gray-900 border-b-2 border-indigo-500'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                <LayoutDashboard className="w-4 h-4 mr-2" />
                Resumen
              </Link>
              <Link
                to="/modelo"
                className={`inline-flex items-center px-1 pt-1 text-sm font-medium ${
                  location.pathname === '/modelo'
                    ? 'text-gray-900 border-b-2 border-indigo-500'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                <TrendingUp className="w-4 h-4 mr-2" />
                Modelo de Ingresos
              </Link>
              <Link
                to="/egresos"
                className={`inline-flex items-center px-1 pt-1 text-sm font-medium ${
                  location.pathname === '/egresos'
                    ? 'text-gray-900 border-b-2 border-indigo-500'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                <DollarSign className="w-4 h-4 mr-2" />
                Análisis de Gastos
              </Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

function App() {
  return (
    <FinancialProvider>
      <Router>
        <div className="min-h-screen bg-gray-100">
          <Navigation />
          <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            <Routes>
              <Route path="/" element={<Overview />} />
              <Route path="/modelo" element={<ModeloAjustable />} />
              <Route path="/egresos" element={<EgresosAnalisis />} />
            </Routes>
          </main>
        </div>
      </Router>
    </FinancialProvider>
  );
}

export default App;
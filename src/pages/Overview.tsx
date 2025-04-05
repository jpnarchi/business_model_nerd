import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, ArrowDownRight, Users, DollarSign, TrendingUp, LineChart, Target } from 'lucide-react';
import { useFinancial } from '../context/FinancialContext';
import { ResponsiveContainer, ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import NetProfitSummary from '../components/NetProfitSummary';
import RevenueModelOverview from '../components/RevenueModelOverview';

const Overview = () => {
  const { monthlyViews, totalRevenue, totalExpenses, registeredUsers, paidUsers } = useFinancial();

  // Formatear moneda
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Formatear números grandes
  const formatNumber = (num: number) => {
    if (num >= 1_000_000) {
      return `${(num / 1_000_000).toFixed(1)}M`;
    }
    if (num >= 1_000) {
      return `${(num / 1_000).toFixed(1)}K`;
    }
    return num.toString();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Resumen Financiero</h2>
        <p className="text-gray-600">
          Análisis completo de proyecciones de ingresos y gestión de gastos para los próximos 12 meses.
        </p>
      </div>

      {/* Resumen de Beneficio Neto */}
      <NetProfitSummary />

      {/* Resumen del Modelo de Ingresos */}
      <RevenueModelOverview />

      {/* Métricas Clave */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-green-100 rounded">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <h3 className="text-gray-600 text-sm">Ingresos</h3>
          <p className="text-2xl font-bold text-gray-800">{formatCurrency(totalRevenue)}</p>
          <Link to="/modelo" className="text-sm text-blue-600 hover:text-blue-800 mt-2 inline-block">
            Ver modelo de ingresos →
          </Link>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-red-100 rounded">
              <LineChart className="w-6 h-6 text-red-600" />
            </div>
          </div>
          <h3 className="text-gray-600 text-sm">Gastos</h3>
          <p className="text-2xl font-bold text-gray-800">{formatCurrency(totalExpenses)}</p>
          <Link to="/egresos" className="text-sm text-blue-600 hover:text-blue-800 mt-2 inline-block">
            Ver análisis de gastos →
          </Link>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-blue-100 rounded">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <h3 className="text-gray-600 text-sm">Usuarios Registrados</h3>
          <p className="text-2xl font-bold text-gray-800">{formatNumber(registeredUsers)}</p>
          <Link to="/modelo" className="text-sm text-blue-600 hover:text-blue-800 mt-2 inline-block">
            Ver métricas de usuarios →
          </Link>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-purple-100 rounded">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <h3 className="text-gray-600 text-sm">Usuarios de Pago</h3>
          <p className="text-2xl font-bold text-gray-800">{formatNumber(paidUsers)}</p>
          <Link to="/modelo" className="text-sm text-blue-600 hover:text-blue-800 mt-2 inline-block">
            Ver métricas de conversión →
          </Link>
        </div>
      </div>

      {/* Información Adicional */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Insights Clave</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="p-4 bg-green-50 rounded-lg">
            <h4 className="font-semibold text-green-800 mb-2">Crecimiento de Ingresos</h4>
            <p className="text-sm text-green-600">
              Proyección de crecimiento mensual del 23.5% con tasas de conversión y retención de usuarios en aumento.
            </p>
          </div>
          <div className="p-4 bg-blue-50 rounded-lg">
            <h4 className="font-semibold text-blue-800 mb-2">Optimización de Costos</h4>
            <p className="text-sm text-blue-600">
              Reducción del 78% en costos de IA mediante la migración a Deepseek Chat.
            </p>
          </div>
          <div className="p-4 bg-purple-50 rounded-lg">
            <h4 className="font-semibold text-purple-800 mb-2">Métricas de Usuarios</h4>
            <p className="text-sm text-purple-600">
              Tasa de conversión del 5.42% con crecimiento del 28.3% en registro de usuarios.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Overview;
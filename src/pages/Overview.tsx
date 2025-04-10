import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, ArrowDownRight, Users, DollarSign, TrendingUp, LineChart, Target } from 'lucide-react';
import { useFinancial } from '../context/FinancialContext';
import { ResponsiveContainer, ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import NetProfitSummary from '../components/NetProfitSummary';
import RevenueModelOverview from '../components/RevenueModelOverview';

const Overview = () => {
  const { monthlyViews, totalRevenue, registeredUsers, paidUsers } = useFinancial();
  const totalExpenses = 157851.09; // Gasto total fijo
  const netProfit = totalRevenue - totalExpenses;
  const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

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
  const formatLargeNumber = (num: number) => {
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
          <p className="text-2xl font-bold text-gray-800">{formatLargeNumber(registeredUsers)}</p>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-purple-100 rounded">
              <Target className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <h3 className="text-gray-600 text-sm">Usuarios Pagados</h3>
          <p className="text-2xl font-bold text-gray-800">{formatLargeNumber(paidUsers)}</p>
        </div>
      </div>
    </div>
  );
};

export default Overview;
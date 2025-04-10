import React from 'react';
import { useFinancial } from '../context/FinancialContext';

const NetProfitSummary = () => {
  const { totalRevenue } = useFinancial();
  const totalExpenses = 157851.09; // Gasto total fijo
  const netProfit = totalRevenue - totalExpenses;
  const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  return (
    <div className="p-4 border border-gray-200 rounded-lg bg-white">
      <h2 className="text-lg font-semibold mb-4">Resumen Financiero</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-blue-50 rounded-lg">
          <div className="text-sm text-blue-600">Ingresos Totales</div>
          <div className="text-2xl font-bold text-blue-700">{formatCurrency(totalRevenue)}</div>
        </div>
        
        <div className="p-4 bg-red-50 rounded-lg">
          <div className="text-sm text-red-600">Gastos Totales</div>
          <div className="text-2xl font-bold text-red-700">{formatCurrency(totalExpenses)}</div>
        </div>
        
        <div className={`p-4 rounded-lg ${netProfit >= 0 ? 'bg-green-50' : 'bg-red-50'}`}>
          <div className={`text-sm ${netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>Beneficio Neto</div>
          <div className={`text-2xl font-bold ${netProfit >= 0 ? 'text-green-700' : 'text-red-700'}`}>
            {formatCurrency(netProfit)}
          </div>
          <div className={`text-sm mt-1 ${netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            Margen: {profitMargin.toFixed(1)}%
          </div>
        </div>
      </div>
    </div>
  );
};

export default NetProfitSummary;
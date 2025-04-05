import React from 'react';
import { useFinancial } from '../context/FinancialContext';

const NetProfitSummary = () => {
  const { totalRevenue, totalExpenses } = useFinancial();
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
      
      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-md font-semibold mb-2">Análisis Financiero</h3>
        <div className="text-sm text-gray-600 space-y-2">
          <p>
            <strong>Desglose de Ingresos:</strong> Los ingresos totales se calculan a partir de todas las conversiones de usuarios y pagos recurrentes en todos los niveles de precios.
          </p>
          <p>
            <strong>Categorías de Gastos:</strong> Los gastos principales incluyen costos del equipo de desarrollo ({((totalExpenses * 0.45).toFixed(1))}%), 
            gastos de marketing ({((totalExpenses * 0.35).toFixed(1))}%), y costos operativos ({((totalExpenses * 0.20).toFixed(1))}%).
          </p>
          <p>
            <strong>Análisis de Beneficios:</strong> El margen de beneficio actual del {profitMargin.toFixed(1)}% {
              profitMargin > 20 ? 'indica un modelo de negocio saludable con buen potencial de escalabilidad.' :
              profitMargin > 0 ? 'sugiere una operación sostenible con margen para optimización.' :
              'indica la necesidad de optimización de costos y estrategias de crecimiento de ingresos.'
            }
          </p>
        </div>
      </div>
    </div>
  );
};

export default NetProfitSummary;
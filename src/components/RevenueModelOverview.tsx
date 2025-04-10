import React, { useState, useEffect } from 'react';
import { ResponsiveContainer, ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { useFinancial } from '../context/FinancialContext';

const RevenueModelOverview = () => {
  const VALOR_CONVERSION = 10.11;
  
  // Parámetros para la función exponencial de vistas
  const [expA, setExpA] = useState(150000);
  const [expB, setExpB] = useState(1.20);
  const [expC, setExpC] = useState(-1.1);
  const [expD, setExpD] = useState(-30000);
  
  // Parámetros para la función logarítmica de tasa de conversión
  const [logA, setLogA] = useState(3.0);
  const [logB, setLogB] = useState(3.0);
  const [logC, setLogC] = useState(-0.5);
  const [logD, setLogD] = useState(-1.9);
  
  const datosBase = [
    { mes: 1, vistas: 100801, tasaRegistro: 5.42, tasaConversion: 0.60 },
    { mes: 2, vistas: 200000, tasaRegistro: 5.42, tasaConversion: 1.20 }
  ];
  
  const [datosModelados, setDatosModelados] = useState([]);
  const [netProfitBreakdown, setNetProfitBreakdown] = useState({
    totalRevenue: 0,
    expenses: {
      development: 0,
      marketing: 0,
      infrastructure: 0,
      tokens: 0
    },
    netProfit: 0
  });
  
  const { setTotalRevenue, setTotalExpenses, setRegisteredUsers, setPaidUsers } = useFinancial();
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatLargeNumber = (value: number) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
      return `${(value / 1000).toFixed(0)}K`;
    }
    return value;
  };

  // Función para configurar parámetros preestablecidos "Proyección Actual"
  const aplicarConfiguracionActual = () => {
    setExpA(150000);
    setExpB(1.20);
    setExpC(-1.1);
    setExpD(-30000);
    
    setLogA(3.0);
    setLogB(3.0);
    setLogC(-0.5);
    setLogD(-1.9);
  };

  // Función para configurar parámetros preestablecidos "Con Capital"
  const aplicarConfiguracionConCapital = () => {
    setExpA(190000);
    setExpB(1.40);
    setExpC(0.2);
    setExpD(-40000);
    
    setLogA(3.0);
    setLogB(2.7);
    setLogC(-0.2);
    setLogD(-0.4);
  };

  useEffect(() => {
    const datosCompletos = [];
    let totalRevenue = 0;
    let totalExpenses = {
      development: 0,
      marketing: 0,
      infrastructure: 0,
      tokens: 0
    };
    let totalRegisteredUsers = 0;
    let totalPaidUsers = 0;
    
    // Procesar los primeros 2 meses (datos base)
    datosBase.forEach((datoBase, index) => {
      const usuariosRegistrados = Math.round(datoBase.vistas * datoBase.tasaRegistro / 100);
      const usuariosConvertidos = Math.round(usuariosRegistrados * datoBase.tasaConversion / 100);
      const porcentajeRecompras = index === 0 ? 0 : 10;
      const recompras = index === 0 ? 0 : Math.round(datosCompletos[0].usuariosConvertidos * porcentajeRecompras / 100);
      const totalConversiones = usuariosConvertidos + recompras;
      const ingresos = totalConversiones * VALOR_CONVERSION;
      
      totalRegisteredUsers += usuariosRegistrados;
      totalPaidUsers += usuariosConvertidos;
      
      const costoDesarrollo = (index + 1) * 1500;
      const costoMarketing = ingresos * (0.60 - ((0.60 - 0.35) * index / 11));
      const costoInfraestructura = 150 * Math.pow(1.1, index);
      const costoTokens = usuariosRegistrados * 0.037;
      
      totalRevenue += ingresos;
      totalExpenses.development += costoDesarrollo;
      totalExpenses.marketing += costoMarketing;
      totalExpenses.infrastructure += costoInfraestructura;
      totalExpenses.tokens += costoTokens;
      
      datosCompletos.push({
        mes: index + 1,
        vistas: datoBase.vistas,
        usuariosRegistrados,
        usuariosConvertidos,
        porcentajeRecompras,
        recompras,
        totalConversiones,
        ingresos,
        costoDesarrollo,
        costoMarketing,
        costoInfraestructura,
        costoTokens,
        totalGastos: costoDesarrollo + costoMarketing + costoInfraestructura + costoTokens,
        netProfit: ingresos - (costoDesarrollo + costoMarketing + costoInfraestructura + costoTokens)
      });
    });
    
    // Generar datos para los meses 3 al 12
    for (let mes = 3; mes <= 12; mes++) {
      // Aplicar función exponencial a las vistas
      const vistas = Math.round(expA * Math.pow(expB, (mes - expC)) + expD);
      
      // Tasa de registro con incremento lineal de 5.42% a 7.11%
      const tasaRegistro = 5.42 + ((7.11 - 5.42) / 11) * (mes - 1);
      
      // Aplicar función logarítmica a la tasa de conversión
      let tasaConversion = 0;
      if (mes - logC > 0) {
        tasaConversion = logA * (Math.log(mes - logC) / Math.log(logB)) + logD;
        tasaConversion = Math.max(0, Math.min(100, tasaConversion));
      }
      
      const usuariosRegistrados = Math.round(vistas * tasaRegistro / 100);
      const usuariosConvertidos = Math.round(usuariosRegistrados * tasaConversion / 100);
      
      totalRegisteredUsers += usuariosRegistrados;
      totalPaidUsers += usuariosConvertidos;
      
      // Porcentaje de recompras (incremento lineal de 10% a 30%)
      const porcentajeRecompras = 10 + ((30 - 10) / 10) * (mes - 2);
      const recompras = Math.round(datosCompletos[mes-2].usuariosConvertidos * porcentajeRecompras / 100);
      const totalConversiones = usuariosConvertidos + recompras;
      
      const ingresos = totalConversiones * VALOR_CONVERSION;
      
      const costoDesarrollo = mes * 1500;
      const costoMarketing = ingresos * (0.60 - ((0.60 - 0.35) * (mes - 1) / 11));
      const costoInfraestructura = 150 * Math.pow(1.1, mes - 1);
      const costoTokens = usuariosRegistrados * 0.037;
      
      totalRevenue += ingresos;
      totalExpenses.development += costoDesarrollo;
      totalExpenses.marketing += costoMarketing;
      totalExpenses.infrastructure += costoInfraestructura;
      totalExpenses.tokens += costoTokens;
      
      datosCompletos.push({
        mes,
        vistas,
        usuariosRegistrados,
        usuariosConvertidos,
        porcentajeRecompras,
        recompras,
        totalConversiones,
        ingresos,
        costoDesarrollo,
        costoMarketing,
        costoInfraestructura,
        costoTokens,
        totalGastos: costoDesarrollo + costoMarketing + costoInfraestructura + costoTokens,
        netProfit: ingresos - (costoDesarrollo + costoMarketing + costoInfraestructura + costoTokens)
      });
    }
    
    setDatosModelados(datosCompletos);
    setNetProfitBreakdown({
      totalRevenue,
      expenses: totalExpenses,
      netProfit: totalRevenue - Object.values(totalExpenses).reduce((a, b) => a + b, 0)
    });
    
    setTotalRevenue(totalRevenue);
    setTotalExpenses(Object.values(totalExpenses).reduce((a, b) => a + b, 0));
    setRegisteredUsers(totalRegisteredUsers);
    setPaidUsers(totalPaidUsers);
  }, [expA, expB, expC, expD, logA, logB, logC, logD, setTotalRevenue, setTotalExpenses, setRegisteredUsers, setPaidUsers]);

  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Proyección de Ingresos y Beneficios</h3>
          <div className="flex gap-4">
            <button 
              onClick={aplicarConfiguracionActual}
              className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded shadow"
            >
              Proyección Actual
            </button>
            <button 
              onClick={aplicarConfiguracionConCapital}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded shadow"
            >
              Con Capital
            </button>
          </div>
        </div>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart 
              data={datosModelados}
              margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="mes" 
                label={{ value: 'Mes', position: 'insideBottom', offset: -10 }}
              />
              <YAxis 
                yAxisId="left"
                orientation="left"
                label={{ value: 'Ingresos y Gastos ($)', angle: -90, position: 'insideLeft', offset: 10 }}
                tickFormatter={(value) => `$${(value/1000).toFixed(0)}K`}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                label={{ value: 'Vistas', angle: 90, position: 'insideRight', offset: 10 }}
                tickFormatter={formatLargeNumber}
                domain={[0, 'auto']}
              />
              <Tooltip 
                formatter={(value, name) => {
                  if (name === "vistas") return [formatLargeNumber(value as number), "Vistas"];
                  if (name === "ingresos") return [formatCurrency(value as number), "Ingresos"];
                  if (name === "totalGastos") return [formatCurrency(value as number), "Gastos Totales"];
                  if (name === "netProfit") return [formatCurrency(value as number), "Beneficio Neto"];
                  return [value, name];
                }}
                labelFormatter={(label) => `Mes ${label}`}
              />
              <Legend />
              <Bar 
                dataKey="vistas" 
                name="Vistas" 
                fill="#94A3B8" 
                yAxisId="right"
                opacity={0.7}
              />
              <Bar 
                dataKey="ingresos" 
                name="Ingresos" 
                fill="#10B981" 
                yAxisId="left"
              />
              <Bar 
                dataKey="totalGastos" 
                name="Gastos Totales" 
                fill="#EF4444" 
                yAxisId="left"
              />
              <Line 
                type="monotone" 
                dataKey="netProfit" 
                name="Beneficio Neto" 
                stroke="#6366F1" 
                strokeWidth={2}
                yAxisId="left"
                dot={{ r: 4 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Desglose Anual de Beneficios</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Ingresos Totales</span>
              <span className="font-semibold text-green-600">{formatCurrency(netProfitBreakdown.totalRevenue)}</span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">Equipo de Desarrollo</span>
                <span className="text-red-600">-{formatCurrency(31500)}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">Marketing</span>
                <span className="text-red-600">-{formatCurrency(80262.37)}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">Infraestructura</span>
                <span className="text-red-600">-{formatCurrency(3207.64)}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">Tokens IA</span>
                <span className="text-red-600">-{formatCurrency(42881.07)}</span>
              </div>
            </div>
            <div className="pt-4 border-t">
              <div className="flex justify-between items-center">
                <span className="font-medium">Beneficio Neto</span>
                <span className={`font-bold ${netProfitBreakdown.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(157851.09)}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Distribución de Gastos</h3>
          <div className="space-y-4">
            {Object.entries(netProfitBreakdown.expenses).map(([category, amount]) => {
              const percentage = (amount / Object.values(netProfitBreakdown.expenses).reduce((a, b) => a + b, 0)) * 100;
              const categoryNames = {
                development: 'Desarrollo',
                marketing: 'Marketing',
                infrastructure: 'Infraestructura',
                tokens: 'Tokens IA'
              };
              return (
                <div key={category} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>{categoryNames[category as keyof typeof categoryNames]}</span>
                    <span>{percentage.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RevenueModelOverview;
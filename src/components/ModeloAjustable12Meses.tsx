import React, { useState, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ComposedChart, PieChart, Pie, Cell } from 'recharts';

const ModeloAjustable12Meses = () => {
  // Constante de valor promedio por conversión
  const VALOR_CONVERSION = 10.11;
  
  // Modos de visualización
  const [modoGrafico, setModoGrafico] = useState('conversion'); // 'conversion', 'ingresos', 'usuarios'
  
  // Datos iniciales (2 primeros meses fijos, los demás se calculan con los modelos)
  const datosBase = [
    { mes: 1, vistas: 100801, tasaRegistro: 5.42, tasaConversion: 0.60 },
    { mes: 2, vistas: 200000, tasaRegistro: 5.42, tasaConversion: 1.20 }
  ];
  
  // Parámetros para la función exponencial de vistas: f(x) = a * (b^(x - c)) + d
  const [expA, setExpA] = useState(150000);
  const [expB, setExpB] = useState(1.20);
  const [expC, setExpC] = useState(-1.1);
  const [expD, setExpD] = useState(-30000);
  
  // Parámetros para la función logarítmica de tasa de conversión: f(x) = a * log_b(x - c) + d
  const [logA, setLogA] = useState(3.0);
  const [logB, setLogB] = useState(3.0);
  const [logC, setLogC] = useState(-0.5);
  const [logD, setLogD] = useState(-1.9);
  
  // Estado para almacenar los datos modelados
  const [datosModelados, setDatosModelados] = useState([]);
  
  // Procesar los datos y aplicar los modelos
  useEffect(() => {
    const datosCompletos = [];
    
    // Agregar los primeros 2 meses (datos base)
    datosBase.forEach((datoBase, index) => {
      const usuariosRegistrados = Math.round(datoBase.vistas * datoBase.tasaRegistro / 100);
      const usuariosConvertidos = Math.round(usuariosRegistrados * datoBase.tasaConversion / 100);
      
      // Porcentaje de recompras (0% para el primer mes)
      const porcentajeRecompras = index === 0 ? 0 : 10; // 10% para el segundo mes
      
      // Recompras: para el mes 2, calcular basado en las conversiones del mes 1
      let recompras = 0;
      if (index === 0) {
        recompras = 0; // Primer mes siempre es 0
      } else {
        // Para el mes 2, necesitamos las conversiones del mes 1
        if (index === 1) {
          // Calcular conversiones del mes 1 (primer elemento de datosBase)
          const usuariosConvertidosMes1 = Math.round(datosBase[0].vistas * datosBase[0].tasaRegistro / 100 * datosBase[0].tasaConversion / 100);
          recompras = Math.round(usuariosConvertidosMes1 * porcentajeRecompras / 100);
        } else {
          recompras = Math.round(datosCompletos[index-1].usuariosConvertidos * porcentajeRecompras / 100);
        }
      }
      
      // Total de conversiones (nuevos + recompras)
      const totalConversiones = usuariosConvertidos + recompras;
      
      // Ingresos basados en el total de conversiones
      const ingresos = totalConversiones * VALOR_CONVERSION;
      
      datosCompletos.push({
        ...datoBase,
        usuariosRegistrados,
        usuariosConvertidos,
        porcentajeRecompras,
        recompras,
        totalConversiones,
        ingresos
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
      
      // Porcentaje de recompras (incremento lineal de 10% a 30% del mes 2 al 12)
      const porcentajeRecompras = 10 + ((30 - 10) / 10) * (mes - 2);
      
      // Calcular usuarios y conversiones
      const usuariosRegistrados = Math.round(vistas * tasaRegistro / 100);
      const usuariosConvertidos = Math.round(usuariosRegistrados * tasaConversion / 100);
      
      // Calcular recompras basadas en el mes anterior
      const recompras = Math.round(datosCompletos[mes-2].usuariosConvertidos * porcentajeRecompras / 100);
      
      // Total de conversiones (nuevos + recompras)
      const totalConversiones = usuariosConvertidos + recompras;
      
      // Ingresos basados en el total de conversiones
      const ingresos = totalConversiones * VALOR_CONVERSION;
      
      datosCompletos.push({
        mes,
        vistas,
        tasaRegistro,
        tasaConversion,
        usuariosRegistrados,
        usuariosConvertidos,
        porcentajeRecompras,
        recompras,
        totalConversiones,
        ingresos
      });
    }
    
    setDatosModelados(datosCompletos);
  }, [expA, expB, expC, expD, logA, logB, logC, logD]);
  
  // Calcular totales
  const calcularTotales = () => {
    return {
      vistas: datosModelados.reduce((sum, d) => sum + d.vistas, 0),
      usuariosRegistrados: datosModelados.reduce((sum, d) => sum + d.usuariosRegistrados, 0),
      usuariosConvertidos: datosModelados.reduce((sum, d) => sum + d.usuariosConvertidos, 0),
      recompras: datosModelados.reduce((sum, d) => sum + d.recompras, 0),
      totalConversiones: datosModelados.reduce((sum, d) => sum + d.totalConversiones, 0),
      ingresos: datosModelados.reduce((sum, d) => sum + d.ingresos, 0)
    };
  };
  
  const totales = calcularTotales();
  
  // Formatear número
  const formatNumero = (numero) => {
    if (numero === null || numero === undefined) return 'N/A';
    
    if (numero >= 1000000) {
      return (numero / 1000000).toFixed(2) + 'M';
    } else if (numero >= 1000) {
      return (numero / 1000).toFixed(1) + 'K';
    } else {
      return numero.toFixed(0);
    }
  };
  
  // Formatear dinero
  const formatDinero = (valor) => {
    return '$' + valor.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };
  
  // Formatear porcentaje
  const formatPorcentaje = (valor) => {
    return valor.toFixed(2) + '%';
  };
  
  // Función para configurar parámetros preestablecidos "Proyección Actual"
  const aplicarConfiguracionActual = () => {
    // Parámetros para vistas
    setExpA(150000);
    setExpB(1.20);
    setExpC(-1.1);
    setExpD(-30000);
    
    // Parámetros para conversión
    setLogA(3.0);
    setLogB(3.0);
    setLogC(-0.5);
    setLogD(-1.9);
  };

  // Función para configurar parámetros preestablecidos "Con Capital"
  const aplicarConfiguracionConCapital = () => {
    // Parámetros para vistas
    setExpA(190000);
    setExpB(1.40);
    setExpC(0.2);
    setExpD(-40000);
    
    // Parámetros para conversión
    setLogA(3.0);
    setLogB(2.7);
    setLogC(-0.2);
    setLogD(-0.4);
  };
  
  return (
    <div className="flex flex-col gap-6 p-4 bg-gray-50 rounded-lg">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Modelo de Conversión Ajustable - 12 Meses</h1>
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
      
      {/* Panel de control */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 border border-gray-200 rounded-lg bg-white">
          <h2 className="text-lg font-semibold mb-3">Configuración del Modelo</h2>
          
          <div className="mb-4">
            <div className="mb-2">
              <label className="block text-sm font-medium">Selector de vista:</label>
              <div className="grid grid-cols-3 gap-2 mt-1">
                <button 
                  className={`px-2 py-1 text-xs rounded ${modoGrafico === 'conversion' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                  onClick={() => setModoGrafico('conversion')}
                >
                  Vistas y Conversión
                </button>
                <button 
                  className={`px-2 py-1 text-xs rounded ${modoGrafico === 'usuarios' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                  onClick={() => setModoGrafico('usuarios')}
                >
                  Usuarios
                </button>
                <button 
                  className={`px-2 py-1 text-xs rounded ${modoGrafico === 'ingresos' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                  onClick={() => setModoGrafico('ingresos')}
                >
                  Ingresos
                </button>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 gap-4">
            <div>
              <h3 className="text-md font-medium mb-2">Modelo Exponencial para Vistas</h3>
              <p className="text-xs font-mono mb-2">
                f(t) = {expA.toLocaleString()} × ({expB.toFixed(2)}<sup>t - {expC}</sup>) + {expD.toLocaleString()}
              </p>
              
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs">a: {expA.toLocaleString()}</label>
                  <input 
                    type="range" 
                    min="10000" 
                    max="200000" 
                    step="10000" 
                    value={expA} 
                    onChange={(e) => setExpA(parseFloat(e.target.value))}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-xs">b: {expB.toFixed(2)}</label>
                  <input 
                    type="range" 
                    min="0.1" 
                    max="2" 
                    step="0.1" 
                    value={expB} 
                    onChange={(e) => setExpB(parseFloat(e.target.value))}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-xs">c: {expC.toFixed(1)}</label>
                  <input 
                    type="range" 
                    min="-2" 
                    max="2" 
                    step="0.1" 
                    value={expC} 
                    onChange={(e) => setExpC(parseFloat(e.target.value))}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-xs">d: {expD.toLocaleString()}</label>
                  <input 
                    type="range" 
                    min="-100000" 
                    max="100000" 
                    step="10000" 
                    value={expD} 
                    onChange={(e) => setExpD(parseFloat(e.target.value))}
                    className="w-full"
                  />
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-md font-medium mb-2">Tasa de Registro</h3>
              <p className="text-xs font-mono mb-2">
                Incremento lineal de 5.42% a 7.11%
              </p>
              
              <div className="p-3 bg-gray-100 rounded text-sm">
                <p>La tasa de registro aumenta linealmente desde 5.42% en el mes 1 hasta 7.11% en el mes 12.</p>
              </div>
            </div>
            
            <div>
              <h3 className="text-md font-medium mb-2">Modelo Logarítmico para Tasa de Conversión</h3>
              <p className="text-xs font-mono mb-2">
                f(t) = {logA.toFixed(1)} × log<sub>{logB.toFixed(1)}</sub>(t - {logC.toFixed(1)}) + {logD.toFixed(1)}
              </p>
              
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs">a: {logA.toFixed(1)}</label>
                  <input 
                    type="range" 
                    min="0.1" 
                    max="10" 
                    step="0.1" 
                    value={logA} 
                    onChange={(e) => setLogA(parseFloat(e.target.value))}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-xs">b: {logB.toFixed(1)}</label>
                  <input 
                    type="range" 
                    min="1.1" 
                    max="10" 
                    step="0.1" 
                    value={logB} 
                    onChange={(e) => setLogB(parseFloat(e.target.value))}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-xs">c: {logC.toFixed(1)}</label>
                  <input 
                    type="range" 
                    min="-1" 
                    max="0.9" 
                    step="0.1" 
                    value={logC} 
                    onChange={(e) => setLogC(parseFloat(e.target.value))}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-xs">d: {logD.toFixed(1)}</label>
                  <input 
                    type="range" 
                    min="-5" 
                    max="5" 
                    step="0.1" 
                    value={logD} 
                    onChange={(e) => setLogD(parseFloat(e.target.value))}
                    className="w-full"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Gráfico principal según modo seleccionado */}
        <div className="p-4 border border-gray-200 rounded-lg bg-white">
          <h3 className="text-sm font-medium mb-1">
            {modoGrafico === 'conversion' ? 'Vistas y Tasa de Conversión' : 
             modoGrafico === 'usuarios' ? 'Usuarios por Mes' : 'Ingresos por Mes'}
          </h3>
          
          <ResponsiveContainer width="100%" height={300}>
            {modoGrafico === 'conversion' && (
              <ComposedChart data={datosModelados} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mes" />
                <YAxis 
                  yAxisId="left" 
                  orientation="left" 
                  tickFormatter={(value) => `${value}%`}
                />
                <YAxis 
                  yAxisId="right" 
                  orientation="right"
                  domain={[0, 'dataMax']}
                  tickFormatter={(value) => formatNumero(value)}
                />
                <Tooltip 
                  formatter={(value, name) => {
                    if (name === "tasaConversion") return [`${value.toFixed(2)}%`, "Tasa de Conversión"];
                    if (name === "vistas") return [formatNumero(value), "Vistas"];
                    return [value, name];
                  }}
                  labelFormatter={(label) => `Mes ${label}`}
                />
                <Legend />
                <Line 
                  yAxisId="left"
                  type="monotone" 
                  dataKey="tasaConversion" 
                  name="Tasa de Conversión" 
                  stroke="#82ca9d" 
                  strokeWidth={2}
                  dot={{ r: 3 }} 
                  activeDot={{ r: 6 }}
                />
                <Bar
                  yAxisId="right"
                  dataKey="vistas" 
                  name="Vistas" 
                  fill="#8884d8"
                  opacity={0.7} 
                />
              </ComposedChart>
            )}
            
            {modoGrafico === 'usuarios' && (
              <ComposedChart data={datosModelados} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mes" />
                <YAxis yAxisId="left" orientation="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip 
                  formatter={(value, name) => {
                    if (name === "vistas") return [formatNumero(value), "Vistas"];
                    if (name === "usuariosRegistrados") return [formatNumero(value), "Usuarios Registrados"];
                    if (name === "usuariosConvertidos") return [formatNumero(value), "Usuarios Convertidos"];
                    return [value, name];
                  }}
                  labelFormatter={(label) => `Mes ${label}`}
                />
                <Legend />
                <Bar 
                  yAxisId="left" 
                  dataKey="vistas" 
                  name="Vistas" 
                  fill="#8884d8" 
                />
                <Line 
                  yAxisId="right" 
                  type="monotone" 
                  dataKey="usuariosRegistrados" 
                  name="Usuarios Registrados" 
                  stroke="#82ca9d" 
                  strokeWidth={2}
                  dot={{ r: 3 }} 
                />
                <Line 
                  yAxisId="right" 
                  type="monotone" 
                  dataKey="usuariosConvertidos" 
                  name="Usuarios Convertidos" 
                  stroke="#ff7300" 
                  strokeWidth={2}
                  dot={{ r: 3 }} 
                />
              </ComposedChart>
            )}
            
            {modoGrafico === 'ingresos' && (
              <ComposedChart data={datosModelados} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mes" />
                <YAxis 
                  yAxisId="left" 
                  orientation="left"
                  tickFormatter={(value) => `$${(value/1000).toFixed(0)}K`}
                />
                <YAxis 
                  yAxisId="right" 
                  orientation="right" 
                  tickFormatter={(value) => value}
                />
                <Tooltip 
                  formatter={(value, name) => {
                    if (name === "ingresos") return [formatDinero(value), "Ingresos"];
                    if (name === "usuariosConvertidos") return [formatNumero(value), "Usuarios Convertidos"];
                    return [value, name];
                  }}
                  labelFormatter={(label) => `Mes ${label}`}
                />
                <Legend />
                <Bar 
                  yAxisId="left" 
                  dataKey="ingresos" 
                  name="Ingresos" 
                  fill="#82ca9d"
                />
                <Line 
                  yAxisId="right" 
                  type="monotone" 
                  dataKey="usuariosConvertidos" 
                  name="Usuarios Convertidos" 
                  stroke="#ff7300" 
                  strokeWidth={2}
                  dot={{ r: 3 }} 
                />
              </ComposedChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>
      
      {/* Tabla de datos completos */}
      <div className="p-4 border border-gray-200 rounded-lg bg-white overflow-x-auto">
        <h2 className="text-lg font-semibold mb-3">Proyección 12 Meses</h2>
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 text-left">Mes</th>
              <th className="p-2 text-right">Vistas</th>
              <th className="p-2 text-right">% Reg.</th>
              <th className="p-2 text-right">Usuarios Reg.</th>
              <th className="p-2 text-right">% Conv.</th>
              <th className="p-2 text-right">Usuarios Conv.</th>
              <th className="p-2 text-right">% Recompras</th>
              <th className="p-2 text-right">Recompras</th>
              <th className="p-2 text-right">Total Conv.</th>
              <th className="p-2 text-right">Ingresos</th>
            </tr>
          </thead>
          <tbody>
            {datosModelados.map((dato, index) => (
              <tr 
                key={dato.mes} 
                className={`border-b ${index < 2 ? 'bg-blue-50' : ''}`}
              >
                <td className="p-2">{dato.mes}</td>
                <td className="p-2 text-right">{dato.vistas.toLocaleString()}</td>
                <td className="p-2 text-right">{formatPorcentaje(dato.tasaRegistro)}</td>
                <td className="p-2 text-right">{dato.usuariosRegistrados.toLocaleString()}</td>
                <td className="p-2 text-right">{formatPorcentaje(dato.tasaConversion)}</td>
                <td className="p-2 text-right">{dato.usuariosConvertidos.toLocaleString()}</td>
                <td className="p-2 text-right">{formatPorcentaje(dato.porcentajeRecompras)}</td>
                <td className="p-2 text-right">{dato.recompras.toLocaleString()}</td>
                <td className="p-2 text-right">{dato.totalConversiones.toLocaleString()}</td>
                <td className="p-2 text-right">{formatDinero(dato.ingresos)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-gray-200 font-medium">
            <tr>
              <td className="p-2">TOTAL 12 MESES</td>
              <td className="p-2 text-right">{totales.vistas.toLocaleString()}</td>
              <td className="p-2 text-right">-</td>
              <td className="p-2 text-right">{totales.usuariosRegistrados.toLocaleString()}</td>
              <td className="p-2 text-right">-</td>
              <td className="p-2 text-right">{totales.usuariosConvertidos.toLocaleString()}</td>
              <td className="p-2 text-right">-</td>
              <td className="p-2 text-right">{totales.recompras.toLocaleString()}</td>
              <td className="p-2 text-right">{totales.totalConversiones.toLocaleString()}</td>
              <td className="p-2 text-right">{formatDinero(totales.ingresos)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
      
      {/* Resumen de métricas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 border border-gray-200 rounded-lg bg-white">
          <div className="text-xs text-gray-500">Total Vistas</div>
          <div className="text-2xl font-bold">{formatNumero(totales.vistas)}</div>
        </div>
        <div className="p-4 border border-gray-200 rounded-lg bg-white">
          <div className="text-xs text-gray-500">Total Usuarios Registrados</div>
          <div className="text-2xl font-bold">{formatNumero(totales.usuariosRegistrados)}</div>
        </div>
        <div className="p-4 border border-gray-200 rounded-lg bg-white">
          <div className="text-xs text-gray-500">Total Conversiones + Recompras</div>
          <div className="text-2xl font-bold">{formatNumero(totales.totalConversiones)}</div>
        </div>
        <div className="p-4 border border-gray-200 rounded-lg bg-white">
          <div className="text-xs text-gray-500">Total Ingresos</div>
          <div className="text-2xl font-bold text-green-600">{formatDinero(totales.ingresos)}</div>
        </div>
      </div>
      
      {/* Distribución de planes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 border border-gray-200 rounded-lg bg-white">
          <h2 className="text-lg font-semibold mb-3">Distribución de Planes</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={[
                  { name: 'Plan $5', value: 58.62, color: '#1e7a5a' },
                  { name: 'Plan $10', value: 18.75, color: '#2e9d78' },
                  { name: 'Plan $20', value: 15.63, color: '#43c69f' },
                  { name: 'Plan $50', value: 6.25, color: '#7de2c3' }
                ]}
                cx="50%"
                cy="50%"
                outerRadius={100}
                dataKey="value"
                nameKey="name"
                label={({name, percent}) => `${name}: ${(percent * 100).toFixed(1)}%`}
              >
                {
                  [
                    { name: 'Plan $5', value: 58.62, color: '#1e7a5a' },
                    { name: 'Plan $10', value: 18.75, color: '#2e9d78' },
                    { name: 'Plan $20', value: 15.63, color: '#43c69f' },
                    { name: 'Plan $50', value: 6.25, color: '#7de2c3' }
                  ].map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))
                }
              </Pie>
              <Tooltip formatter={(value) => `${value}%`} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
        
        <div className="p-4 border border-gray-200 rounded-lg bg-white">
          <h2 className="text-lg font-semibold mb-3">Desglose de Ingresos por Plan</h2>
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2 text-left">Plan</th>
                <th className="p-2 text-right">Porcentaje</th>
                <th className="p-2 text-right">Usuarios</th>
                <th className="p-2 text-right">Ingresos</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b">
                <td className="p-2">
                  <div className="flex items-center">
                    <div className="w-3 h-3 mr-2 rounded-full" style={{ backgroundColor: '#1e7a5a' }}></div>
                    Plan $5
                  </div>
                </td>
                <td className="p-2 text-right">58.62%</td>
                <td className="p-2 text-right">{formatNumero(totales.usuariosConvertidos * 0.5862)}</td>
                <td className="p-2 text-right">{formatDinero(totales.usuariosConvertidos * 0.5862 * 5)}</td>
              </tr>
              <tr className="border-b">
                <td className="p-2">
                  <div className="flex items-center">
                    <div className="w-3 h-3 mr-2 rounded-full" style={{ backgroundColor: '#2e9d78' }}></div>
                    Plan $10
                  </div>
                </td>
                <td className="p-2 text-right">18.75%</td>
                <td className="p-2 text-right">{formatNumero(totales.usuariosConvertidos * 0.1875)}</td>
                <td className="p-2 text-right">{formatDinero(totales.usuariosConvertidos * 0.1875 * 10)}</td>
              </tr>
              <tr className="border-b">
                <td className="p-2">
                  <div className="flex items-center">
                    <div className="w-3 h-3 mr-2 rounded-full" style={{ backgroundColor: '#43c69f' }}></div>
                    Plan $20
                  </div>
                </td>
                <td className="p-2 text-right">15.63%</td>
                <td className="p-2 text-right">{formatNumero(totales.usuariosConvertidos * 0.1563)}</td>
                <td className="p-2 text-right">{formatDinero(totales.usuariosConvertidos * 0.1563 * 20)}</td>
              </tr>
              <tr className="border-b">
                <td className="p-2">
                  <div className="flex items-center">
                    <div className="w-3 h-3 mr-2 rounded-full" style={{ backgroundColor: '#7de2c3' }}></div>
                    Plan $50
                  </div>
                </td>
                <td className="p-2 text-right">6.25%</td>
                <td className="p-2 text-right">{formatNumero(totales.usuariosConvertidos * 0.0625)}</td>
                <td className="p-2 text-right">{formatDinero(totales.usuariosConvertidos * 0.0625 * 50)}</td>
              </tr>
            </tbody>
            <tfoot className="bg-gray-200 font-medium">
              <tr>
                <td className="p-2">TOTAL</td>
                <td className="p-2 text-right">100%</td>
                <td className="p-2 text-right">{formatNumero(totales.usuariosConvertidos)}</td>
                <td className="p-2 text-right">{formatDinero(
                  totales.usuariosConvertidos * 0.5862 * 5 +
                  totales.usuariosConvertidos * 0.1875 * 10 +
                  totales.usuariosConvertidos * 0.1563 * 20 +
                  totales.usuariosConvertidos * 0.0625 * 50
                )}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
      
      {/* Notas explicativas */}
      <div className="p-4 border border-gray-200 rounded-lg bg-blue-50">
        <h3 className="text-md font-semibold mb-2">Notas sobre el Modelo</h3>
        <ul className="text-sm space-y-1 pl-5 list-disc">
          <li>Los <strong>meses 1 y 2</strong> tienen valores fijos con tasas de conversión de 0.6% y 1.2% respectivamente</li>
          <li>Los <strong>meses 3 al 12</strong> se calculan con los modelos matemáticos según los parámetros ajustables</li>
          <li>Las <strong>vistas</strong> siguen un modelo de crecimiento exponencial</li>
          <li>Se incluye un <strong>porcentaje de recompras</strong> que comienza en 0% en el primer mes, 10% en el segundo mes, y aumenta gradualmente hasta 30% en el mes 12</li>
          <li>Los <strong>ingresos</strong> se calculan multiplicando la suma de conversiones nuevas y recompras por el valor promedio</li>
          <li>El <strong>total de conversiones</strong> incluye tanto las nuevas conversiones como las recompras de cada mes</li>
          <li>La <strong>tasa de conversión</strong> sigue un modelo de crecimiento logarítmico</li>
          <li>El <strong>valor promedio por conversión</strong> es de {formatDinero(VALOR_CONVERSION)}</li>
          <li>Los <strong>ingresos</strong> se calculan multiplicando las conversiones por el valor promedio</li>
          <li>Ajusta los parámetros para encontrar el modelo que mejor refleje la tendencia deseada</li>
        </ul>
      </div>
    </div>
  );
};

export default ModeloAjustable12Meses;
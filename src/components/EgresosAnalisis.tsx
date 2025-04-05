import React, { useState, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ComposedChart } from 'recharts';
import { useFinancial } from '../context/FinancialContext';

const EgresosAnalisis = () => {
  // Proyecciones predefinidas con los datos actualizados de las imágenes proporcionadas
  const proyecciones = {
    actual: {
      // Datos de la Imagen 1 - Proyección Actual
      vistas: [100801, 200000, 286763, 350116, 426139, 517366, 626840, 758208, 915849, 1105019, 1332023, 1604427],
      usuariosRegistrados: [5463, 10840, 16424, 20590, 25716, 32016, 39753, 49249, 60896, 75171, 92660, 114075],
      usuariosConvertidos: [33, 130, 250, 454, 709, 1028, 1432, 1942, 2587, 3398, 4419, 5700],
      tasaRegistro: 5.42,
      tasaConversion: 5
    },
    conCapital: {
      // Datos de la Imagen 2 - Con Capital
      vistas: [100801, 200000, 447430, 642402, 915362, 1297507, 1832510, 2581515, 3630120, 5098169, 7153436, 10030810],
      usuariosRegistrados: [5463, 10840, 25626, 37779, 55238, 80292, 116214, 167681, 241370, 346815, 497619, 713191],
      usuariosConvertidos: [33, 130, 798, 1486, 2530, 4104, 6464, 9986, 15213, 22940, 34321, 51031],
      tasaRegistro: 7.11,
      tasaConversion: 8
    }
  };

  // Estado para los datos de proyección
  const [proyeccion, setProyeccion] = useState('actual');

  // Costos por millón de tokens
  const DEEPSEEK_COSTS = {
    input: {
      standard: 0.27,
      discount: 0.135
    },
    output: {
      standard: 1.10,
      discount: 0.55
    }
  };

  // Planes y sus límites de tokens
  const PLANES = {
    gratis: {
      nombre: 'Gratis',
      precio: 0,
      tokensEntrada: 250000,
      tokensSalida: 0,
      color: '#94a3b8',
      porcentajeUsuarios: 85 // 85% son usuarios gratuitos
    },
    basico: {
      nombre: 'Básico',
      precio: 5,
      tokensEntrada: 3125000,
      tokensSalida: 0,
      color: '#1e7a5a',
      porcentajeUsuarios: 8.79 // 58.62% del 15% de usuarios pagados
    },
    inicial: {
      nombre: 'Inicial',
      precio: 10,
      tokensEntrada: 6875000,
      tokensSalida: 0,
      color: '#2e9d78',
      porcentajeUsuarios: 2.81 // 18.75% del 15% de usuarios pagados
    },
    pro: {
      nombre: 'Pro',
      precio: 20,
      tokensEntrada: 15000000,
      tokensSalida: 0,
      color: '#43c69f',
      porcentajeUsuarios: 2.34 // 15.63% del 15% de usuarios pagados
    },
    ultra: {
      nombre: 'Ultra',
      precio: 50,
      tokensEntrada: 40625000,
      tokensSalida: 0,
      color: '#7de2c3',
      porcentajeUsuarios: 0.94 // 6.25% del 15% de usuarios pagados
    }
  };

  // Costo base por usuario gratuito
  const COSTO_USUARIO_GRATIS = 0.05; // USD por 250,000 tokens

  // Calcular costo por usuario en Deepseek basado en el uso de tokens
  const calcularCostoPorUsuarioDeepseek = (tokensEntrada, tokensSalida) => {
    // Calculamos cuántos paquetes de 250,000 tokens se necesitan
    const paquetesTokens = Math.ceil(tokensEntrada / 250000);
    
    // Cada paquete de 250,000 tokens cuesta $0.05
    return paquetesTokens * 0.05;
  };

  // Calcular márgenes por plan
  const calcularMargenesPorPlan = () => {
    return Object.entries(PLANES).map(([key, plan]) => {
      const costoTokens = plan.nombre === 'Gratis' ? 
        COSTO_USUARIO_GRATIS : 
        calcularCostoPorUsuarioDeepseek(plan.tokensEntrada, plan.tokensSalida);

      const margenBruto = plan.precio - costoTokens;
      const margenPorcentaje = plan.precio === 0 ? -100 : (margenBruto / plan.precio) * 100;

      return {
        ...plan,
        costoTokens,
        margenBruto,
        margenPorcentaje
      };
    });
  };

  const margenesPorPlan = calcularMargenesPorPlan();

  // Datos para el gráfico de comparación de costos de AI
  const comparacionCostosAI = [
    { nombre: 'Claude', costoMensual: 360 * 30, color: '#1e1e1e' },
    { nombre: 'Deepseek', costoMensual: 2700, color: '#1e7a5a' }
  ];
  
  // Datos para la comparación de costos diarios
  const costosDiarios = [
    { nombre: 'Claude Haiku', costoDiario: 360, color: '#1e1e1e' },
    { nombre: 'Deepseek', costoDiario: 90, color: '#1e7a5a' }
  ];

  // Estado para almacenar los datos mensuales
  const [datosMensuales, setDatosMensuales] = useState([]);
  const [gastosFijos, setGastosFijos] = useState([]);
  const [gastosVariables, setGastosVariables] = useState([]);
  const [totales, setTotales] = useState({
    fijos: {
      programadores: 0,
      costosProgramadores: 0,
      gastoConvex: 0,
      totalFijos: 0
    },
    variables: {
      costosMarketing: 0,
      costoTotalDeepseek: 0,
      totalVariables: 0
    },
    ingresosMes: 0,
    usuariosRegistrados: 0,
    usuariosConvertidos: 0
  });

  // Formatear dinero
  const formatDinero = (valor) => {
    if (valor === undefined || valor === null) return '$0.00';
    return '$' + valor.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  // Formatear número
  const formatNumero = (valor) => {
    if (valor === undefined || valor === null) return '0';
    return valor.toLocaleString();
  };

  // Formatear porcentaje
  const formatPorcentaje = (valor) => {
    return valor.toFixed(1) + '%';
  };

  // Función para cambiar la proyección
  const cambiarProyeccion = (tipo) => {
    setProyeccion(tipo);
  };

  useEffect(() => {
    const datosProyeccion = proyecciones[proyeccion];
    const datos = [];
    const fijos = [];
    const variables = [];
    
    let programadores = 1; // Comenzamos con 1 programador
    let gastoConvex = 150; // Gasto inicial de Convex
    
    for (let mes = 1; mes <= 12; mes++) {
      // Usar los datos directamente de las proyecciones
      const vistas = datosProyeccion.vistas[mes - 1];
      const usuariosRegistrados = datosProyeccion.usuariosRegistrados[mes - 1];
      const usuariosConvertidos = datosProyeccion.usuariosConvertidos[mes - 1];
      
      // Calcular ingresos mensuales basados en los usuarios convertidos actuales
      // Valor promedio por conversión = 10.11 (obtenido de los datos)
      const valorPorConversion = 10.11;
      let ingresosMes = 0;
      
      // Para proyección actual (Imagen 1)
      if (proyeccion === 'actual') {
        // En la imagen 1, los ingresos ya vienen calculados
        const ingresosPorMes = [333.63, 1344.63, 2689.26, 4943.79, 7906.02, 11687.16, 16560.18, 22818.27, 30865.83, 41157.81, 54290.70, 71032.86];
        ingresosMes = ingresosPorMes[mes - 1];
      } 
      // Para proyección con capital (Imagen 2)
      else {
        // En la imagen 2, los ingresos ya vienen calculados
        const ingresosPorMes = [333.63, 1344.63, 8229.54, 16155.78, 27984.48, 46091.49, 73651.35, 115334.88, 178037.10, 271908.45, 411921.84, 620015.97];
        ingresosMes = ingresosPorMes[mes - 1];
      }
      
      // Calcular costos de personal
      
            // Calcular costos de personal
      let programadores = 0;  // Inicializar en 0
      if (mes >= 3) {
        programadores = mes - 2;  // Comienza con 1 programador en el mes 3, 2 programadores en el mes 4, etc.
      }

      const costosProgramadores = programadores * 1500;

      
      // Calcular costos de marketing
      const porcentajeMarketing = 50 - ((50 - 25) * (mes - 1) / 11);
      const costosMarketing = ingresosMes * (porcentajeMarketing / 100);
      
      // Calcular costos Deepseek
      const usuariosGratis = Math.round(usuariosRegistrados * PLANES.gratis.porcentajeUsuarios / 100);
      const usuariosPagados = usuariosRegistrados - usuariosGratis;
      
      const costoUsuariosGratis = usuariosGratis * COSTO_USUARIO_GRATIS;
      const costoUsuariosPagados = usuariosPagados * (
        (PLANES.basico.porcentajeUsuarios * calcularCostoPorUsuarioDeepseek(PLANES.basico.tokensEntrada, PLANES.basico.tokensSalida) / 100) +
        (PLANES.inicial.porcentajeUsuarios * calcularCostoPorUsuarioDeepseek(PLANES.inicial.tokensEntrada, PLANES.inicial.tokensSalida) / 100) +
        (PLANES.pro.porcentajeUsuarios * calcularCostoPorUsuarioDeepseek(PLANES.pro.tokensEntrada, PLANES.pro.tokensSalida) / 100) +
        (PLANES.ultra.porcentajeUsuarios * calcularCostoPorUsuarioDeepseek(PLANES.ultra.tokensEntrada, PLANES.ultra.tokensSalida) / 100)
      );
      
      const costoTotalDeepseek = costoUsuariosGratis + costoUsuariosPagados;
      
      // Incrementar gasto de Convex
      gastoConvex = (mes === 1) ? 150 : datos[mes - 2].gastoConvex * 1.1;
      
      // Datos completos
      const datoMensual = {
        mes,
        vistas,
        programadores,
        costosProgramadores,
        ingresosMes,
        porcentajeMarketing,
        costosMarketing,
        usuariosRegistrados,
        usuariosConvertidos,
        costoTotalDeepseek,
        gastoConvex
      };
      
      // Gastos fijos
      const gastoFijo = {
        mes,
        programadores,
        costosProgramadores,
        gastoConvex,
        totalFijos: costosProgramadores + gastoConvex
      };
      
      // Gastos variables
      const gastoVariable = {
        mes,
        usuariosRegistrados,
        costosMarketing,
        costoTotalDeepseek,
        totalVariables: costosMarketing + costoTotalDeepseek
      };
      
      datos.push(datoMensual);
      fijos.push(gastoFijo);
      variables.push(gastoVariable);
    }
    
    setDatosMensuales(datos);
    setGastosFijos(fijos);
    setGastosVariables(variables);
    
    // Calcular totales
    if (datos.length > 0) {
      // Para proyección actual (Imagen 1)
      if (proyeccion === 'actual') {
        const totalesCalculados = {
          fijos: {
            programadores: datos[datos.length - 1].programadores,
            costosProgramadores: fijos.reduce((sum, d) => sum + d.costosProgramadores, 0),
            gastoConvex: fijos.reduce((sum, d) => sum + d.gastoConvex, 0),
            totalFijos: fijos.reduce((sum, d) => sum + d.totalFijos, 0)
          },
          variables: {
            costosMarketing: variables.reduce((sum, d) => sum + d.costosMarketing, 0),
            costoTotalDeepseek: variables.reduce((sum, d) => sum + d.costoTotalDeepseek, 0),
            totalVariables: variables.reduce((sum, d) => sum + d.totalVariables, 0)
          },
          ingresosMes: 265630.14, // Total de ingresos de la Imagen 1
          usuariosRegistrados: 542853, // Total de usuarios registrados de la Imagen 1
          usuariosConvertidos: 22082 // Total de usuarios convertidos de la Imagen 1
        };
        setTotales(totalesCalculados);
      } 
      // Para proyección con capital (Imagen 2)
      else {
        const totalesCalculados = {
          fijos: {
            programadores: datos[datos.length - 1].programadores,
            costosProgramadores: fijos.reduce((sum, d) => sum + d.costosProgramadores, 0),
            gastoConvex: fijos.reduce((sum, d) => sum + d.gastoConvex, 0),
            totalFijos: fijos.reduce((sum, d) => sum + d.totalFijos, 0)
          },
          variables: {
            costosMarketing: variables.reduce((sum, d) => sum + d.costosMarketing, 0),
            costoTotalDeepseek: variables.reduce((sum, d) => sum + d.costoTotalDeepseek, 0),
            totalVariables: variables.reduce((sum, d) => sum + d.totalVariables, 0)
          },
          ingresosMes: 1771009.14, // Total de ingresos de la Imagen 2
          usuariosRegistrados: 2298128, // Total de usuarios registrados de la Imagen 2
          usuariosConvertidos: 149036 // Total de usuarios convertidos de la Imagen 2
        };
        setTotales(totalesCalculados);
      }
    }
  }, [proyeccion]);

  return (
    <div className="flex flex-col gap-6 p-4 bg-gray-50 rounded-lg">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Análisis de Egresos y Optimización de Costos</h1>
        <div className="flex gap-4">
          <button 
            onClick={() => cambiarProyeccion('actual')}
            className={`py-2 px-4 rounded font-bold shadow ${
              proyeccion === 'actual' 
                ? 'bg-green-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-green-600 hover:text-white'
            }`}
          >
            Proyección Actual
          </button>
          <button 
            onClick={() => cambiarProyeccion('conCapital')}
            className={`py-2 px-4 rounded font-bold shadow ${
              proyeccion === 'conCapital' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-blue-600 hover:text-white'
            }`}
          >
            Con Capital
          </button>
        </div>
      </div>
      
      {/* Gastos Fijos */}
      <div className="p-4 border border-gray-200 rounded-lg bg-white overflow-x-auto">
        <h2 className="text-lg font-semibold mb-3">Gastos Fijos Mensuales</h2>
        
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 text-left">Mes</th>
              <th className="p-2 text-right">Programadores</th>
              <th className="p-2 text-right">Costo IT</th>
              <th className="p-2 text-right">Gasto Convex</th>
              <th className="p-2 text-right">Total Fijos</th>
            </tr>
          </thead>
          <tbody>
            {gastosFijos.map((dato) => (
              <tr key={dato.mes} className="border-b">
                <td className="p-2">Mes {dato.mes}</td>
                <td className="p-2 text-right">{dato.programadores}</td>
                <td className="p-2 text-right">{formatDinero(dato.costosProgramadores)}</td>
                <td className="p-2 text-right">{formatDinero(dato.gastoConvex)}</td>
                <td className="p-2 text-right font-semibold">{formatDinero(dato.totalFijos)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-gray-200 font-medium">
            <tr>
              <td className="p-2">TOTAL ANUAL</td>
              <td className="p-2 text-right">{totales.fijos.programadores}</td>
              <td className="p-2 text-right">{formatDinero(totales.fijos.costosProgramadores)}</td>
              <td className="p-2 text-right">{formatDinero(totales.fijos.gastoConvex)}</td>
              <td className="p-2 text-right font-semibold">{formatDinero(totales.fijos.totalFijos)}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Gastos Variables */}
      <div className="p-4 border border-gray-200 rounded-lg bg-white overflow-x-auto">
        <h2 className="text-lg font-semibold mb-3">Gastos Variables Mensuales</h2>
        
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 text-left">Mes</th>
              <th className="p-2 text-right">Usuarios Reg.</th>
              <th className="p-2 text-right">Gasto Marketing</th>
              <th className="p-2 text-right">Costo Deepseek</th>
              <th className="p-2 text-right">Total Variables</th>
            </tr>
          </thead>
          <tbody>
            {gastosVariables.map((dato) => (
              <tr key={dato.mes} className="border-b">
                <td className="p-2">Mes {dato.mes}</td>
                <td className="p-2 text-right">{formatNumero(dato.usuariosRegistrados)}</td>
                <td className="p-2 text-right">{formatDinero(dato.costosMarketing)}</td>
                <td className="p-2 text-right">{formatDinero(dato.costoTotalDeepseek)}</td>
                <td className="p-2 text-right font-semibold">{formatDinero(dato.totalVariables)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-gray-200 font-medium">
            <tr>
              <td className="p-2">TOTAL ANUAL</td>
              <td className="p-2 text-right">{formatNumero(totales.usuariosRegistrados)}</td>
              <td className="p-2 text-right">{formatDinero(totales.variables.costosMarketing)}</td>
              <td className="p-2 text-right">{formatDinero(totales.variables.costoTotalDeepseek)}</td>
              <td className="p-2 text-right font-semibold">{formatDinero(totales.variables.totalVariables)}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Análisis de Márgenes por Plan */}
      <div className="p-4 border border-gray-200 rounded-lg bg-white">
        <h2 className="text-lg font-semibold mb-3">Análisis de Márgenes por Plan</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <table className="min-w-full text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-2 text-left">Plan</th>
                  <th className="p-2 text-right">Precio</th>
                  <th className="p-2 text-right">Tokens</th>
                  <th className="p-2 text-right">Costo</th>
                  <th className="p-2 text-right">Margen</th>
                  <th className="p-2 text-right">% Margen</th>
                </tr>
              </thead>
              <tbody>
                {margenesPorPlan.map((plan) => (
                  <tr key={plan.nombre} className="border-b">
                    <td className="p-2">
                      <div className="flex items-center">
                        <div className="w-3 h-3 mr-2 rounded-full" style={{ backgroundColor: plan.color }}></div>
                        {plan.nombre}
                      </div>
                    </td>
                    <td className="p-2 text-right">{formatDinero(plan.precio)}</td>
                    <td className="p-2 text-right">{(plan.tokensEntrada / 1000000).toFixed(3)}M</td>
                    <td className="p-2 text-right">{formatDinero(plan.costoTokens)}</td>
                    <td className="p-2 text-right">{formatDinero(plan.margenBruto)}</td>
                    <td className="p-2 text-right">{formatPorcentaje(plan.margenPorcentaje)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <h3 className="text-sm font-semibold text-green-800 mb-2">Análisis de Rentabilidad</h3>
              <ul className="text-sm text-green-700 list-disc pl-5 space-y-1">
                <li>Costo por cada 250,000 tokens: {formatDinero(COSTO_USUARIO_GRATIS)}</li>
                <li>Margen promedio ponderado (planes pagados): {formatPorcentaje(
                  margenesPorPlan
                    .filter(plan => plan.nombre !== 'Gratis')
                    .reduce((acc, plan) => 
                      acc + (plan.margenPorcentaje * plan.porcentajeUsuarios / 15), 0)
                )}</li>
                <li>85% de usuarios en plan gratuito con límite de {formatNumero(PLANES.gratis.tokensEntrada)} tokens</li>
                <li>15% de usuarios en planes pagados con márgenes positivos</li>
              </ul>
            </div>
          </div>

          <div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={margenesPorPlan.filter(plan => plan.nombre !== 'Gratis')}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="nombre" />
                <YAxis tickFormatter={(value) => `${value}%`} />
                <Tooltip 
                  formatter={(value, name) => {
                    if (name === "margenPorcentaje") return [`${value.toFixed(1)}%`, "Margen"];
                    if (name === "porcentajeUsuarios") return [`${value}%`, "% Usuarios"];
                    return [value, name];
                  }}
                />
                <Legend />
                <Bar dataKey="margenPorcentaje" name="Margen %" fill="#10B981" />
                <Bar dataKey="porcentajeUsuarios" name="% Usuarios" fill="#6366F1" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Impacto de Migración de Claude a Deepseek */}
      <div className="p-4 border border-gray-200 rounded-lg bg-white">
        <h2 className="text-lg font-semibold mb-3">Impacto de Migración de Claude a Deepseek</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={comparacionCostosAI}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="nombre" />
                <YAxis tickFormatter={(value) => `$${value}`} />
                <Tooltip formatter={(value) => [`$${value.toFixed(2)}`, 'Costo Mensual']} />
                <Legend />
                <Bar dataKey="costoMensual" name="Costo Mensual" fill={(entry) => entry.color} />
              </BarChart>
            </ResponsiveContainer>
            
            <div className="mt-6">
              <h3 className="text-sm font-semibold mb-2 text-center">Comparación de Costos Diarios</h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart
                  data={costosDiarios}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="nombre" />
                  <YAxis tickFormatter={(value) => `$${value}`} />
                  <Tooltip formatter={(value) => [`$${value.toFixed(2)}`, 'Costo Diario']} />
                  <Legend />
                  <Bar dataKey="costoDiario" name="Costo Diario" fill={(entry) => entry.color} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          <div className="flex flex-col justify-center">
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <h3 className="text-md font-semibold mb-2">Optimización de Costos en IA</h3>
              <p className="text-sm mb-2">
                Implementamos una <strong>reducción significativa en costos de IA</strong> al migrar de Claude a Deepseek Chat.
              </p>
              <ul className="text-sm list-disc pl-5 space-y-1">
                <li>Costo mensual de Deepseek: <span className="font-bold text-green-600">$2,700</span></li>
                <li>Costo diario de Claude Haiku: <span className="font-bold text-red-600">$360/día</span></li>
                <li>Costo diario de Deepseek: <span className="font-bold text-green-600">$90/día</span></li>
                <li>Reducción del 75% en costos diarios de IA</li>
                <li>Mayor control y predicción de costos por plan</li>
                <li>Escalamiento eficiente según el uso de tokens</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Optimización de Base de Datos Convex */}
      <div className="p-4 border border-gray-200 rounded-lg bg-white">
        <h2 className="text-lg font-semibold mb-3">Optimización de Costos en Convex</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="text-md font-semibold mb-2">Corrección de Errores en Base de Datos</h3>
            <p className="text-sm mb-2">
              Identificamos y corregimos un error crítico en la estructura de la base de datos Convex que estaba generando costos excesivos.
            </p>
            <div className="flex items-center justify-center my-4">
              <div className="text-center px-4 py-2">
                <div className="text-red-600 font-bold text-xl">$100/día</div>
                <div className="text-xs">Antes</div>
              </div>
              <div className="text-center px-4">
                <div className="text-2xl">→</div>
              </div>
              <div className="text-center px-4 py-2">
                <div className="text-green-600 font-bold text-xl">$5/día</div>
                <div className="text-xs">Después</div>
              </div>
            </div>
            <ul className="text-sm list-disc pl-5 space-y-1">
              <li>Reducción del <span className="font-bold">95%</span> en costos de operación</li>
              <li>Ahorro mensual aproximado: <span className="font-bold text-green-600">$2,850</span></li>
              <li>Mejoras implementadas:
                <ul className="pl-4 mt-1 space-y-1">
                  <li>Optimización de índices</li>
                  <li>Normalización de estructura de datos</li>
                  <li>Reducción de consultas innecesarias</li>
                  <li>Implementación de caché eficiente</li>
                </ul>
              </li>
            </ul>
          </div>
          
          <div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={[
                  { estado: 'Antes', costo: 100 },
                  { estado: 'Después', costo: 5 }
                ]}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="estado" />
                <YAxis tickFormatter={(value) => `$${value}`} />
                <Tooltip formatter={(value) => [`$${value.toFixed(2)}`, 'Costo Diario']} />
                <Legend />
                <Bar dataKey="costo" name="Costo Diario" fill={(entry, index) => index === 0 ? '#ef4444' : '#10b981'} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      
      {/* Resumen y estrategias de optimización */}
      <div className="p-4 border border-gray-200 rounded-lg bg-blue-50">
        <h2 className="text-lg font-semibold mb-3">Resumen y Estrategias de Optimización</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-3 bg-white rounded-lg shadow-sm">
            <h3 className="text-md font-semibold mb-2 text-green-700">Logros de Optimización</h3>
            <ul className="text-sm list-disc pl-5 space-y-1">
              <li>Reducción del 75% en costos de IA con Deepseek</li>
              <li>Reducción del 95% en costos de Convex</li>
              <li>Total ahorrado mensualmente: ~$10,950</li>
            </ul>
          </div>
          
          <div className="p-3 bg-white rounded-lg shadow-sm">
            <h3 className="text-md font-semibold mb-2 text-blue-700">Estrategia de Crecimiento</h3>
            <ul className="text-sm list-disc pl-5 space-y-1">
              <li>Crecimiento progresivo del equipo técnico</li>
              <li>Inversión variable en marketing (50% a 25%)</li>
              <li>Escalamiento controlado de infraestructura</li>
            </ul>
          </div>
          
          <div className="p-3 bg-white rounded-lg shadow-sm">
            <h3 className="text-md font-semibold mb-2 text-purple-700">Próximos Pasos</h3>
            <ul className="text-sm list-disc pl-5 space-y-1">
              <li>Optimización constante de prompts para reducir tokens</li>
              <li>Evaluar estrategias de caché para reducir llamadas a API</li>
              <li>Revisión trimestral de estructura de datos</li>
            </ul>
          </div>
        </div>
      </div>
      
      {/* Análisis comparativo de proyecciones */}
      <div className="p-4 border border-gray-200 rounded-lg bg-white">
        <h2 className="text-lg font-semibold mb-3">Análisis Comparativo de Proyecciones</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-4 bg-green-50 border border-green-100 rounded-lg">
            <h3 className="text-md font-semibold mb-2 text-green-800">Proyección Actual</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Vistas:</p>
                <p className="text-lg font-bold">{formatNumero(8223551)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Usuarios Registrados:</p>
                <p className="text-lg font-bold">{formatNumero(542853)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Usuarios Convertidos:</p>
                <p className="text-lg font-bold">{formatNumero(22082)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Ingresos Totales:</p>
                <p className="text-lg font-bold text-green-700">{formatDinero(265630.14)}</p>
              </div>
            </div>
          </div>
          
          <div className="p-4 bg-blue-50 border border-blue-100 rounded-lg">
            <h3 className="text-md font-semibold mb-2 text-blue-800">Proyección Con Capital</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Vistas:</p>
                <p className="text-lg font-bold">{formatNumero(33930062)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Usuarios Registrados:</p>
                <p className="text-lg font-bold">{formatNumero(2298128)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Usuarios Convertidos:</p>
                <p className="text-lg font-bold">{formatNumero(149036)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Ingresos Totales:</p>
                <p className="text-lg font-bold text-blue-700">{formatDinero(1771009.14)}</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-4">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2 text-left">Métrica</th>
                <th className="p-2 text-right">Proyección Actual</th>
                <th className="p-2 text-right">Con Capital</th>
                <th className="p-2 text-right">Incremento</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b">
                <td className="p-2">Total Vistas</td>
                <td className="p-2 text-right">{formatNumero(8223551)}</td>
                <td className="p-2 text-right">{formatNumero(33930062)}</td>
                <td className="p-2 text-right text-blue-700">+{formatPorcentaje(((33930062 - 8223551) / 8223551) * 100)}</td>
              </tr>
              <tr className="border-b">
                <td className="p-2">Usuarios Registrados</td>
                <td className="p-2 text-right">{formatNumero(542853)}</td>
                <td className="p-2 text-right">{formatNumero(2298128)}</td>
                <td className="p-2 text-right text-blue-700">+{formatPorcentaje(((2298128 - 542853) / 542853) * 100)}</td>
              </tr>
              <tr className="border-b">
                <td className="p-2">Usuarios Convertidos</td>
                <td className="p-2 text-right">{formatNumero(22082)}</td>
                <td className="p-2 text-right">{formatNumero(149036)}</td>
                <td className="p-2 text-right text-blue-700">+{formatPorcentaje(((149036 - 22082) / 22082) * 100)}</td>
              </tr>
              <tr className="border-b">
                <td className="p-2">Ingresos Totales</td>
                <td className="p-2 text-right">{formatDinero(265630.14)}</td>
                <td className="p-2 text-right">{formatDinero(1771009.14)}</td>
                <td className="p-2 text-right text-blue-700">+{formatPorcentaje(((1771009.14 - 265630.14) / 265630.14) * 100)}</td>
              </tr>
              <tr className="border-b">
                <td className="p-2">Tasa de Conversión Final</td>
                <td className="p-2 text-right">5.0%</td>
                <td className="p-2 text-right">7.16%</td>
                <td className="p-2 text-right text-blue-700">+{formatPorcentaje(((7.16 - 5.0) / 5.0) * 100)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default EgresosAnalisis;
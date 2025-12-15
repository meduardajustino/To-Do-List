import React from 'react';

function Stats({ userName, horasEstudadas }) {
  const calcularTotalHoras = () => {
    if (!horasEstudadas[userName]) return 0;
    const diasDoUsuario = Object.values(horasEstudadas[userName]);
    const totalMinutos = diasDoUsuario.reduce((acc, dia) => acc + dia.minutos, 0);
    return (totalMinutos / 60).toFixed(1);
  };

  const calcularCiclosTotal = () => {
    if (!horasEstudadas[userName]) return 0;
    const diasDoUsuario = Object.values(horasEstudadas[userName]);
    return diasDoUsuario.reduce((acc, dia) => acc + dia.ciclos, 0);
  };

  const obterUltimos7Dias = () => {
    if (!horasEstudadas[userName]) return [];
    
    const dias = [];
    for (let i = 6; i >= 0; i--) {
      const data = new Date();
      data.setDate(data.getDate() - i);
      const dateStr = data.toISOString().split('T');
      const estudo = horasEstudadas[userName][dateStr] || { minutos: 0, ciclos: 0 };
      
      // Formatar data (DD/MM)
      const [ano, mes, dia] = dateStr.split('-');
      const dataFormatada = `${dia}/${mes}`;
      
      dias.push({ data: dataFormatada, ...estudo });
    }
    return dias;
  };

  const diasComEstudo = () => {
    if (!horasEstudadas[userName]) return 0;
    const diasDoUsuario = Object.values(horasEstudadas[userName]);
    return diasDoUsuario.filter(dia => dia.minutos > 0).length;
  };

  return (
    <div className="bg-white bg-opacity-20 backdrop-blur-md rounded-xl p-6 text-white max-w-md border border-white border-opacity-30 shadow-lg">
      <h2 className="text-2xl font-bold mb-4 text-center">📊 Estatísticas</h2>
      
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white bg-opacity-10 rounded-lg p-4 text-center">
          <p className="text-3xl font-bold text-pink-400">{calcularTotalHoras()}h</p>
          <p className="text-sm text-gray-300">Total de horas</p>
        </div>
        <div className="bg-white bg-opacity-10 rounded-lg p-4 text-center">
          <p className="text-3xl font-bold text-pink-400">{calcularCiclosTotal()}</p>
          <p className="text-sm text-gray-300">Total de ciclos</p>
        </div>
        <div className="bg-white bg-opacity-10 rounded-lg p-4 text-center">
          <p className="text-3xl font-bold text-pink-400">{diasComEstudo()}</p>
          <p className="text-sm text-gray-300">Dias estudados</p>
        </div>
        <div className="bg-white bg-opacity-10 rounded-lg p-4 text-center">
          <p className="text-3xl font-bold text-pink-400">{(calcularTotalHoras() / Math.max(diasComEstudo(), 1)).toFixed(1)}h</p>
          <p className="text-sm text-gray-300">Média/Dia</p>
        </div>
      </div>

      <div className="border-t border-white border-opacity-30 pt-4">
        <h3 className="text-lg font-semibold mb-3 text-center">📈 Últimos 7 Dias</h3>
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {obterUltimos7Dias().map((dia, idx) => (
            <div key={idx} className="flex justify-between text-sm bg-white bg-opacity-10 rounded p-2">
              <span className="font-medium">{dia.data}</span>
              <span className="text-pink-300">{dia.minutos}min ({dia.ciclos}c)</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Stats;

import React, { useState } from 'react';

function Stats({ userName, horasEstudadas, metaDiaria, setMetaDiaria, estudoHoje }) {
  const [editandoMeta, setEditandoMeta] = useState(false);
  const [novaMetaInput, setNovaMetaInput] = useState(metaDiaria.toString());

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
      const dataLocal = new Date();
      dataLocal.setDate(dataLocal.getDate() - i);
      const ano = dataLocal.getFullYear();
      const mes = String(dataLocal.getMonth() + 1).padStart(2, '0');
      const diaNum = String(dataLocal.getDate()).padStart(2, '0');
      const dateStr = `${ano}-${mes}-${diaNum}`;
      const estudo = horasEstudadas[userName][dateStr] || { minutos: 0, ciclos: 0 };
      
      // Formatar data (DD/MM)
      const dataFormatada = `${diaNum}/${mes}`;
      
      dias.push({ data: dataFormatada, ...estudo });
    }
    return dias;
  };

  const obter7DiasAnteriores = () => {
    if (!horasEstudadas[userName]) return [];
    
    const dias = [];
    for (let i = 13; i >= 7; i--) {
      const dataLocal = new Date();
      dataLocal.setDate(dataLocal.getDate() - i);
      const ano = dataLocal.getFullYear();
      const mes = String(dataLocal.getMonth() + 1).padStart(2, '0');
      const diaNum = String(dataLocal.getDate()).padStart(2, '0');
      const dateStr = `${ano}-${mes}-${diaNum}`;
      const estudo = horasEstudadas[userName][dateStr] || { minutos: 0, ciclos: 0 };
      dias.push(estudo);
    }
    return dias;
  };

  const calcularTotalSemanaAnterior = () => {
    const diasAnteriores = obter7DiasAnteriores();
    const totalMinutos = diasAnteriores.reduce((acc, dia) => acc + dia.minutos, 0);
    return totalMinutos;
  };

  const calcularTotalSemanaAtual = () => {
    const diasAtuais = obterUltimos7Dias();
    const totalMinutos = diasAtuais.reduce((acc, dia) => acc + dia.minutos, 0);
    return totalMinutos;
  };

  const compararSemanas = () => {
    const semanaAtual = calcularTotalSemanaAtual();
    const semanaAnterior = calcularTotalSemanaAnterior();
    const diferenca = semanaAtual - semanaAnterior;
    const percentual = semanaAnterior > 0 ? ((diferenca / semanaAnterior) * 100).toFixed(1) : 0;
    
    return { diferenca, percentual, semanaAtual, semanaAnterior };
  };

  const progressoMeta = () => {
    const percentual = (estudoHoje.minutos / metaDiaria) * 100;
    return Math.min(percentual, 100);
  };

  const handleSalvarMeta = () => {
    const novaMetaNum = parseInt(novaMetaInput);
    if (novaMetaNum > 0) {
      setMetaDiaria(novaMetaNum);
      setEditandoMeta(false);
    }
  };

  const { diferenca, percentual, semanaAtual, semanaAnterior } = compararSemanas();
  const metaProgress = progressoMeta();
  const metaAtingida = estudoHoje.minutos >= metaDiaria;

  return (
    <div className="bg-white bg-opacity-20 backdrop-blur-md rounded-xl p-6 text-white max-w-md border border-white border-opacity-30 shadow-lg">
      <h2 className="text-2xl font-bold mb-4 text-center">Estatísticas</h2>
      
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white bg-opacity-10 rounded-lg p-4 text-center">
          <p className="text-3xl font-bold text-pink-400">{calcularTotalHoras()}h</p>
          <p className="text-sm text-white">Total de horas</p>
        </div>
        <div className="bg-white bg-opacity-10 rounded-lg p-4 text-center">
          <p className="text-3xl font-bold text-pink-400">{calcularCiclosTotal()}</p>
          <p className="text-sm text-white">Total de ciclos</p>
        </div>
        <div className="bg-white bg-opacity-10 rounded-lg p-4 text-center">
          <p className="text-3xl font-bold text-pink-400">{diasComEstudo()}</p>
          <p className="text-sm text-white">Dias estudados</p>
        </div>
        <div className="bg-white bg-opacity-10 rounded-lg p-4 text-center">
          <p className="text-3xl font-bold text-pink-400">{(calcularTotalHoras() / Math.max(diasComEstudo(), 1)).toFixed(1)}h</p>
          <p className="text-sm text-white">Média/Dia</p>
        </div>
      </div>

      {/* === META DIÁRIA === */}
      <div className="border-t border-white border-opacity-30 pt-4 mb-4">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-semibold">🎯 Meta de Hoje</h3>
          <button
            onClick={() => setEditandoMeta(!editandoMeta)}
            className="text-xs bg-pink-500 px-2 py-1 rounded hover:bg-pink-600 transition"
          >
            {editandoMeta ? 'Cancelar' : 'Editar'}
          </button>
        </div>

        {editandoMeta ? (
          <div className="flex gap-2 mb-3">
            <input
              type="number"
              value={novaMetaInput}
              onChange={(e) => setNovaMetaInput(e.target.value)}
              className="bg-white bg-opacity-20 text-white px-2 py-1 rounded w-full text-sm focus:outline-none"
              placeholder="Minutos"
            />
            <button
              onClick={handleSalvarMeta}
              className="bg-green-500 px-2 py-1 rounded text-sm hover:bg-green-600 transition"
            >
              OK
            </button>
          </div>
        ) : null}

        <div className="bg-white bg-opacity-10 rounded-lg p-3 mb-3">
          <div className="flex justify-between text-sm mb-2">
            <span>{estudoHoje.minutos}min / {metaDiaria}min</span>
            <span className={metaAtingida ? 'text-green-400' : 'text-pink-300'}>{metaProgress.toFixed(0)}%</span>
          </div>
          <div className="w-full bg-white bg-opacity-20 rounded-full h-3 overflow-hidden">
            <div
              className={`h-full transition-all ${metaAtingida ? 'bg-gradient-to-r from-green-400 to-green-500' : 'bg-gradient-to-r from-pink-400 to-pink-600'}`}
              style={{ width: `${metaProgress}%` }}
            ></div>
          </div>
          {metaAtingida && <p className="text-xs text-green-300 mt-2">✨ Meta atingida!</p>}
        </div>
      </div>

      {/* === COMPARAÇÃO SEMANAS === */}
      <div className="border-t border-white border-opacity-30 pt-4 mb-4">
        <h3 className="text-lg font-semibold mb-3 text-center">📊 Comparação Semanal</h3>
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div className="bg-white bg-opacity-10 rounded-lg p-3 text-center text-sm">
            <p className="text-2xl font-bold text-pink-300">{(semanaAtual / 60).toFixed(1)}h</p>
            <p className="text-xs text-white">Esta semana</p>
          </div>
          <div className="bg-white bg-opacity-10 rounded-lg p-3 text-center text-sm">
            <p className="text-2xl font-bold text-blue-300">{(semanaAnterior / 60).toFixed(1)}h</p>
            <p className="text-xs text-white">Semana anterior</p>
          </div>
        </div>
        <div className={`bg-white bg-opacity-10 rounded-lg p-3 text-center text-sm ${diferenca >= 0 ? 'border border-green-400' : 'border border-red-400'}`}>
          <p className={`text-lg font-bold ${diferenca >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {diferenca >= 0 ? '📈' : '📉'} {Math.abs(diferenca / 60).toFixed(1)}h ({Math.abs(percentual)}%)
          </p>
          <p className="text-xs text-white mt-1">
            {diferenca >= 0 ? 'Você estudou mais!' : 'Tente estudar mais esta semana'}
          </p>
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

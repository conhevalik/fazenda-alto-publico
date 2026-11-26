const HORA_INICIAL = 8;

// Ciclo fictício de cinco dias. Cada pancada indica início, fim e intensidade visual.
const PERFIS = [
  { nuvens: 0.23, pancadas: [[13, 15, 0.75]] },
  { nuvens: 0.14, pancadas: [] },
  { nuvens: 0.72, pancadas: [[9, 11, 0.3], [16, 19, 0.5]] },
  { nuvens: 0.58, pancadas: [[2, 5, 0.2]] },
  { nuvens: 0.10, pancadas: [] },
];

const doisDigitos = (valor) => String(valor).padStart(2, '0');

export function medirClima(horas) {
  if (!Number.isFinite(horas) || horas < 0) {
    throw new RangeError('O tempo simulado deve ser um número finito de horas não negativas.');
  }

  const horasTotais = HORA_INICIAL + horas;
  const indiceDia = Math.floor(horasTotais / 24);
  const horaLocal = horasTotais % 24;
  const perfil = PERFIS[indiceDia % PERFIS.length];
  const pancada = perfil.pancadas.find(([inicio, fim]) => horaLocal >= inicio && horaLocal < fim);
  const chuva = pancada ? pancada[2] : 0;
  const nebulosidade = chuva > 0 ? 0.9 : perfil.nuvens;
  const luz = horaLocal > 6 && horaLocal < 18 ? Math.sin(Math.PI * (horaLocal - 6) / 12) : 0;
  const condicao = chuva > 0 ? 'Chuva' : nebulosidade > 0.5 ? 'Nublado' : 'Céu aberto';
  const minutos = Math.floor(horaLocal * 60);

  return {
    dia: indiceDia + 1,
    hora: `${doisDigitos(Math.floor(minutos / 60))}:${doisDigitos(minutos % 60)}`,
    condicao,
    chuva,
    nebulosidade,
    luz,
  };
}

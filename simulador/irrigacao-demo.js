// Modelo da demonstração estática. O firmware MicroPython roda no servidor local.
export function criarDemonstracaoIrrigacao() {
  const leituras = { umidade_a: 50, umidade_b: 50, nivel: 78 };
  let setor = null;
  let liberarEm = 0;
  let anterior = null;
  let travado = false;
  let bomba = false;

  function comandar(dados) {
    if (dados.acao === 'parar') {
      travado = true;
      bomba = false;
      setor = null;
    } else if (dados.acao === 'rearmar') {
      travado = false;
      bomba = false;
      setor = null;
    } else {
      Object.assign(leituras, dados);
    }
  }

  function avancar(agora) {
    const segundos = anterior === null ? 0 : Math.min(0.3, (agora - anterior) / 1000);
    anterior = agora;
    if (bomba && setor !== null) {
      leituras[setor] = Math.min(100, leituras[setor] + 1.8 * segundos);
      leituras.nivel = Math.max(0, leituras.nivel - 0.8 * segundos);
    }

    let destino = null;
    let mensagem = 'EM ESPERA';
    if (travado) {
      mensagem = 'PARADA TRAVADA';
    } else if (leituras.nivel < 20) {
      mensagem = 'RESERVATORIO BAIXO';
    } else if (setor !== null && leituras[setor] < 40) {
      destino = setor;
    } else {
      const maisSeco = leituras.umidade_a <= leituras.umidade_b ? 'umidade_a' : 'umidade_b';
      if (leituras[maisSeco] < 30) destino = maisSeco;
    }
    if (setor !== destino) {
      setor = destino;
      liberarEm = agora + 500;
    }
    bomba = setor !== null && agora >= liberarEm;
    if (setor !== null) {
      const prefixo = bomba ? 'IRRIGANDO ' : 'ABRINDO VALVULA ';
      mensagem = prefixo + (setor === 'umidade_a' ? 'A' : 'B');
    }

    return {
      ...leituras, bomba, travado, mensagem,
      valvula_a: setor === 'umidade_a', valvula_b: setor === 'umidade_b',
    };
  }

  return { avancar, comandar };
}

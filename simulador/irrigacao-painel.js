const endpoint = '/api/irrigacao';

export function iniciarPainelIrrigacao() {
  const painel = document.querySelector('#irrigacao');
  const status = painel.querySelector('[role="status"]');
  const sensores = [...painel.querySelectorAll('input')];
  const botoes = [...painel.querySelectorAll('button')];
  const resumo = painel.querySelector('#atuadores');
  let estado = null;
  let erroComando = '';

  async function comandar(dados) {
    try {
      const resposta = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dados),
      });
      if (!resposta.ok) throw new Error('Falha no comando');
      erroComando = '';
    } catch {
      erroComando = 'O comando falhou. Tente novamente.';
      status.textContent = erroComando;
    }
  }

  for (const sensor of sensores) {
    sensor.addEventListener('change', () => comandar({ [sensor.name]: sensor.valueAsNumber }));
  }
  for (const botao of botoes) {
    botao.addEventListener('click', () => comandar({ acao: botao.dataset.acao }));
  }

  async function consultar() {
    try {
      const resposta = await fetch(endpoint, { signal: AbortSignal.timeout(2000) });
      if (!resposta.ok) throw new Error('Controlador indisponível');
      estado = await resposta.json();
      const mensagem = {
        'EM ESPERA': 'Em espera',
        'PARADA TRAVADA': 'Parada travada',
        'RESERVATORIO BAIXO': 'Reservatório baixo',
        'ABRINDO VALVULA A': 'Abrindo válvula A',
        'ABRINDO VALVULA B': 'Abrindo válvula B',
        'IRRIGANDO A': 'Irrigando talhão A',
        'IRRIGANDO B': 'Irrigando talhão B',
      };
      const texto = erroComando || mensagem[estado.mensagem] || estado.mensagem;
      if (status.textContent !== texto) status.textContent = texto;

      for (const sensor of sensores) {
        sensor.disabled = false;
        const valor = Math.round(estado[sensor.name]);
        sensor.labels[0].querySelector('output').value = `${valor}%`;
        if (document.activeElement !== sensor) sensor.value = valor;
      }
      for (const botao of botoes) {
        botao.disabled = botao.dataset.acao === 'rearmar' ? !estado.travado : estado.travado;
      }
      resumo.textContent = [
        `Bomba ${estado.bomba ? 'ligada' : 'desligada'}`,
        `A ${estado.valvula_a ? 'aberta' : 'fechada'}`,
        `B ${estado.valvula_b ? 'aberta' : 'fechada'}`,
      ].join(' · ');
    } catch {
      estado = null;
      status.textContent = 'Controlador local desconectado';
      resumo.textContent = 'Inicie o servidor de irrigação para testar.';
      for (const controle of [...sensores, ...botoes]) controle.disabled = true;
    } finally {
      window.setTimeout(consultar, 250);
    }
  }

  consultar();
  return () => estado;
}

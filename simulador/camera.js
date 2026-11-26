import * as THREE from 'three';
import { OrbitControls } from './vendor/examples/jsm/controls/OrbitControls.js';
import { criarFazenda } from './fazenda.js';
import { medirClima } from './clima.js';
import { criarTempoVisual } from './tempo-visual.js';

const visor = document.querySelector('#cena');
const estado = document.querySelector('#estado');
const locais = document.querySelector('#locais');
const descricao = document.querySelector('#descricao');

function iniciar() {
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  visor.append(renderer.domElement);

  const cena = new THREE.Scene();
  cena.background = new THREE.Color(0xc9dce0);
  cena.fog = new THREE.Fog(0xc9dce0, 950, 1900);
  const ambiente = new THREE.HemisphereLight(0xfff6dc, 0x8b9468, 2.2);
  cena.add(ambiente);
  const sol = new THREE.DirectionalLight(0xffebc4, 2.1);
  sol.position.set(-300, 470, 210);
  cena.add(sol);

  const camera = new THREE.PerspectiveCamera(43, 1, 1, 2500);
  const controle = new OrbitControls(camera, renderer.domElement);
  controle.maxPolarAngle = Math.PI * 0.47;
  controle.minDistance = 20;
  controle.maxDistance = 1550;
  const zonas = criarFazenda(cena);
  const atualizarTempoVisual = criarTempoVisual(cena);
  const tempo = document.querySelector('#tempo');

  function enquadrar(x, z, direcao, distancia) {
    controle.target.set(x, 2, z);
    camera.position.copy(direcao.normalize().multiplyScalar(distancia).add(controle.target));
    controle.update();
  }

  function vistaGeral() {
    const meiaAbertura = THREE.MathUtils.degToRad(camera.fov / 2);
    const abertura = Math.min(meiaAbertura, Math.atan(Math.tan(meiaAbertura) * camera.aspect));
    const distancia = Math.min(1500, 325 / Math.sin(abertura));
    enquadrar(0, 0, new THREE.Vector3(0.45, 1, 0.85), distancia);
    descricao.textContent = '';
    locais.querySelectorAll('button').forEach(botao => botao.setAttribute('aria-pressed', 'false'));
  }

  function redimensionar() {
    const { clientWidth: largura, clientHeight: altura } = visor;
    camera.aspect = largura / Math.max(1, altura);
    camera.updateProjectionMatrix();
    renderer.setSize(largura, altura, false);
  }

  for (const zona of zonas) {
    const botao = document.createElement('button');
    botao.type = 'button';
    botao.textContent = zona.nome;
    botao.setAttribute('aria-pressed', 'false');
    botao.onclick = () => {
      enquadrar(zona.x, zona.z, new THREE.Vector3(0.55, 0.85, 1), 175);
      locais.querySelectorAll('button').forEach(item => {
        item.setAttribute('aria-pressed', String(item === botao));
      });
      descricao.textContent = zona.descricao;
    };
    locais.append(botao);
  }

  function alterarZoom(fator) {
    const vetor = camera.position.clone().sub(controle.target);
    vetor.setLength(THREE.MathUtils.clamp(vetor.length() * fator, controle.minDistance, controle.maxDistance));
    camera.position.copy(controle.target).add(vetor);
    controle.update();
  }

  for (const [id, acao] of Object.entries({
    geral: vistaGeral,
    aproximar: () => alterarZoom(0.8),
    afastar: () => alterarZoom(1.25),
  })) {
    const botao = document.getElementById(id);
    botao.onclick = acao;
    botao.disabled = false;
  }

  controle.addEventListener('change', () => renderer.render(cena, camera));
  new ResizeObserver(() => {
    redimensionar();
    renderer.render(cena, camera);
  }).observe(visor);

  redimensionar();
  vistaGeral();
  let anterior = performance.now();
  let segundos = 0;
  let leituraAnterior = '';
  function quadro(agora) {
    // Abas em segundo plano não fazem a cena avançar de uma vez ao voltar.
    segundos += Math.min(0.1, Math.max(0, (agora - anterior) / 1000));
    anterior = agora;
    const clima = medirClima(segundos / 10);
    atualizarTempoVisual(clima, segundos);
    ambiente.intensity = 0.38 + clima.luz * (1.82 - clima.nebulosidade * 0.72);
    sol.intensity = 2.1 * clima.luz * (1 - clima.nebulosidade * 0.83);
    const leitura = `Dia ${clima.dia} · ${clima.hora} · ${clima.condicao}`;
    if (leitura !== leituraAnterior) {
      tempo.textContent = leitura;
      leituraAnterior = leitura;
    }
    renderer.render(cena, camera);
  }
  quadro(anterior);
  renderer.setAnimationLoop(quadro);
  estado.hidden = true;
}

try {
  iniciar();
} catch (erro) {
  estado.textContent = 'Não foi possível abrir a cena 3D. Verifique se o navegador oferece WebGL 2.';
  console.error(erro);
}

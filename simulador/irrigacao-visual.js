import * as THREE from 'three';

const tubo = new THREE.MeshStandardMaterial({ color: 0x354d55 });
const metal = new THREE.MeshStandardMaterial({ color: 0x91a4a2 });
const base = new THREE.MeshStandardMaterial({ color: 0xbbab91 });
const parede = new THREE.MeshStandardMaterial({ color: 0xe0d2b3 });
const cobertura = new THREE.MeshStandardMaterial({ color: 0x8c5040 });
const bombaMaterial = new THREE.MeshStandardMaterial({ color: 0x327783 });
const indicadorDesligado = new THREE.MeshStandardMaterial({ color: 0x713b36 });
const indicadorLigado = new THREE.MeshStandardMaterial({
  color: 0x5cf6c3,
  emissive: 0x218467,
});

function peça(grupo, geometria, material, x, y, z) {
  const malha = new THREE.Mesh(geometria, material);
  malha.position.set(x, y, z);
  grupo.add(malha);
  return malha;
}

function caixa(grupo, material, x, y, z, largura, altura, comprimento) {
  return peça(grupo, new THREE.BoxGeometry(largura, altura, comprimento), material, x, y, z);
}

function cano(grupo, inicio, fim, raio) {
  const vetor = new THREE.Vector3().subVectors(fim, inicio);
  const meio = new THREE.Vector3().lerpVectors(inicio, fim, 0.5);
  const malha = peça(grupo, new THREE.CylinderGeometry(raio, raio, vetor.length(), 8),
    tubo, meio.x, meio.y, meio.z);
  malha.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), vetor.normalize());
}

function tubulação(grupo, pontos, raio = 0.65) {
  for (let i = 1; i < pontos.length; i += 1) {
    cano(grupo, new THREE.Vector3(...pontos[i - 1]), new THREE.Vector3(...pontos[i]), raio);
  }
}

function casaDeBombas(grupo) {
  caixa(grupo, base, -47, 0.3, -155, 24, 0.6, 17);
  caixa(grupo, parede, -48, 3.5, -157, 17, 6, 11);
  caixa(grupo, cobertura, -48, 6.8, -157, 20, 0.9, 13);
  caixa(grupo, tubo, -48, 2.3, -151.4, 5, 3.7, 0.3);
  caixa(grupo, metal, -38, 3.4, -151, 2.8, 3.5, 1.1);
  caixa(grupo, base, -55, 0.65, -148, 6, 0.8, 4);
  const motor = peça(grupo, new THREE.CylinderGeometry(1.5, 1.5, 4.6, 12),
    bombaMaterial, -55, 2.1, -148);
  motor.rotation.z = Math.PI / 2;

  const luz = peça(grupo, new THREE.SphereGeometry(0.7, 10, 8),
    indicadorDesligado, -38, 4, -150.35);
  tubulação(grupo, [[-81, 1.7, -147], [-59, 1.7, -147], [-53, 1.7, -147],
    [-32, 1.7, -147], [-32, 1.7, -115], [9, 1.7, -115]], 0.9);
  return luz;
}

function setor(grupo, nome, centroX, centroZ, trajeto) {
  const ramal = new THREE.Group();
  ramal.name = 'Irrigação do talhão ' + nome;
  grupo.add(ramal);
  tubulação(ramal, trajeto);
  const [x, , z] = trajeto[trajeto.length - 2];
  caixa(ramal, metal, x, 1.5, z, 3.6, 2, 3.6);
  const luz = peça(ramal, new THREE.SphereGeometry(0.65, 10, 8),
    indicadorDesligado, x, 2.8, z);

  const pontos = [];
  for (const dz of [-30, 0, 30]) {
    tubulação(ramal, [[centroX - 78, 0.55, centroZ + dz],
      [centroX + 78, 0.55, centroZ + dz]], 0.3);
    for (const dx of [-72, -36, 0, 36, 72]) {
      const xAspersor = centroX + dx;
      const zAspersor = centroZ + dz;
      peça(ramal, new THREE.CylinderGeometry(0.28, 0.4, 2.4, 6),
        metal, xAspersor, 1.65, zAspersor);
      peça(ramal, new THREE.CylinderGeometry(0.65, 0.65, 0.3, 8),
        bombaMaterial, xAspersor, 2.95, zAspersor);
      pontos.push([xAspersor, zAspersor]);
    }
  }

  const jatosPorAspersor = 8;
  const gotasPorJato = 9;
  const posicoes = new THREE.BufferAttribute(
    new Float32Array(pontos.length * jatosPorAspersor * gotasPorJato * 3), 3,
  ).setUsage(THREE.DynamicDrawUsage);
  const geometria = new THREE.BufferGeometry().setAttribute('position', posicoes);
  const agua = new THREE.Points(geometria, new THREE.PointsMaterial({
    color: 0xa5e7ff,
    size: 1.3,
    opacity: 0.87,
    transparent: true,
    depthWrite: false,
  }));
  agua.visible = false;
  agua.frustumCulled = false;
  ramal.add(agua);

  return function atualizar(aberta, bombeando, segundos) {
    luz.material = aberta ? indicadorLigado : indicadorDesligado;
    agua.visible = aberta && bombeando;
    if (!agua.visible) return;

    let indice = 0;
    for (const [xAspersor, zAspersor] of pontos) {
      for (let jato = 0; jato < jatosPorAspersor; jato += 1) {
        const angulo = jato * Math.PI * 2 / jatosPorAspersor + segundos * 1.6;
        const dx = Math.cos(angulo);
        const dz = Math.sin(angulo);
        for (let gota = 0; gota < gotasPorJato; gota += 1) {
          const fase = (gota / gotasPorJato + segundos * 1.7) % 1;
          const alcance = fase * 13;
          const altura = Math.max(0.65, 2.95 + fase * (16 - 19 * fase));
          posicoes.setXYZ(indice, xAspersor + dx * alcance, altura, zAspersor + dz * alcance);
          indice += 1;
        }
      }
    }
    posicoes.needsUpdate = true;
  };
}

export function criarIrrigacaoVisual(cena) {
  const grupo = new THREE.Group();
  grupo.name = 'Rede de irrigação';
  cena.add(grupo);
  const luzDaBomba = casaDeBombas(grupo);
  const atualizarA = setor(grupo, 'A', -124, -45, [
    [-32, 1.7, -115], [-32, 1.4, -104], [-124, 0.55, -104], [-124, 0.55, -15],
  ]);
  const atualizarB = setor(grupo, 'B', 125, -96, [
    [9, 1.7, -115], [17, 1.4, -115], [125, 0.55, -126], [125, 0.55, -66],
  ]);

  return function atualizar(estado, segundos) {
    const bombeando = estado?.bomba === true;
    luzDaBomba.material = bombeando ? indicadorLigado : indicadorDesligado;
    atualizarA(estado?.valvula_a === true, bombeando, segundos);
    atualizarB(estado?.valvula_b === true, bombeando, segundos);
  };
}

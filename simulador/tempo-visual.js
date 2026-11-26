import * as THREE from 'three';

export function criarTempoVisual(cena) {
  const ceuClaro = new THREE.Color(0xc9dce0);
  const ceuNublado = new THREE.Color(0x677d90);
  const ceuNoturno = new THREE.Color(0x142035);
  const nuvens = new THREE.Group();
  const camada = new THREE.MeshLambertMaterial({
    color: 0xe3ebeb,
    transparent: true,
    depthWrite: false,
  });
  const forma = new THREE.IcosahedronGeometry(1, 1);

  for (let i = 0; i < 12; i++) {
    const nuvem = new THREE.Group();
    nuvem.position.set((i % 4) * 224 - 350, 88 + (i % 3) * 18, Math.floor(i / 4) * 170 - 205);
    for (let j = 0; j < 3; j++) {
      const parte = new THREE.Mesh(forma, camada);
      parte.position.set(j * 20, (j % 2) * 5, j * -5);
      parte.scale.set(31, 8 + (j % 2) * 4, 14);
      nuvem.add(parte);
    }
    nuvens.add(nuvem);
  }
  cena.add(nuvens);

  const gotas = 1500;
  const pontos = new Float32Array(gotas * 6);
  const posicoes = new THREE.BufferAttribute(pontos, 3);
  posicoes.setUsage(THREE.DynamicDrawUsage);
  const geometria = new THREE.BufferGeometry().setAttribute('position', posicoes);
  const material = new THREE.LineBasicMaterial({ color: 0xb8def1, transparent: true, depthWrite: false });
  const chuva = new THREE.LineSegments(geometria, material);
  chuva.frustumCulled = false;
  cena.add(chuva);

  return function atualizar(clima, segundos) {
    cena.background.copy(ceuClaro).lerp(ceuNublado, clima.nebulosidade)
      .lerp(ceuNoturno, 1 - clima.luz);
    cena.fog.color.copy(cena.background);
    camada.opacity = 0.18 + clima.nebulosidade * 0.68;
    nuvens.position.x = Math.sin(segundos * 0.04) * 52;

    chuva.visible = clima.chuva > 0;
    if (!chuva.visible) return;
    material.opacity = 0.35 + clima.chuva * 0.45;
    geometria.setDrawRange(0, Math.ceil(gotas * clima.chuva) * 2);
    for (let i = 0; i < gotas; i++) {
      const x = (i * 197.371 % 550) - 275;
      const y = 105 - ((i * 31.31 + segundos * 50) % 105);
      const z = (i * i * 0.1571 % 450) - 225;
      const inicio = i * 6;
      pontos[inicio] = x;
      pontos[inicio + 1] = y;
      pontos[inicio + 2] = z;
      pontos[inicio + 3] = x + 0.55;
      pontos[inicio + 4] = y + 4.8;
      pontos[inicio + 5] = z + 0.28;
    }
    posicoes.needsUpdate = true;
  };
}

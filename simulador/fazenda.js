import * as THREE from 'three';

const materiais = new Map();

function material(cor) {
  if (!materiais.has(cor)) {
    materiais.set(cor, new THREE.MeshStandardMaterial({ color: cor, roughness: 0.9 }));
  }
  return materiais.get(cor);
}

function malha(grupo, geometria, cor, x, y, z, sombra = true) {
  const objeto = new THREE.Mesh(geometria, material(cor));
  objeto.position.set(x, y, z);
  objeto.castShadow = sombra;
  objeto.receiveShadow = true;
  grupo.add(objeto);
  return objeto;
}

function caixa(grupo, cor, x, y, z, largura, altura, comprimento, sombra = true) {
  return malha(grupo, new THREE.BoxGeometry(largura, altura, comprimento), cor, x, y, z, sombra);
}

function pista(grupo, x, z, largura, comprimento) {
  caixa(grupo, '#ad9974', x, 0.08, z, largura, 0.14, comprimento, false);
}

function predio(grupo, { x, z, largura, altura, comprimento, parede, telhado, porta }) {
  caixa(grupo, parede, x, altura / 2, z, largura, altura, comprimento);

  const larguraTelhado = largura + 2;
  const perfil = new THREE.Shape();
  perfil.moveTo(-larguraTelhado / 2, 0);
  perfil.lineTo(larguraTelhado / 2, 0);
  perfil.lineTo(0, largura * 0.23);
  perfil.closePath();
  const cobertura = new THREE.ExtrudeGeometry(perfil, { depth: comprimento + 2, bevelEnabled: false });
  malha(grupo, cobertura, telhado, x, altura, z - comprimento / 2 - 1);

  const frente = z + comprimento / 2 + 0.09;
  caixa(grupo, '#3d4540', x, porta.altura / 2, frente, porta.largura, porta.altura, 0.2);
  if (porta.largura < largura / 2) {
    for (const desvio of [-largura / 3, largura / 3]) {
      caixa(grupo, '#506f71', x + desvio, altura * 0.56, frente, 2.4, 1.8, 0.2);
    }
  }
}

function talhao(grupo, { x, z, largura, comprimento, linhas, solo, sulco, cultivo, escala }) {
  caixa(grupo, '#bda372', x, 0.10, z, largura + 5, 0.17, comprimento + 5, false);
  caixa(grupo, solo, x, 0.21, z, largura, 0.19, comprimento, false);

  const espacamento = largura / linhas;
  const passoPlantio = 5;
  const porLinha = Math.floor(comprimento / passoPlantio);
  const inicioDaLinha = z - (porLinha - 1) * passoPlantio / 2;
  const fileiras = new THREE.InstancedMesh(
    new THREE.BoxGeometry(espacamento * 0.57, 0.35, comprimento - 3),
    material(sulco),
    linhas,
  );
  fileiras.receiveShadow = true;

  const plantas = new THREE.InstancedMesh(
    new THREE.DodecahedronGeometry(1, 0),
    material('#ffffff'),
    linhas * porLinha,
  );
  plantas.receiveShadow = true;
  const posicao = new THREE.Object3D();
  const cores = cultivo.map((cor) => new THREE.Color(cor));
  for (let linha = 0; linha < linhas; linha += 1) {
    const centro = x - largura / 2 + espacamento * (linha + 0.5);
    posicao.position.set(centro, 0.34, z);
    posicao.updateMatrix();
    fileiras.setMatrixAt(linha, posicao.matrix);
    for (let planta = 0; planta < porLinha; planta += 1) {
      const id = linha * porLinha + planta;
      const tamanho = escala * (0.86 + ((id * 31) % 19) / 50);
      const zPlanta = inicioDaLinha + planta * passoPlantio;
      posicao.position.set(centro, 0.53 + tamanho * 0.69, zPlanta);
      posicao.scale.set(tamanho * 1.17, tamanho * 0.8, tamanho * 1.12);
      posicao.rotation.y = id * 0.6;
      posicao.updateMatrix();
      plantas.setMatrixAt(id, posicao.matrix);
      plantas.setColorAt(id, cores[(linha + planta * 7) % cores.length]);
    }
    posicao.scale.set(1, 1, 1);
    posicao.rotation.y = 0;
  }
  grupo.add(fileiras, plantas);
}

function bosque(grupo) {
  const tronco = new THREE.CylinderGeometry(0.45, 0.75, 5, 6);
  const copa = new THREE.IcosahedronGeometry(1, 0);
  const cores = ['#466b3e', '#658446', '#3e6747', '#59754a', '#76954d'];
  const arvores = [
    [-230, 46], [-212, 78], [-230, 111], [-233, 132], [-203, 117],
    [-186, 57], [-163, 67], [-169, 105], [-141, 78], [-141, 117],
    [-120, 51], [-104, 70], [-115, 99], [-96, 121], [-79, 61],
    [-65, 81], [-61, 105], [-43, 69], [-43, 115], [-22, 93],
    [-230, -176], [-204, -178], [-181, -176], [-58, -170], [-213, -133],
    [220, 163], [195, 177], [236, 182], [227, 146], [-213, 171], [-198, 185],
  ];
  caixa(grupo, '#829151', -128, 0.02, 87, 230, 0.04, 84, false);
  for (const [indice, [x, z]] of arvores.entries()) {
    const tamanho = 4.8 + (indice * 7 % 11) * 0.38;
    malha(grupo, tronco, '#70553c', x, 2.5, z);
    const folhagem = malha(grupo, copa, cores[indice % cores.length], x, 5 + tamanho * 0.4, z);
    folhagem.scale.set(tamanho, tamanho * 1.22, tamanho * 0.89);
    folhagem.rotation.y = indice * 0.71;
  }
}

function reservatorio(grupo) {
  const x = -124;
  const z = -147;
  const margem = malha(grupo, new THREE.CylinderGeometry(1, 1, 1.8, 16),
    '#a29765', x, 0.85, z);
  margem.scale.set(58, 1, 32);
  const agua = malha(grupo, new THREE.CylinderGeometry(1, 1, 0.16, 16),
    '#408f9c', x, 1.84, z, false);
  agua.scale.set(53, 1, 27);
  agua.material = new THREE.MeshStandardMaterial({ color: '#408f9c', roughness: 0.32 });
  for (const [dx, dz, largura] of [[-25, -5, 18], [-14, 8, 11], [7, -13, 24], [31, 3, 15]]) {
    caixa(grupo, '#71b1b3', x + dx, 1.94, z + dz, largura, 0.035, 0.48, false);
  }
}

export function criarFazenda(scene) {
  const grupo = new THREE.Group();
  grupo.name = 'Fazenda Alto';
  scene.add(grupo);
  caixa(grupo, '#bdba91', 0, -2.5, 0, 1800, 2, 1800, false);
  caixa(grupo, '#8b9b59', 0, -0.77, 0, 500, 1.5, 400, false);

  pista(grupo, 0, 5, 15, 390);
  pista(grupo, -28, -149, 44, 11);
  pista(grupo, -11, -7, 22, 11);
  pista(grupo, 88, -8, 161, 10);
  pista(grupo, 164, -13, 9, 14);
  pista(grupo, 164, 0, 9, 8);
  pista(grupo, 0, 138, 244, 13);
  caixa(grupo, '#c2ae8b', -86, 0.08, 159, 105, 0.14, 47, false);
  caixa(grupo, '#c2ae8b', 53, 0.08, 152, 80, 0.14, 27, false);

  talhao(grupo, {
    x: -124, z: -45, largura: 207, comprimento: 118, linhas: 19,
    solo: '#8e7551', sulco: '#766045', cultivo: ['#58773d', '#668746', '#7a984b'], escala: 1.67,
  });
  talhao(grupo, {
    x: 125, z: -96, largura: 210, comprimento: 151, linhas: 20,
    solo: '#8b684b', sulco: '#714f39', cultivo: ['#55774e', '#658b57', '#729752'], escala: 1.38,
  });
  talhao(grupo, {
    x: 125, z: 61, largura: 211, comprimento: 122, linhas: 20,
    solo: '#a18658', sulco: '#856b43', cultivo: ['#b69a52', '#c1aa60', '#a9924f'], escala: 1.05,
  });
  bosque(grupo);
  reservatorio(grupo);

  predio(grupo, {
    x: 54, z: 162, largura: 31, altura: 7, comprimento: 19,
    parede: '#dfc69d', telhado: '#ab5740', porta: { largura: 3.5, altura: 4.5 },
  });
  predio(grupo, {
    x: -94, z: 161, largura: 39, altura: 10, comprimento: 26,
    parede: '#b2a48b', telhado: '#585d58', porta: { largura: 22, altura: 8 },
  });
  pista(grupo, -83, 181, 68, 13);

  for (const x of [-10, 10]) {
    caixa(grupo, '#674f38', x, 2.6, 191, 1.35, 5.2, 1.35);
  }
  caixa(grupo, '#674f38', 0, 5.4, 191, 21.5, 0.85, 1.25);

  return [
    { nome: 'Sede', x: 54, z: 159, descricao: 'Entrada sul e sede da propriedade.' },
    { nome: 'Galpão', x: -92, z: 158, descricao: 'Galpão rural próximo à entrada.' },
    { nome: 'Reservatório', x: -124, z: -147, descricao: 'Espelho d’água ao norte.' },
    { nome: 'Talhão A', x: -124, z: -45, descricao: 'Área de plantio a oeste da estrada.' },
    { nome: 'Talhão B', x: 125, z: -96, descricao: 'Área de plantio no nordeste da propriedade.' },
    { nome: 'Talhão C', x: 125, z: 61, descricao: 'Área de sequeiro, abastecida pela chuva.' },
    { nome: 'Faixa de vegetação', x: -124, z: 87, descricao: 'Bosque na parte sul da propriedade.' },
  ];
}

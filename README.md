# Fazenda Alto

O Fazenda Alto é um projeto de simulação visual de uma fazenda fictícia na região de Botucatu, no interior de São Paulo. A ideia é acompanhar as operações diretamente no terreno 3D e testar como a propriedade reage ao clima, ao manejo e, mais adiante, à automação.

## Versão disponível

A maquete inclui três talhões, sede, galpão, estrada, reservatório e vegetação. É possível girar e aproximar a câmera e visitar cada área pelo menu lateral. A luz, as nuvens e a chuva mudam ao longo de um ciclo fictício de cinco dias. A primeira chuva começa por volta de 50 segundos após abrir a cena.

Com Python 3 instalado, execute na raiz do repositório:

```sh
python3 -m http.server 8000 --bind 127.0.0.1 --directory simulador
```

Abra [o simulador local](http://127.0.0.1:8000/) em um navegador com WebGL 2. O código do Three.js incluído em `simulador/vendor` traz sua própria [licença MIT](simulador/vendor/LICENSE).

## Metas do projeto

- [x] **Construir a maquete 3D.** Exibir a propriedade inteira, permitir navegação por câmera e representar mudanças de tempo e de iluminação na cena.
- [x] **Criar a referência de solo.** Registrar a avaliação visual de estrutura, o laudo químico fictício e as ações de manejo por talhão.
- [ ] **Representar o solo e o cultivo na cena.** Simular a resposta à chuva e à cobertura vegetal e mostrar a evolução do cultivo em cada talhão.
- [ ] **Adicionar supervisão pelo Android.** Usar o estado da mesma fazenda para mostrar talhões, histórico e alertas no celular.
- [ ] **Validar automações em simulação.** Demonstrar que o controle continua com o aplicativo fechado e reage a falhas e a uma parada de emergência.
- [ ] **Estudar previsão regional e IA local.** Usar a localização para consultar a previsão e considerar solo, safra e disponibilidade de água ao sugerir opções de plantio. Decisões de campo exigem validação agronômica.

## Relatórios simulados de solo

Os três relatórios são exercícios com dados fictícios. A avaliação visual usa a escala VESS. O laudo químico segue as unidades de referência do IAC.

| Relatório | Conteúdo |
| --- | --- |
| [Ficha de campo](relatorios/ficha-solo-fazenda-alto.png) | Notas VESS por camada e por ponto nos três talhões. |
| [Laudo laboratorial](relatorios/laudo-solo-simulado.png) | Fertilidade simulada na camada de 0 a 20 cm, com pH, nutrientes e saturação por bases. |
| [Plano de manejo](relatorios/relatorio-manejo-solo.png) | Diagnóstico, ações e verificação por talhão. A prioridade simulada é C, depois B, depois A. |

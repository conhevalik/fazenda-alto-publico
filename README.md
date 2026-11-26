# Fazenda Alto | Agricultura 4.0 na prática

O Fazenda Alto é um projeto de portfólio que demonstra como uma fazenda simples pode se tornar uma referência em **Agricultura 4.0, agricultura de precisão e automação rural**. O objetivo é reduzir custos, usar água e insumos com mais eficiência e aumentar a produtividade do produtor rural.

A transformação parte de uma propriedade fictícia na região de Botucatu, SP. Primeiro, estabelecemos uma referência com a avaliação do solo por talhão. Depois, o projeto prevê combinar dados de solo e clima para orientar decisões localizadas e validar automações antes de levá-las ao campo. O simulador 3D é o ambiente de desenvolvimento e teste dessas soluções.

**Como vamos medir o impacto.** Os cenários simulados serão comparados com a situação inicial usando indicadores como consumo de água e insumos por hectare, custo operacional por hectare e produtividade por talhão. Esses ganhos são metas do projeto.

## O que já pode ser testado

A maquete inclui três talhões, sede, galpão, estrada, reservatório e vegetação. É possível girar e aproximar a câmera e visitar cada área pelo menu lateral. A luz, as nuvens e a chuva mudam ao longo de um ciclo fictício de cinco dias. A primeira chuva começa por volta de 50 segundos após abrir a cena.

Com Python 3 instalado, execute na raiz do repositório:

```sh
python3 -m http.server 8000 --bind 127.0.0.1 --directory simulador
```

Abra [o simulador local](http://127.0.0.1:8000/) em um navegador com WebGL 2. O código do Three.js incluído em `simulador/vendor` traz sua própria [licença MIT](simulador/vendor/LICENSE).

## Roteiro da transformação

- [x] **Construir a maquete 3D.** Exibir a propriedade inteira, permitir navegação por câmera e representar mudanças de tempo e de iluminação na cena.
- [x] **Criar a referência de solo.** Registrar a avaliação visual de estrutura, o laudo químico fictício e as ações de manejo por talhão.
- [ ] **Aplicar agricultura de precisão por talhão.** Modelar a resposta do solo à chuva, à cobertura e ao manejo, e usar essas diferenças para apoiar decisões localizadas.
- [ ] **Adicionar supervisão pelo Android.** Usar o estado da mesma fazenda para mostrar talhões, histórico e alertas no celular.
- [ ] **Validar a automação rural.** Testar o controle de operações como a irrigação, incluindo autonomia com o aplicativo fechado, resposta a falhas e parada de emergência.
- [ ] **Comparar resultados.** Medir nos cenários simulados o uso de recursos, os custos e a produtividade em relação à situação inicial.
- [ ] **Estudar previsão regional e IA local.** Usar a localização para consultar a previsão e considerar solo, safra e disponibilidade de água ao sugerir opções de plantio. Decisões de campo exigem validação agronômica.

## Relatórios simulados de solo

Os três relatórios são exercícios com dados fictícios. A avaliação visual usa a escala VESS. O laudo químico segue as unidades de referência do IAC.

| Relatório | Conteúdo |
| --- | --- |
| [Ficha de campo](relatorios/ficha-solo-fazenda-alto.png) | Notas VESS por camada e por ponto nos três talhões. |
| [Laudo laboratorial](relatorios/laudo-solo-simulado.png) | Fertilidade simulada na camada de 0 a 20 cm, com pH, nutrientes e saturação por bases. |
| [Plano de manejo](relatorios/relatorio-manejo-solo.png) | Diagnóstico, ações e verificação por talhão. A prioridade simulada é C, depois B, depois A. |

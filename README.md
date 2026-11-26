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

## Metas de desenvolvimento em Python

A maquete atual usa JavaScript e Three.js para renderizar a fazenda. O próximo passo é construir em Python o núcleo que simula a propriedade e fornece os dados para a cena 3D e, mais adiante, para o aplicativo Android.

| Ordem | Entrega | Critério de aceite |
| --- | --- | --- |
| 1 | **Núcleo da fazenda em Python** | Carregar os três talhões e os dados fictícios dos laudos, avançar o relógio da fazenda e reproduzir o mesmo estado final com as mesmas entradas. |
| 2 | **Modelo de clima, água e solo** | Simular episódios secos e chuvosos e registrar como a umidade varia por talhão. |
| 3 | **Backend e integração com a cena 3D** | Expor o estado da fazenda por uma API Python. A cena 3D deve refletir o clima e as operações informadas pelo backend. |
| 4 | **Controlador de automação rural** | Simular irrigação por talhão e testar operação com o app fechado, falha de sensor e parada de emergência. |
| 5 | **Aplicativo Android de supervisão** | Consultar o estado da fazenda, o histórico e os alertas pela mesma API do simulador. |
| 6 | **Módulo de previsão e apoio à decisão** | Consultar a previsão para Botucatu e apresentar sugestões de plantio com justificativas baseadas no solo, na época e na água disponível. A escolha da IA local será validada nessa etapa. |
| 7 | **Programa de avaliação de resultados** | Comparar o cenário inicial e os cenários com automação, com indicadores de água e insumos por hectare, custo e produtividade por talhão. |

A primeira entrega será executável localmente por linha de comando e terá testes automatizados para a evolução do relógio e a consistência do estado dos três talhões.

## Relatórios simulados de solo

Os três relatórios são exercícios com dados fictícios. A avaliação visual usa a escala VESS. O laudo químico segue as unidades de referência do IAC.

| Relatório | Conteúdo |
| --- | --- |
| [Ficha de campo](relatorios/ficha-solo-fazenda-alto.png) | Notas VESS por camada e por ponto nos três talhões. |
| [Laudo laboratorial](relatorios/laudo-solo-simulado.png) | Fertilidade simulada na camada de 0 a 20 cm, com pH, nutrientes e saturação por bases. |
| [Plano de manejo](relatorios/relatorio-manejo-solo.png) | Diagnóstico, ações e verificação por talhão. A prioridade simulada é C, depois B, depois A. |

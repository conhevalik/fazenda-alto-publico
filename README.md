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

## Próxima meta

**Prototipar o controlador de irrigação de um talhão no Wokwi.** Usar um ESP32 com MicroPython, um potenciômetro para representar a leitura de umidade do solo e um LED para indicar o estado da bomba virtual.

A meta estará concluída quando for possível variar a leitura no simulador e demonstrar que o controlador liga a bomba virtual com leitura de solo seco e a desliga quando a leitura retorna à faixa definida. Os limites serão fictícios, definidos para o teste do circuito.

## Relatórios simulados de solo

Os três relatórios são exercícios com dados fictícios. A avaliação visual usa a escala VESS. O laudo químico segue as unidades de referência do IAC.

| Relatório | Conteúdo |
| --- | --- |
| [Ficha de campo](relatorios/ficha-solo-fazenda-alto.png) | Notas VESS por camada e por ponto nos três talhões. |
| [Laudo laboratorial](relatorios/laudo-solo-simulado.png) | Fertilidade simulada na camada de 0 a 20 cm, com pH, nutrientes e saturação por bases. |
| [Plano de manejo](relatorios/relatorio-manejo-solo.png) | Diagnóstico, ações e verificação por talhão. A prioridade simulada é C, depois B, depois A. |
| [Plano da safra simulada 2026/27](relatorios/relatorio-safra-simulada-2026-2027.png) | Milho no talhão A, investigação da compactação no B e laudo de subsolo e recuperação no C. |

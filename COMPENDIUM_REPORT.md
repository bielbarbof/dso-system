# Relatório do Arquivo DSO — v0.5.0

O catálogo embarcado mantém a base estruturada extraída dos compêndios Foundry fornecidos para o projeto e as adições já consolidadas na linha v0.3/v0.4.

## Conteúdo atual

- **302** habilidades/poderes
- **151** registros de inventário
- **100** rituais
- **33** Poderes Paranormais estruturados como categoria própria
- **26** origens com automação de perícias e poder de origem

## Habilidades

A biblioteca continua separando Poderes de Classe, Trilhas, Origens, Poderes Gerais e Poderes Paranormais. Poderes Paranormais não são misturados com Trilhas.

A v0.5 acrescenta automação explícita para **Sangue de Ferro** no motor de derivados, preservando a descrição do compêndio como fonte textual e o cálculo como regra programada.

## Rituais de dano

**27 rituais** possuem `damageModes` estruturados nesta edição. O campo permite associar fórmula e tipo de dano às formas Normal, Discente e/ou Verdadeira quando aplicável.

Exemplos incluídos: Descarnar, Decadência, Eletrocussão, Esfolar, Ferver Sangue, Inexistir, Invadir Mente, Lâmina do Medo, Paradoxo, Presença do Medo, Purgatório, Tentáculos de Lodo e outros.

Rituais sem uma fórmula de dano estruturada não recebem botão artificial de dano.

## Assets

As referências locais do compêndio foram revalidadas para o pacote Owlbear. O registro Mina Antipessoal, que apontava para um ícone interno genérico do Foundry não embarcado, foi redirecionado para um asset local disponível no DSO System.

## Renderer

O renderer estabilizado na v0.4 é preservado: resultados são renderizados em lotes, descrições só entram no DOM quando expandidas e os cards mantêm altura/layout real. Essa decisão continua sendo requisito de não-regressão da v0.5.

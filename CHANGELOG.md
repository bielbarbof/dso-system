# DSO System — Changelog

## v0.3.0 — Reestruturação Tech Noir

### Interface
- revisão ampla de alinhamento, espaçamento, hierarquia e consistência visual;
- ícone oficial alterado para um documento Tech Noir DSO;
- retrato/foto removido da ficha e do painel de controle;
- cards de atributos simplificados: siglas maiores, sem repetir o nome por extenso;
- listas selecionadas agora são agrupadas por categoria;
- biblioteca refeita para mostrar nome, metadados, resumo e descrição expansível sem depender do carregamento dos ícones.

### Perícias + DSO Chat
- matriz de perícias redesenhada a partir da mesma linguagem da aba + TESTE do DSO Chat;
- mesmo d20, colunas PERÍCIA / DADOS / BÔNUS / TREINO / OUTROS e estados 0/5/10/15;
- mini grade AGI/FOR/INT/PRE/VIG adicionada à aba de perícias;
- alterações continuam sendo exportadas ao DSO Chat pela skill bridge existente.

### Habilidades
- biblioteca reorganizada em Poderes de Classe, Trilhas, Origens, Poderes Gerais e Poderes Paranormais;
- Poderes Paranormais não ficam mais misturados com Trilhas;
- 33 poderes paranormais oficiais foram adicionados ao arquivo estruturado, incluindo o livro básico e Sobrevivendo ao Horror;
- habilidades já adicionadas à ficha são agrupadas por ORIGEM / CLASSE / TRILHA / PODERES GERAIS / PODERES PARANORMAIS.

### Origem automática
- ao selecionar uma origem oficial do livro básico, suas perícias treinadas são aplicadas automaticamente;
- o poder correspondente da origem é adicionado automaticamente à ficha;
- trocar de origem remove apenas os benefícios que haviam sido aplicados automaticamente pela origem anterior;
- Amnésico mantém as duas perícias à escolha do Mestre.

### Inventário e Rituais
- biblioteca não usa mais o layout quebrado da v0.2;
- descrições podem ser abertas integralmente;
- inventário selecionado passa a ser agrupado em Armamentos, Proteções e Equipamentos;
- rituais selecionados passam a ser agrupados por círculo;
- campos de ritual oriundos do Foundry são exibidos em português (execução, alcance, alvo, duração e resistência);
- indicadores Discente/Verdadeiro são exibidos como metadados sem duplicar textos inválidos.

### Tokens
- barras de PV e PD ficaram mais grossas e visíveis;
- continuam presas ao token e respondendo às alterações da ficha/painel de recursos.

### Mestre
- botão para excluir protagonista adicionado ao painel de controle;
- ao excluir, o catálogo é atualizado e vínculos/barras daquele protagonista são limpos dos tokens.

### Correções de assets
- normalização dos nomes de arquivos vindos do Foundry (`#U00xx`);
- correção de caminhos com maiúsculas/minúsculas e caracteres acentuados;
- referências locais do compêndio foram validadas contra os assets disponíveis.

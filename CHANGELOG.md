# DSO System — Changelog

## v0.5.0 — Operational Sheet & Owlbear Persistence

### Baseline
- A v0.4.0 é tratada como baseline estável.
- Preservado o renderer paginado/expansível que corrigiu o bug crítico de Habilidades, Inventário e Rituais.
- Preservados Patentes DSO, melhorias, maldições, automações já existentes, vínculo com token e integração com DSO Chat.

### Persistência oficial no Owlbear
- Criado banco compacto `db-v1` no Room Metadata.
- Owlbear passa a ser a fonte autoritativa das fichas.
- `localStorage` passa a servir apenas para migração/cache auxiliar.
- Registros do compêndio são persistidos por índice compacto + overrides, evitando duplicar descrição e dados imutáveis.
- Overrides de item/habilidade/ritual são individuais por protagonista.
- Proteção de tamanho: gravações acima do limite seguro de 15.000 bytes são bloqueadas com mensagem explícita.
- Migração automática da v0.4 para o banco da sala quando o Mestre abre a v0.5 e a migração cabe no limite.
- Exportar/Importar Backup continua disponível no painel do Mestre.

### Nova arquitetura da ficha
- Removida a aba **GERAL**.
- Removida a aba **PERÍCIAS**; a matriz completa passa a ficar sempre visível na coluna central.
- Removida completamente a aba **BIOGRAFIA** e seus campos.
- Nova composição em três zonas: Núcleo do Protagonista / Perícias / Área Operacional.
- As únicas abas operacionais são **COMBATE · INVENTÁRIO · HABILIDADES · RITUAIS**.
- Retrato continua ausente; o token permanece como representação visual do protagonista.
- Defesa mostra composição base + AGI + equipamento + automações + outros.
- Bloqueio, Esquiva, Proteção, Resistências e Proficiências ficam visíveis no núcleo.

### Perícias e feedback de rolagem
- Matriz de Perícias mantém a linguagem funcional do DSO Chat.
- Testes continuam usando atributo, treino, outros e efeitos automáticos.
- Rolagens continuam sendo enviadas ao DSO Chat.
- Novo pop-up local evidente mostra protagonista, título da rolagem, subtítulo, fórmula e resultado final.
- Pop-up destaca crítico e pode oferecer **ROLAR DANO** após um ataque de arma.

### Combate
- Novo **Arsenal de Dados** com D4, D6, D8, D10, D12 e D20.
- Quantidade, bônus e KH configuráveis; resultado vai ao Chat e ao pop-up local.
- Cards de arma em Combate mostram somente as ações principais **USAR ARMA · EDITAR · REMOVER**.
- Informações mecânicas essenciais permanecem legíveis e o card pode ser expandido pela própria área de identificação.
- Ataque utiliza atributo, perícia, treino, Outros, bônus da arma e efeitos estruturados.
- Crítico considera margem e multiplicador efetivos.
- Dano considera dados-base, multiplicador crítico, atributo de dano, bônus, modificações, maldições e danos extras.

### Editor de armas e registros
- Editor detalhado de armamentos: nome, dano, crítico, multiplicador, bônus de ataque, perícia, atributo de ataque, atributo de dano, bônus de dano, tipo, alcance, proficiência, empunhadura, categoria, espaços e quantidade.
- Suporte a múltiplas parcelas personalizadas de dano extra.
- Modificações e Maldições acessíveis a partir do editor de itens compatíveis.
- Habilidades podem ter nome, descrição, requisitos, ativação, custo e demais campos estruturados alterados por protagonista.
- Rituais podem ter dados descritivos/mecânicos e fórmulas de dano por forma editados por protagonista.

### Rituais
- 27 rituais receberam `damageModes` estruturados quando o dano pôde ser identificado de forma clara no material do projeto.
- Cards de rituais de dano exibem rolagens diretas para **NORMAL**, **DISCENTE** e **VERDADEIRO** quando disponíveis.
- Rolagem de dano de ritual é enviada ao DSO Chat e recebe pop-up local.

### Regras automáticas
- **Nível de Experiência continua independente de NEX.**
- Regra da campanha: Ocultista recebe **+1 NEX efetivo por ritual conhecido**.
- A ficha mantém `NEX base`, `bônus de rituais` e `NEX efetivo` separadamente.
- **Sangue de Ferro** passa a recalcular o bônus de PV a partir do NEX efetivo.
- Origem continua aplicando automaticamente suas perícias treinadas e poder de origem.
- Ajustes externos continuam somados aos cálculos automáticos.

### UI / UX Tech Noir DSO
- Tipografia global levemente ampliada para leitura em sessão.
- Revisados alinhamento, baseline, padding, gaps, botões, ícones, setas, inputs e estados.
- Cards, modais, biblioteca e editores usam hierarquia mais consistente.
- Layout responsivo reorganiza as três zonas antes de esmagar conteúdo.
- Tags: Conhecimento amarelo queimado; Energia roxo; Morte cinza; Sangue vermelho forte; Medo azul.
- Barras de PV/PD dos tokens permanecem robustas e ganharam maior presença visual.

### Controle do Mestre / Tokens
- Botão de exclusão de protagonista preservado.
- Exclusão remove o registro da sala, desvincula tokens e apaga as barras DSO associadas.
- Menu de PV/PD passou a usar filtro de token mais robusto, validando o vínculo no clique.
- Ícone principal permanece como documento DSO.

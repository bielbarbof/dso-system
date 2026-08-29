# DSO System — Changelog

## v0.4.0 — Arsenal & Archive Stabilization

### Correção crítica do Arquivo DSO
- Reconstruído o renderer de Habilidades, Inventário e Rituais.
- O modal não injeta mais centenas de descrições completas no DOM de uma vez.
- Resultados são renderizados em lotes de 50 com **CARREGAR MAIS**.
- Descrições são carregadas somente quando o registro é expandido.
- Cards possuem altura mínima real e layout flexível para impedir o bug de “linhas vazias”.
- Busca e filtros continuam acessando o catálogo completo.

### Patentes DSO
A progressão por Pontos de Prestígio agora é automática:
- Recruta — 0 PP — I: 2 — Crédito Baixo
- Agente — 10 PP — I: 3 — Crédito Baixo
- Operador — 20 PP — I: 3 / II: 1 — Crédito Médio
- Investigador — 35 PP — I: 3 / II: 2 — Crédito Médio
- Agente Especial — 50 PP — I: 3 / II: 2 / III: 1 — Crédito Médio
- Oficial de Campo — 90 PP — I: 3 / II: 3 / III: 1 — Crédito Alto
- Oficial de Operações — 140 PP — I: 3 / II: 3 / III: 2 / IV: 1 — Crédito Alto
- Supervisor — 220 PP — I: 3 / II: 3 / III: 3 / IV: 1 — Crédito Alto
- Comandante — 350 PP — I: 3 / II: 3 / III: 3 / IV: 2 — Crédito Ilimitado
- Agente de Elite — 500 PP — I: 4 / II: 4 / III: 3 / IV: 3 — Crédito Ilimitado

### Inventário
- Novo painel de Pontos de Prestígio, Patente, Crédito e limites I–IV.
- Contagem automática de itens por categoria.
- Categoria efetiva considera modificações, maldições e automações da ficha.
- Carga atual, carga máxima e limite absoluto visíveis.
- Sobrecarga é detectada e continua aplicando as penalidades automaticamente.
- Proteções usam espaços oficiais: Leve 2, Pesada 5, Escudo 2.
- Cards de item exibem Categoria e Espaços de forma legível.

### Melhorias
- Novo modal **MELHORIAS** com abas **MODIFICAÇÕES** e **MALDIÇÕES**.
- Armas, proteções, acessórios e munições recebem suas modificações compatíveis.
- Armas, proteções e acessórios recebem maldições compatíveis.
- Modificações alteram categoria automaticamente.
- Primeira maldição aumenta a categoria em II; as seguintes, em I.
- Bloqueio de elementos opressores.
- Restrições de proteção (pesada/leve e Reforçada × Discreta) são verificadas.
- A extensão impede uma melhoria que elevaria o item acima da Categoria IV.

### Combate
- Marcar **USAR** em uma arma no Inventário envia a arma para a aba Combate.
- Armas podem ser usadas tanto no Inventário quanto no Combate.
- Botão **ATACAR / USAR ARMA** usa atributo, perícia, treino, bônus e modificações da arma.
- Botão **DANO** usa dados, atributo de dano, modificações e maldições aplicáveis.
- Margem e multiplicador de crítico são calculados automaticamente.
- Acerto crítico multiplica os dados-base da arma na rolagem de dano seguinte.
- As rolagens são enviadas ao DSO Chat pelo canal de integração já existente.
- Novo card de arma inspirado na organização do C.R.I.S, reinterpretado em Tech Noir DSO.

### UI / UX
- Escala tipográfica aumentada em Arquivo, Inventário, Combate e cards selecionados.
- Botões e metadados maiores.
- Barras de PV e PD dos tokens ficaram mais espessas e visíveis.

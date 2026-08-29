> **v0.5.1 — Tech Noir UX Stabilization:** esta revisão é focada no feedback da primeira build de teste: legibilidade, alinhamento, selects, inventário, editor de armas, nomenclaturas e camadas de modal.

# DSO System v0.5.1

Extensão de gestão de **PROTAGONISTAS** de Ordem Paranormal para Owlbear Rodeo, construída na identidade **Tech Noir DSO**.

A linha v0.5 parte da v0.4.0 como baseline estável e muda a arquitetura da ficha sem desfazer o renderer estabilizado do Arquivo DSO. O foco desta edição é tornar a ficha uma interface operacional de sessão: núcleo do protagonista e perícias sempre visíveis, quatro módulos de ação, rolagens locais imediatas, edição individual de registros e persistência oficial no Owlbear.

## Estrutura da ficha

A ficha passa a ter três zonas permanentes:

- **Núcleo do Protagonista:** identidade, origem, classe, trilha, Nível, NEX, PP/Patente, atributos, PV, PD, Defesa, Bloqueio, Esquiva, deslocamento, proteção, resistências e proficiências.
- **Perícias:** matriz completa sempre visível e sincronizada com o DSO Chat.
- **Área operacional:** somente `COMBATE · INVENTÁRIO · HABILIDADES · RITUAIS`.

As antigas abas Geral e Perícias deixam de existir. A aba Biografia foi removida integralmente.

## Persistência

O banco oficial das fichas agora é salvo de forma compacta no **Room Metadata do Owlbear**. O `localStorage` deixou de ser a fonte autoritativa e permanece apenas como migração/cache auxiliar.

Registros que já existem no compêndio são armazenados principalmente por referência numérica + alterações específicas do protagonista. Isso evita duplicar descrições enormes. A extensão mede o tamanho do banco antes de gravar e bloqueia uma operação que ultrapassaria o limite seguro configurado.

Ao o Mestre abrir a v0.5.0 pela primeira vez, fichas v0.4 encontradas no armazenamento local daquele navegador são migradas automaticamente quando couberem no banco da sala.

## Combate e rolagens

- Rolador livre D4/D6/D8/D10/D12/D20 dentro de Combate, com quantidade, bônus e KH.
- Testes de perícia, ataques, danos e danos de rituais continuam sendo enviados ao DSO Chat.
- Toda rolagem originada pela ficha ganha também um **pop-up local evidente** com fórmula e resultado.
- Armamentos equipados aparecem em Combate com três ações principais: **USAR ARMA · EDITAR · REMOVER**.
- O editor de arma permite configurar ataque, dano, crítico, atributo, perícia, alcance, categoria, espaços, empunhadura e múltiplos danos extras.
- Modificações e Maldições continuam integradas ao item e aos cálculos estruturados.

## Rituais e Habilidades

- Rituais de dano possuem rolagem direta por forma Normal/Discente/Verdadeira quando uma fórmula estruturada está disponível.
- 27 rituais do catálogo receberam modos de dano estruturados nesta edição.
- Habilidades, Rituais e Itens adicionados podem ser visualizados, editados e removidos. Alterações são overrides do protagonista e não modificam o compêndio global.
- Habilidades com automação explícita continuam recalculando seus efeitos. **Sangue de Ferro** passa a acompanhar o NEX efetivo automaticamente.
- Regra da campanha: **Ocultistas recebem +1 de NEX efetivo por ritual conhecido**, mantendo NEX base e Nível de Experiência separados.

## UI / UX

A linguagem Tech Noir DSO foi refinada em toda a ficha: tipografia levemente maior, alinhamentos revisados, hierarquia mais clara, cards e modais unificados, responsividade melhorada e estados de interação consistentes.

Tags paranormais seguem o padrão da campanha: Conhecimento amarelo queimado, Energia roxo, Morte cinza, Sangue vermelho forte e Medo azul.

Consulte `CHANGELOG.md` e `TEST_REPORT.md` para detalhes.

# DSO System — Auditoria inicial Foundry → Owlbear

## Fonte analisada

Sistema Foundry incluído no pacote fornecido pelo usuário:

- ID: `ordemparanormal`
- Versão: **7.3.3**
- Foundry: v13
- Tipos de Actor: `agent`, `threat`
- Tipos declarados de Item: `armament`, `generalEquipment`, `protection`, `ability`, `ritual`

## Estrutura encontrada

O `template.json` fornece um modelo muito útil para o port. O ator `agent` inclui PV, SAN, PE, PD, NEX, estágio, nível, Defesa, deslocamento, classe, origem, trilha, patente, atributos, perícias, recursos, biografia e objetivos.

Atributos do Foundry:

- `dex` → Agilidade
- `str` → Força
- `int` → Intelecto/Inteligência
- `pre` → Presença
- `vit` → Vigor

O sistema possui 28 entradas de perícia, incluindo Perícia Livre.

## Regras já portadas na v0.1.0

Do `module/documents/actor.mjs`:

- progressão por NEX: `floor(NEX / 5)`, com NEX 99+ tratado como progresso 20;
- cálculo de PV, PE e SAN por classe;
- cálculo de PE por rodada;
- Defesa base + Agilidade;
- Esquiva = Defesa + grau de Reflexos + modificador;
- treinamento 0 / 5 / 10 / 15;
- DT de Ritual = 10 + progresso + Presença (não Sobrevivente);
- pool de d20 por atributo e `2d20kl` quando atributo é 0.

## Compêndios encontrados

Contagem aproximada de documentos de conteúdo no `_source` do sistema fornecido:

- Armamentos: 45
- Equipamentos gerais: 103
- Proteções: 3
- Poderes gerais: 38
- Poderes de Combatente: 29
- Poderes de Especialista: 26
- Poderes de Ocultista: 29
- Poderes de Sobrevivente: 8
- Poderes de Origem: 26
- Trilhas de Combatente: 44
- Trilhas de Especialista: 32
- Trilhas de Ocultista: 37

Esses conteúdos **não foram todos incorporados na v0.1.0**. A primeira versão estabelece a arquitetura que permitirá importar bibliotecas progressivamente sem reescrever a ficha.

## Mapa de portabilidade

### Alta portabilidade

- modelo de personagem;
- atributos e perícias;
- recursos;
- cálculos derivados;
- rolagens d20;
- armas e dano;
- inventário;
- poderes;
- rituais;
- ameaças;
- iniciativa.

### Requer adaptação

- Active Effects do Foundry → motor próprio de efeitos DSO;
- Actors/Items embutidos → objetos JSON do DSO System;
- ChatMessage → integração DSO Chat;
- Combat/Initiative do Foundry → tracker próprio + tokens Owlbear;
- ownership Foundry → `Player.id` + catálogo/permissões DSO;
- Tokens Foundry → metadata dos itens CHARACTER do Owlbear.

### Não deve ser portado literalmente

- ApplicationV2 e Sheet classes;
- Hooks específicos do Foundry;
- Handlebars da interface Foundry;
- APIs de Compendium/Actor/Item do Foundry;
- módulos externos exigidos pelo sistema.

O objetivo é portar **comportamento e estrutura**, e não transportar dependências internas do Foundry.

## Roadmap proposto

1. **v0.1.x — Core:** personagens, permissões, ficha, recursos, perícias, backup e token link.
2. **v0.2.x — Arsenal:** armas, equipamentos, proteções, carga e ataques.
3. **v0.3.x — Habilidades:** origens, classes, trilhas, poderes, custo de PE.
4. **v0.4.x — Ritualística:** círculos, DT, custo, formas discente/verdadeira e componentes.
5. **v0.5.x — Combate:** iniciativa, condições, efeitos, dano e integração de tokens.
6. **v0.6.x — Ameaças:** ficha de threat, resistências, vulnerabilidades, presença perturbadora e ações.
7. **v0.7.x — Criação assistida:** fluxo CRIS-like completo usando bibliotecas portadas.
8. **v1.0 — DSO System estável:** sistema completo, persistência robusta e migrações.

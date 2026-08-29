# DSO System — Auditoria de Portabilidade v0.3

## Situação atual

O sistema Foundry fornecido foi usado como referência estrutural para o port. A v0.3.0 consolida de ser apenas uma prova de conceito de ficha: ela possui modelo próprio de **PROTAGONISTA**, biblioteca de compêndios e integração com tokens/DSO Chat.

## Regras de campanha fixadas nesta linha

1. **Determinação:** PV + PD; PE/SAN separados não são recursos da ficha desta campanha.
2. **Nível de Experiência separado de NEX:** Nível representa a progressão prática; NEX representa exposição paranormal.
3. **Tech Noir DSO:** o port não tenta reproduzir a interface do Foundry. O CRIS é referência de organização e fluxo de seleção; a linguagem visual é DSO.
4. **Automático, mas editável:** valores derivados possuem cálculo base e modificadores externos explícitos. O usuário não precisa recalcular a ficha ao subir de nível, mas efeitos excepcionais continuam podendo alterar o total.

## Modelo portado

- Identidade e controle por jogador.
- Classe, origem, trilha, nível, NEX e patente.
- AGI, FOR, INT, PRE e VIG.
- PV, PD, Defesa, Esquiva, deslocamento, limite de PD e DT de ritual.
- Matriz completa de perícias.
- Inventário estruturado.
- Habilidades/poderes estruturados.
- Rituais estruturados.
- Biografia, objetivos e anotações.
- Vínculo protagonista ↔ token.

## Compêndios

A v0.3.0 mantém o port estruturado dos packs do Foundry, reorganiza seus catálogos e acrescenta Poderes Paranormais e regras de origem estruturadas. Consulte `COMPENDIUM_REPORT.md`.

## Automação

A regra adotada é não interpretar texto livre de um poder como se fosse uma fórmula universal. Dados estruturados entram automaticamente no cálculo quando possuem significado mecânico inequívoco. Exemplos atuais:

- progressão de PV/PD pela classe, nível e atributos;
- Defesa por Agilidade e proteções equipadas;
- Esquiva por Defesa e Reflexos;
- armamentos equipados no resumo de combate;
- DT de ritual e limite de PD;
- barras de PV/PD no token;
- atributos/perícias enviados ao DSO Chat.

A arquitetura permite adicionar regras explícitas para poderes especiais sem transformar descrições narrativas em automações incorretas.

## Próximos núcleos de port

- motor de ataque/dano/munição/recarga;
- custos e ações de habilidades/rituais usando PD;
- requisitos e progressão assistida de classe/trilha;
- efeitos e condições;
- ameaça/NPC do Mestre;
- iniciativa e automações de combate;
- biblioteca adicional para conteúdos que não existam como documentos estruturados nos packs fornecidos.

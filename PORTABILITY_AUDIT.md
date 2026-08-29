# DSO System — Auditoria de Portabilidade v0.5.0

## Princípios fixos desta linha

1. **Determinação:** a ficha usa PV + PD como recursos centrais desta campanha.
2. **Nível de Experiência separado de NEX:** os dois valores permanecem independentes e cada regra usa sua variável correta.
3. **Tech Noir DSO:** C.R.I.S./Foundry servem como referência de organização e fluxo quando útil; a linguagem visual e a implementação permanecem próprias.
4. **Automático, mas editável:** cálculos estruturados são automáticos e ajustes externos continuam explicitamente disponíveis.
5. **Owlbear como verdade:** a partir da v0.5, o banco compacto do Room Metadata é a fonte oficial das fichas.

## Persistência compacta

O DSO System não salva cópias integrais de todos os registros oficiais em cada ficha. Para conteúdo do compêndio, persiste referência + estado + overrides individuais. Exemplos de estado persistido incluem quantidade, equipado, modificações, maldições, edição de dano ou descrição e danos extras personalizados.

Isso reduz o tamanho do banco e permite que o mesmo compêndio seja reutilizado por todos os protagonistas.

O sistema mede o JSON antes de gravar e usa um limite seguro de 15.000 bytes. Textos personalizados muito extensos ainda podem consumir rapidamente o espaço disponível; nesses casos, a gravação é recusada com mensagem explícita em vez de truncar silenciosamente a ficha.

## Modelo de Protagonista v5

- identidade e controlador;
- classe, origem, trilha, Nível, NEX base/efetivo, PP e patente;
- AGI, FOR, INT, PRE e VIG;
- PV, PD, Defesa, Bloqueio, Esquiva, deslocamento e DT de ritual;
- perícias;
- inventário, armamentos, melhorias e maldições;
- habilidades/poderes;
- rituais e modos de dano estruturados;
- vínculo protagonista ↔ token.

Biografia, objetivos e anotações foram removidos do modelo de interface da v0.5 conforme o escopo da campanha.

## Automação explícita

A extensão automatiza apenas efeitos para os quais existe regra mecânica programada. Descrições narrativas não são convertidas em fórmula por adivinhação.

A v0.5 preserva as automações anteriores e acrescenta:

- Ocultista: +1 NEX efetivo por ritual conhecido, regra específica desta campanha;
- Sangue de Ferro: bônus escalável de PV calculado a partir do NEX efetivo;
- rolamento de ataques/danos a partir dos dados estruturados de armamentos;
- rolagens de dano de rituais para registros com `damageModes` curados;
- overrides individuais reconstruídos sobre o compêndio original.

## Integração

- DSO Chat recebe os mesmos perfis de perícias/atributos da ficha.
- Rolagens feitas no DSO System são enviadas ao canal do DSO Chat e também recebem feedback local.
- Tokens continuam ligados por metadata própria e recebem barras de PV/PD como attachments da cena.

## Limites conhecidos

- O armazenamento de Room Metadata é deliberadamente tratado como recurso limitado; o sistema não promete quantidade ilimitada de protagonistas ou textos personalizados gigantescos.
- Efeitos puramente contextuais/narrativos continuam dependendo da mesa até ganharem regra explícita.
- Os 27 `damageModes` são uma curadoria inicial; rituais sem fórmula estruturada não recebem botão de dano automático.

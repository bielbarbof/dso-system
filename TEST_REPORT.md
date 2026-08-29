# DSO System v0.5.1 — Relatório de Validação

Validação de release executada sobre a revisão Tech Noir UX.

- `manifest.json`: JSON válido; versão 0.5.1; descrição dentro do limite do Owlbear.
- `data/compendium.json`: JSON válido.
- JavaScript: `app.js`, `background.js`, `core.js`, `enhancements.js`, `link.js`, `resources.js` e `sheet.js` verificados com `node --check`.
- Persistência: formato de banco Owlbear da linha v0.5 preservado; v0.5.1 não altera a chave nem exige migração destrutiva.
- Identidade: Classe, Origem e Trilha usam seletor Tech Noir próprio mantendo o `<select>` real como fonte de estado.
- Origem: aviso fixo removido do fluxo visual; benefícios são informados por toast transitório.
- Inventário: painel superior reorganizado em Prestígio/Patente/Crédito e Limites/Carga.
- Editor: campos mecânicos agrupados em seções e descrições do Foundry são convertidas para texto limpo ao editar.
- Nomenclaturas: proficiência, empunhadura, tipo de alcance e tipos de dano usam labels PT-BR no editor.
- Dano Extra: componente redesenhado com fórmula, tipo e remoção por linha/card.
- Modais: biblioteca z100, editor z120, melhorias z140, rolagem z170 e toast z180. Modificações/Maldições abre acima do editor.
- Catálogo preservado: 302 habilidades/poderes, 151 itens e 100 rituais.
- Assets do compêndio preservados da baseline estável.

## Testes mecânicos executados

- Ocultista com NEX base 30 e 6 rituais → NEX efetivo 36.
- `Sangue de Ferro` em NEX 36 → bônus automático de PV 14 pela fórmula implementada.
- Pack/unpack do banco Owlbear preservou edição de Acha, dano extra, proficiência, empunhadura e tipo de alcance.
- Patentes validadas nos limiares: 0, 10, 20, 35, 50, 90, 140, 220, 350 e 500 PP.

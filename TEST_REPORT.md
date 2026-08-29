# DSO System v0.4.0 — Relatório de Validação

- `manifest.json`: JSON válido, versão 0.4.0, descrição dentro do limite do Owlbear.
- `data/compendium.json`: JSON válido.
- JavaScript: `app.js`, `background.js`, `core.js`, `enhancements.js`, `link.js`, `resources.js` e `sheet.js` validados por `node --check`.
- Seletores `#id` usados por `sheet.js`: conferidos contra `sheet.html`; nenhum ID obrigatório ausente.
- Assets referenciados pelo compêndio: 419 referências locais, 0 caminhos ausentes após decodificação de URL.
- Catálogo: 302 habilidades/poderes, 151 itens, 100 rituais.
- Patentes: limiares de 0, 10, 20, 35, 50, 90, 140, 220, 350 e 500 PP testados.
- Carga: FOR 0 → 2 espaços; FOR 2 → 10 espaços e limite absoluto 20.
- Proteções: Leve 2 espaços; Pesada 5; Escudo 2.
- Melhorias: categoria e efeitos derivados testados em armamentos e proteções.

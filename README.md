# DSO System v0.1.0 — Owlbear Rodeo

Primeira fundação do port do sistema **Ordem Paranormal** para Owlbear Rodeo, usando como referência técnica o sistema Foundry `ordemparanormal` v7.3.3 fornecido pelo usuário.

## O que já funciona

- Gerenciador de personagens com experiência visual **Tech Noir DSO**.
- Mestre cria fichas e vê todas as fichas da sala.
- Mestre atribui cada ficha a um jogador conectado.
- Jogador vê somente as fichas que controla.
- Ficha fullscreen inspirada na organização de CRIS, sem copiar sua interface.
- Atributos AGI/FOR/INT/PRE/VIG.
- PV, PE, SAN, Defesa, Esquiva, deslocamento e DT de Ritual.
- Cálculos base de PV/PE/SAN por classe portados da lógica de `actor.mjs` do sistema Foundry fornecido.
- Perícias com atributo, treinamento 0/5/10/15 e modificador manual.
- Rolagem de perícia com pool d20 (`kh`; atributo 0 usa `2d20kl`).
- Rolagens enviadas diretamente ao **DSO Chat** quando ele estiver habilitado na mesma sala.
- Inventário, Habilidades e Rituais com registros manuais básicos.
- Biografia e objetivos.
- Backup/importação JSON do banco do Mestre.
- Token do Owlbear pode ser vinculado a uma ficha: selecione um token CHARACTER e use o botão DSO no menu de contexto.
- Ao selecionar depois um token já vinculado, o botão DSO abre a ficha.

## Armazenamento nesta versão

Owlbear limita o **Room Metadata a 16 kB**. Por isso esta versão não tenta colocar fichas completas dentro desse espaço. O DSO System usa:

- **Room Metadata:** catálogo leve de personagens, permissões, controlador e resumo de recursos.
- **localStorage do navegador do Mestre:** corpo completo das fichas.
- **Broadcast do Owlbear:** jogadores autorizados pedem a ficha ao Mestre e devolvem alterações.
- **cache local do jogador:** último snapshot recebido, para abertura rápida.

Isso é proposital para a v0.1.0 e evita ultrapassar o limite do Owlbear. Para a linha estável futura, o projeto está preparado para migrar o corpo completo das fichas para persistência externa opcional (ex.: Supabase), mantendo Owlbear como autoridade de sala e permissões.

**Importante:** na v0.1.0, exporte backups JSON regularmente. Trocar de navegador/computador no perfil do Mestre não leva o `localStorage` junto.

## Estrutura

- `manifest.json` — instalação da extensão.
- `index.html`, `app.js`, `styles.css` — painel principal.
- `sheet.html`, `sheet.js`, `sheet.css` — ficha fullscreen.
- `background.html`, `background.js` — autoridade/sincronização e menu de contexto.
- `link.html`, `link.js`, `link.css` — vínculo token ↔ ficha.
- `core.js` — modelo de dados, cálculos e rolagens.
- `PORTABILITY_AUDIT.md` — auditoria inicial do port Foundry → Owlbear.

## Instalação rápida

Hospede os arquivos como site estático e instale no Owlbear usando:

`https://SEU-DOMINIO/manifest.json`

Veja o tutorial completo em `INSTALL.md`.

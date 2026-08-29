# Atualizando para DSO System v0.5.0

Use **GitHub Desktop** para atualizar, porque a extensão possui centenas de assets e o uploader do navegador do GitHub limita lotes grandes.

1. Abra o GitHub Desktop e selecione o repositório `dso-system`.
2. Descompacte `dso-system-owlbear-v0.5.0.zip`.
3. Copie **todos os arquivos e pastas de dentro** da pasta v0.5.0.
4. Cole por cima da pasta local clonada do repositório.
5. Confirme **Substituir os arquivos no destino** quando o sistema perguntar.
6. No GitHub Desktop, confira as alterações.
7. Em **Summary**, escreva `DSO System v0.5.0`.
8. Clique em **Commit to main**.
9. Clique em **Push origin**.
10. Aguarde o Render concluir o novo deploy.
11. Recarregue a sala no Owlbear Rodeo.

Não é necessário remover/reinstalar a extensão. O endereço do `manifest.json` continua o mesmo.

## Migração das fichas v0.4

A v0.5 usa o Owlbear como fonte oficial de persistência. Na primeira abertura pelo **Mestre**, a extensão procura as fichas v0.4 salvas no `localStorage` daquele navegador e tenta migrá-las para o banco compacto da sala.

- Se a migração couber no limite seguro, ela é feita automaticamente.
- Se o banco exceder o limite, a extensão mostra um aviso e não sobrescreve silenciosamente os dados antigos.
- Antes da atualização, é recomendado manter uma cópia do backup JSON da v0.4.

## Teste rápido após o deploy

1. Abra uma ficha e confirme que Núcleo + Perícias ficam visíveis ao mesmo tempo e que só existem as abas Combate, Inventário, Habilidades e Rituais.
2. Role uma perícia: o resultado deve aparecer no pop-up da ficha e no DSO Chat.
3. Abra Combate e faça uma rolagem pelo Arsenal de Dados.
4. No Inventário, equipe uma arma e confirme que ela aparece em Combate.
5. Clique em **USAR ARMA**; confira o pop-up e o registro no Chat.
6. Abra **EDITAR** na arma, mude um campo e salve; feche/reabra a ficha para confirmar persistência.
7. Adicione um ritual de dano como Descarnar e teste a rolagem Normal/Discente.
8. Em um Ocultista, adicione/remova rituais e confirme `NEX base + bônus por rituais = NEX efetivo`.
9. Feche o Owlbear, abra a mesma sala em outro navegador/computador e confirme que a ficha continua no banco da sala.

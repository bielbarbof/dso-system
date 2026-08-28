# Tutorial de instalação — DSO System

## 1. GitHub

1. Entre no GitHub e clique em **New repository**.
2. Nome sugerido: `dso-system`.
3. Deixe **Public**.
4. `Add README`: Off.
5. `.gitignore`: No .gitignore.
6. License: No license.
7. Clique em **Create repository**.
8. No repositório vazio, clique em **uploading an existing file** ou **Add file → Upload files**.
9. Descompacte o ZIP do DSO System.
10. Envie **os arquivos de dentro da pasta**, não a pasta fechada.
11. O `manifest.json` precisa ficar na raiz do repositório.
12. Clique em **Commit changes**.

## 2. Render

1. Entre em Render.
2. **New → Static Site**.
3. Recomendado: conecte sua conta do GitHub usando **Git Provider**, para os updates futuros fazerem deploy automático.
4. Escolha o repositório `dso-system`.
5. Configure:

- **Name:** `dso-system` (ou outro nome disponível)
- **Branch:** `main`
- **Root Directory:** deixe vazio
- **Build Command:** `echo "No build required"`
- **Publish Directory:** `.`

6. Clique em **Deploy Static Site**.
7. Aguarde `Deploy succeeded / Live`.
8. Abra `https://SEU-SITE.onrender.com/manifest.json` e confirme que aparece `"name": "DSO System"`.

## 3. CORS no Render

Em **Manage → Headers**, crie:

- Request Path: `/*`
- Header Name: `Access-Control-Allow-Origin`
- Header Value: `https://www.owlbear.rodeo`

Adicione também:

- Request Path: `/*`
- Header Name: `Access-Control-Allow-Methods`
- Header Value: `GET, OPTIONS`

Salve.

## 4. Owlbear Rodeo

1. Abra o Owlbear.
2. Perfil → **Extensions**.
3. **Add Extension**.
4. Cole: `https://SEU-SITE.onrender.com/manifest.json`.
5. Adicione a extensão.
6. Habilite **DSO System** na sala.

Os jogadores não precisam instalar individualmente. Ao entrar na sala em que o Mestre habilitou a extensão, ela estará disponível para eles.

## 5. Primeiro teste

1. Entre como Mestre e abra **DSO System**.
2. Clique **+ NOVO AGENTE**.
3. Preencha nome, classe e atributos e salve.
4. Volte ao painel e atribua um jogador no campo **CONTROLADOR**.
5. Abra a sala em outro navegador/aba anônima como jogador.
6. O personagem atribuído deverá aparecer em **MEUS AGENTES**.
7. Abra a ficha e faça uma rolagem de perícia.
8. Se o **DSO Chat** estiver habilitado na mesma sala, a rolagem aparecerá nele.

## 6. Vincular um token

1. Como Mestre, coloque um token na camada CHARACTER.
2. Selecione o token.
3. Clique no ícone DSO do menu de contexto.
4. Escolha a ficha.
5. Da próxima vez, selecionar esse token e clicar no ícone DSO abrirá sua ficha.

## Atualizações futuras

Quando houver v0.1.1, v0.2.0 etc.:

1. GitHub → **Add file → Upload files**.
2. Envie os novos arquivos por cima dos antigos.
3. **Commit changes**.
4. Se o Render estiver conectado ao GitHub, o deploy será automático.
5. Recarregue o Owlbear.

O link `/manifest.json` continua o mesmo.

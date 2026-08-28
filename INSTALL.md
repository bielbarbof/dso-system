# Instalação e atualização — DSO System v0.2.0

## Se você já instalou a v0.1.0

Você **não precisa criar outro repositório nem outro Static Site**.

1. Baixe e descompacte a v0.2.0.
2. No repositório `dso-system` do GitHub, use **Add file → Upload files**.
3. Arraste os arquivos da v0.2.0 para a raiz do repositório, substituindo os arquivos antigos. Inclua também as pastas `data/` e `assets/`.
4. Faça **Commit changes**.
5. Aguarde o Render terminar o novo deploy.
6. Recarregue o Owlbear Rodeo.

O Install Link continua o mesmo, por exemplo:

`https://dso-system.onrender.com/manifest.json`

Se o Render colocou um sufixo no seu domínio, use o endereço real exibido pelo Render.

## Instalação do zero

### 1. GitHub

Crie um repositório público chamado `dso-system`. Não é necessário inicializar com README, licença ou `.gitignore`.

Abra **Add file → Upload files** e envie o conteúdo descompactado da extensão. O arquivo `manifest.json` deve ficar na raiz, ao lado de `index.html`.

Estrutura mínima esperada:

```text
dso-system/
├─ manifest.json
├─ index.html
├─ app.js
├─ core.js
├─ background.html
├─ background.js
├─ sheet.html
├─ sheet.js
├─ sheet.css
├─ link.html
├─ resources.html
├─ data/
│  └─ compendium.json
└─ assets/
   └─ foundry/
```

Faça **Commit changes**.

### 2. Render

Crie **New → Static Site** e conecte o repositório `dso-system`.

Use:

- Branch: `main`
- Root Directory: vazio
- Build Command: `echo "No build required"`
- Publish Directory: `.`

Faça o deploy.

### 3. Headers

No Static Site do Render, abra **Headers** e adicione:

```text
Request Path: /*
Header Name: Access-Control-Allow-Origin
Header Value: https://www.owlbear.rodeo
```

E:

```text
Request Path: /*
Header Name: Access-Control-Allow-Methods
Header Value: GET, OPTIONS
```

### 4. Teste do manifesto

Abra no navegador:

`https://dso-system.onrender.com/manifest.json`

O JSON deve mostrar `"name": "DSO System"` e `"version": "0.2.0"`.

### 5. Owlbear Rodeo

Em **Extensions → Add a custom extension**, cole o endereço do `manifest.json` e adicione a extensão.

## DSO Chat v0.3.2

Para a integração de perícias, atualize também o repositório do DSO Chat com a v0.3.2. É o mesmo processo: substitua os arquivos no GitHub, faça commit e espere o Render redeployar. O Install Link do DSO Chat não muda.

Depois de ambos atualizados:

1. O Mestre cria/abre um **PROTAGONISTA** no DSO System.
2. Define AGI/FOR/INT/PRE/VIG e perícias.
3. Atribui o protagonista a um jogador conectado.
4. O jogador abre o DSO Chat.
5. A aba **+ TESTE** recebe os atributos e perícias da ficha automaticamente.

## Teste das barras no token

1. Adicione um token como `CHARACTER` na cena.
2. Abra o menu de contexto DSO System e vincule um protagonista.
3. Duas barras passam a acompanhar o token: PV e PD.
4. Use **DSO System — PV / PD** no menu de contexto para alterar os recursos rapidamente.
5. A alteração também é refletida na ficha do protagonista.

# Instalação / atualização — DSO System v0.3.0

## Atualizando uma instalação existente

1. Descompacte o ZIP da v0.3.0.
2. Abra o repositório `dso-system` no GitHub Desktop.
3. Abra a pasta local do repositório.
4. Copie **todos os arquivos da v0.3.0 por cima dos antigos**, incluindo `assets/` e `data/`.
5. No GitHub Desktop, crie o commit `DSO System v0.3.0`.
6. Clique em **Push origin**.
7. Aguarde o Render terminar o novo deploy.
8. Recarregue o Owlbear Rodeo.

Não é necessário remover a extensão do Owlbear. O link de instalação continua o mesmo.

> A pasta `assets` possui muitos arquivos. Para esta extensão, prefira o GitHub Desktop ao upload pelo navegador do GitHub, que costuma limitar uploads grandes em quantidade de arquivos.

## Instalação do zero

### GitHub

Crie um repositório público, por exemplo:

`dso-system`

Envie os arquivos da extensão para a raiz do repositório. O `manifest.json` precisa ficar diretamente na raiz.

### Render

Crie **New → Static Site** e conecte o repositório.

- Branch: `main`
- Root Directory: vazio
- Build Command: `echo "No build required"`
- Publish Directory: `.`

Após o deploy, teste no navegador:

`https://SEU-DOMINIO-REAL.onrender.com/manifest.json`

O JSON deve mostrar `DSO System` e a versão `0.3.0`.

### Headers no Render

Adicione:

- Request Path: `/*`
- Header Name: `Access-Control-Allow-Origin`
- Header Value: `https://www.owlbear.rodeo`

E:

- Request Path: `/*`
- Header Name: `Access-Control-Allow-Methods`
- Header Value: `GET, OPTIONS`

### Owlbear Rodeo

Em **Extensions → Add Extension**, use o endereço real do seu Render terminado em:

`/manifest.json`

Exemplo apenas se o domínio realmente for esse:

`https://dso-system.onrender.com/manifest.json`

## DSO Chat

Para sincronizar a matriz de perícias, use o DSO Chat v0.3.2 ou posterior. Não é necessário alterar o visual do DSO Chat; o DSO System publica o perfil pela ponte já existente.

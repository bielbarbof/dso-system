# Relatório do Compêndio — DSO System v0.3.0

## Conteúdo estruturado nesta versão

- **302 habilidades/poderes** no catálogo de habilidades;
- **151 registros de inventário**;
- **100 rituais**;
- **33 Poderes Paranormais** em categoria própria;
- **26 origens do livro básico** com automação de perícias + poder.

## Organização de Habilidades

A biblioteca não mistura mais todos os tipos. A hierarquia da v0.3.0 é:

1. Poderes de Classe
   - Combatente
   - Especialista
   - Ocultista
   - Sobrevivente
2. Trilhas
3. Origens
4. Poderes Gerais
5. Poderes Paranormais
   - Conhecimento
   - Energia
   - Morte
   - Sangue

## Origem

As 26 origens do livro básico têm uma regra estruturada no `compendium.json`. Ao selecionar a origem, o DSO System aplica treinamento nas perícias indicadas e adiciona o poder correspondente. Amnésico é tratado como exceção porque suas duas perícias dependem de escolha do Mestre.

## Poderes Paranormais

A seção própria reúne poderes do livro básico e poderes adicionais de *Sobrevivendo ao Horror*. Eles permanecem vinculados a **NEX**, diferentemente das progressões mundanas de classe/trilha que podem ser apresentadas como Nível na regra de Nível e NEX separados.

## Assets do Foundry

Os caminhos locais foram revisados na v0.3.0. Nomes de arquivo exportados com sequências como `#U00e7` foram normalizados, e referências com diferenças de caixa foram corrigidas.

## Escopo ainda em expansão

O arquivo Foundry e os livros do projeto possuem material suficiente para continuar ampliando o arquivo DSO (novas origens oficiais, itens amaldiçoados, conteúdos de Arquivos Secretos e suplementos). A v0.3.0 prioriza corrigir a experiência de uso, organizar corretamente os catálogos e estabilizar a automação antes de transformar todo conteúdo restante em registros estruturados.

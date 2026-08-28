# DSO System v0.2.0

Sistema de fichas de **PROTAGONISTAS** de Ordem Paranormal para Owlbear Rodeo, com interface **Tech Noir DSO**.

## O que esta versão muda

- Terminologia de ficha alterada para **PROTAGONISTA**.
- Regra de **Determinação** habilitada como padrão: a ficha usa PV + PD e não cria barras separadas de PE/SAN.
- **Nível de Experiência** e **NEX** são características independentes.
- Progressão de PV/PD e demais derivados é recalculada automaticamente quando nível, classe, atributos, equipamento ou modificadores mudam.
- Campos de **Ajustes Externos** continuam editáveis para bônus que vêm de efeitos fora da progressão normal.
- Biblioteca visual no estilo CRIS para adicionar itens, habilidades e rituais sem digitação manual.
- Catálogo embarcado com **520 registros estruturados** extraídos dos compêndios do Foundry fornecido: 269 habilidades/poderes/trilhas, 151 itens/equipamentos/armamentos/proteções e 100 rituais.
- Filtros por classe, trilha, categoria, elemento e círculo, pesquisa e detalhes expansíveis.
- Proteções equipadas entram automaticamente no cálculo de Defesa.
- Um primeiro núcleo de efeitos passivos estruturados já recalcula recursos/perícias/Defesa/deslocamento para poderes como Calejado, Dedicação, Vitalidade Reforçada, Vontade Inabalável, Atlético, Reflexos Defensivos e outros bônus permanentes inequívocos.
- Armamentos equipados aparecem automaticamente na aba Combate.
- Integração com **DSO Chat v0.3.2**: atributos, treinamento e bônus `Outros` do protagonista alimentam a aba **+ TESTE**.
- Token CHARACTER vinculado recebe barras de **PV e PD** anexadas ao token.
- Menu de contexto do token abre a ficha ou o controle rápido de PV/PD.
- Mestre continua sendo a autoridade das fichas e pode atribuir cada protagonista a jogadores conectados.

## Estrutura da ficha

`GERAL · PERÍCIAS · COMBATE · INVENTÁRIO · HABILIDADES · RITUAIS · BIOGRAFIA`

A biblioteca não substitui a possibilidade de ajustes externos: a progressão é automática, mas o Mestre continua podendo somar modificadores em PV máximo, PD máximo, Defesa, deslocamento e DT de ritual.

Consulte `COMPENDIUM_REPORT.md` para os números do port e `INSTALL.md` para instalação/atualização.

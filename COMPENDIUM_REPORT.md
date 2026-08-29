# Relatório do Arquivo DSO — v0.4.0

O catálogo embarcado continua utilizando a base estruturada extraída dos compêndios do sistema Foundry fornecido para o projeto.

## Conteúdo estruturado atual
- 302 habilidades/poderes
- 151 registros de inventário
- 100 rituais
- 33 Poderes Paranormais estruturados como categoria própria
- 26 origens com automação de perícias e poder de origem

## Sistema de melhorias
A v0.4.0 acrescenta um catálogo estrutural de:
- modificações para armas corpo a corpo e de disparo;
- modificações de munição;
- modificações de proteção;
- modificações de acessórios;
- maldições compatíveis com armas, proteções e acessórios.

Os efeitos numéricos inequívocos são aplicados automaticamente. Efeitos situacionais permanecem disponíveis na descrição para não automatizar uma interpretação que dependa de contexto de mesa.

## Renderer
O Arquivo DSO agora renderiza resultados em lotes e carrega descrições sob demanda. Essa alteração foi feita especificamente para eliminar o colapso visual que transformava centenas de registros em linhas vazias dentro do modal.

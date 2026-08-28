# DSO System — Relatório do Compêndio v0.2.0

A biblioteca desta versão foi gerada a partir dos compêndios estruturados presentes no sistema/world do Foundry enviado para o projeto.

## Registros importados

| Grupo | Registros |
|---|---:|
| Habilidades, poderes, origens e trilhas | 269 |
| Armamentos, equipamentos e proteções | 151 |
| Rituais | 100 |
| **Total selecionável** | **520** |

## Habilidades

- Combatente: 29
- Especialista: 26
- Ocultista: 29
- Sobrevivente: 8
- Poderes de Origem: 26
- Poderes Gerais: 38
- Trilhas de Combatente: 44
- Trilhas de Especialista: 32
- Trilhas de Ocultista: 37

## Inventário

O catálogo inclui as categorias estruturadas encontradas no Foundry, entre elas armas simples/táticas/pesadas, munições, acessórios, explosivos, itens operacionais, medicamentos, itens paranormais, catalisadores e proteções.

## Rituais

Foram importados 100 registros do compêndio `rituais-completo`, com círculo, elemento, execução, alcance, alvo, duração, resistência, formas Discente/Verdadeiro e descrição disponíveis quando presentes no dado de origem.

Distribuição encontrada:
- Conhecimento: 23
- Energia: 23
- Morte: 24
- Sangue: 24
- Medo: 6

## Regra de portabilidade

A extensão preserva dados estruturados dos compêndios. Efeitos permanentes que já possuem campo mecânico estruturado (por exemplo Defesa de proteção, dano/ataque de armamento e recursos derivados da ficha) podem entrar diretamente nos cálculos. Poderes cujo efeito existe apenas como texto continuam visíveis e selecionáveis, mas não são convertidos silenciosamente em uma regra inventada: automações adicionais devem ser implementadas de forma explícita para não alterar o comportamento da regra original.

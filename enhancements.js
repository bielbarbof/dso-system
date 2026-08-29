export const WEAPON_MODIFICATIONS = [
  {id:'certeira',name:'Certeira',scope:'weapon',groups:['melee','ranged'],categoryDelta:1,description:'Arma mais precisa e balanceada. +2 em testes de ataque.',effects:{attackBonus:2}},
  {id:'cruel',name:'Cruel',scope:'weapon',groups:['melee','ranged'],categoryDelta:1,description:'Lâmina especialmente afiada ou materiais mais densos. +2 nas rolagens de dano.',effects:{damageFlat:2}},
  {id:'discreta-arma',name:'Discreta',scope:'weapon',groups:['melee','ranged'],categoryDelta:1,description:'Chama menos atenção e ocupa menos espaço. +5 em testes para ocultar e -1 espaço.',effects:{weightDelta:-1}},
  {id:'perigosa',name:'Perigosa',scope:'weapon',groups:['melee','ranged'],categoryDelta:1,description:'Golpes de impacto terrível. Aumenta a margem de ameaça em +2.',effects:{threatDelta:2}},
  {id:'tatica',name:'Tática',scope:'weapon',groups:['melee','ranged'],categoryDelta:1,description:'Cabo, bandoleira ou acessórios que facilitam o manuseio. Pode sacar como ação livre.',effects:{}},
  {id:'alongada',name:'Alongada',scope:'weapon',groups:['ranged'],categoryDelta:1,description:'Cano mais longo para maior precisão. +2 em testes de ataque.',effects:{attackBonus:2}},
  {id:'calibre-grosso',name:'Calibre Grosso',scope:'weapon',groups:['ranged'],categoryDelta:1,description:'Dispara munição de maior calibre. Aumenta o dano em mais um dado do mesmo tipo.',effects:{extraBaseDie:1}},
  {id:'compensador',name:'Compensador',scope:'weapon',groups:['ranged'],categoryDelta:1,description:'Sistema de amortecimento. Anula a penalidade em ataques por disparar rajadas.',effects:{}},
  {id:'ferrolho-automatico',name:'Ferrolho Automático',scope:'weapon',groups:['ranged'],categoryDelta:1,description:'O mecanismo é modificado para disparar várias vezes em sequência. A arma se torna automática.',effects:{automatic:true}},
  {id:'mira-laser',name:'Mira Laser',scope:'weapon',groups:['ranged'],categoryDelta:1,description:'Retículo luminoso interno. Aumenta a margem de ameaça em +2.',effects:{threatDelta:2}},
  {id:'mira-telescopica',name:'Mira Telescópica',scope:'weapon',groups:['ranged'],categoryDelta:1,description:'Aumenta o alcance da arma em uma categoria e amplia o uso de Ataque Furtivo.',effects:{rangeSteps:1}},
  {id:'silenciador',name:'Silenciador',scope:'weapon',groups:['ranged'],categoryDelta:1,description:'Reduz fortemente a penalidade em Furtividade para se esconder após atacar.',effects:{}},
  {id:'visao-calor',name:'Visão de Calor',scope:'weapon',groups:['ranged'],categoryDelta:1,description:'Sobrepõe imagem infravermelha à visão. Ignora camuflagem do alvo.',effects:{}},
];

export const AMMO_MODIFICATIONS = [
  {id:'dum-dum',name:'Dum Dum',scope:'ammo',categoryDelta:1,description:'Para balas curtas e longas. Aumenta o multiplicador de crítico em +1.',effects:{critMultiplierDelta:1}},
  {id:'explosiva',name:'Explosiva',scope:'ammo',categoryDelta:1,description:'Para balas curtas e longas. Aumenta o dano causado em +2d6.',effects:{extraDamage:'2d6'}},
];

export const PROTECTION_MODIFICATIONS = [
  {id:'antibombas',name:'Antibombas',scope:'protection',categoryDelta:1,description:'Somente proteção pesada. +5 em testes de resistência contra efeitos de área.',effects:{}},
  {id:'blindada',name:'Blindada',scope:'protection',categoryDelta:1,description:'Somente proteção pesada. Aumenta a RD para 5 e o espaço em +1.',effects:{weightDelta:1,rd:5}},
  {id:'discreta-protecao',name:'Discreta',scope:'protection',categoryDelta:1,description:'Somente proteção leve. +5 para ocultar e reduz o espaço em -1.',effects:{weightDelta:-1}},
  {id:'reforcada',name:'Reforçada',scope:'protection',categoryDelta:1,description:'Aumenta a Defesa fornecida em +2 e o espaço em +1.',effects:{defenseBonus:2,weightDelta:1}},
];

export const ACCESSORY_MODIFICATIONS = [
  {id:'aprimorado',name:'Aprimorado',scope:'accessory',categoryDelta:1,description:'Aumenta um dos bônus em perícia do acessório para +5.',effects:{}},
  {id:'discreto-acessorio',name:'Discreto',scope:'accessory',categoryDelta:1,description:'Miniaturizado ou disfarçado. +5 para ocultar e reduz o espaço em -1.',effects:{weightDelta:-1}},
  {id:'funcao-adicional',name:'Função Adicional',scope:'accessory',categoryDelta:1,description:'Concede +2 em uma perícia adicional escolhida com aprovação do Mestre.',effects:{}},
  {id:'instrumental',name:'Instrumental',scope:'accessory',categoryDelta:1,description:'O acessório funciona como um kit de perícia escolhido ao aplicar a modificação.',effects:{}},
];

export const ITEM_CURSES = [
  // Armas
  {id:'arma-antielemento',name:'Antielemento',scope:'weapon',element:'Conhecimento',description:'Ao enfrentar uma criatura do elemento escolhido, pode gastar PD para causar dano adicional.',effects:{}},
  {id:'arma-ritualistica',name:'Ritualística',scope:'weapon',element:'Conhecimento',description:'Permite armazenar um ritual na arma e descarregá-lo ao acertar um ataque.',effects:{}},
  {id:'arma-senciente',name:'Senciente',scope:'weapon',element:'Conhecimento',description:'A arma pode flutuar e atacar autonomamente enquanto o efeito for sustentado.',effects:{}},
  {id:'arma-empuxo',name:'Empuxo',scope:'weapon',element:'Energia',description:'Permite arremessar armas corpo a corpo e aumenta o dano quando usadas assim.',effects:{}},
  {id:'arma-energetica',name:'Energética',scope:'weapon',element:'Energia',description:'Pode transformar o ataque em Energia, melhorar o teste e ignorar resistência a dano.',effects:{}},
  {id:'arma-vibrante',name:'Vibrante',scope:'weapon',element:'Energia',description:'Concede acesso a Ataque Extra ou reduz seu custo caso já possua a habilidade.',effects:{}},
  {id:'arma-consumidora',name:'Consumidora',scope:'weapon',element:'Morte',description:'Alvos atingidos ficam lentos; pode gastar PD para imobilizar temporariamente.',effects:{}},
  {id:'arma-erosiva',name:'Erosiva',scope:'weapon',element:'Morte',description:'Causa +1d8 de Morte e pode impor dano de Morte adicional ao longo das rodadas.',effects:{extraDamage:'1d8'}},
  {id:'arma-repulsora',name:'Repulsora',scope:'weapon',element:'Morte',description:'Enquanto empunhada, fornece +2 de Defesa; pode reforçar um bloqueio gastando PD.',effects:{defenseBonus:2}},
  {id:'arma-lancinante',name:'Lancinante',scope:'weapon',element:'Sangue',description:'Causa +1d8 de dano de Sangue, multiplicado em acertos críticos.',effects:{extraDamage:'1d8'}},
  {id:'arma-predadora',name:'Predadora',scope:'weapon',element:'Sangue',description:'Ignora camuflagem e cobertura, amplia alcance à distância e duplica a margem de ameaça.',effects:{doubleThreat:true,rangeSteps:1}},
  {id:'arma-sanguinaria',name:'Sanguinária',scope:'weapon',element:'Sangue',description:'Ferimentos ficam sangrando de forma cumulativa; críticos drenam sangue e geram PV temporários.',effects:{}},

  // Proteções
  {id:'prot-abascanta',name:'Abascanta',scope:'protection',element:'Conhecimento',description:'+5 em resistência contra rituais e possibilidade de refletir um ritual.',effects:{}},
  {id:'prot-profetica',name:'Profética',scope:'protection',element:'Conhecimento',description:'Resistência a Conhecimento e possibilidade de repetir um teste de resistência.',effects:{}},
  {id:'prot-sombria',name:'Sombria',scope:'protection',element:'Conhecimento',description:'+5 em Furtividade, ignora penalidade de carga nessa perícia e pode aparentar roupa comum.',effects:{}},
  {id:'prot-cinetica',name:'Cinética',scope:'protection',element:'Energia',description:'Barreira invisível que fornece +2 de Defesa e resistência a dano.',effects:{defenseBonus:2}},
  {id:'prot-lepida',name:'Lépida',scope:'protection',element:'Energia',description:'+10 em Atletismo e +3m de deslocamento.',effects:{movementBonus:3}},
  {id:'prot-voltaica',name:'Voltaica',scope:'protection',element:'Energia',description:'Resistência a Energia e possibilidade de emitir arcos elétricos ao redor do usuário.',effects:{}},
  {id:'prot-letargica',name:'Letárgica',scope:'protection',element:'Morte',description:'+2 de Defesa e chance de ignorar dano extra de críticos e ataques furtivos.',effects:{defenseBonus:2}},
  {id:'prot-repulsiva',name:'Repulsiva',scope:'protection',element:'Morte',description:'Resistência a Morte e possibilidade de cobrir o corpo com Lodo que fere atacantes corpo a corpo.',effects:{}},
  {id:'prot-regenerativa',name:'Regenerativa',scope:'protection',element:'Sangue',description:'Resistência a Sangue e possibilidade de recuperar PV.',effects:{}},
  {id:'prot-sadica',name:'Sádica',scope:'protection',element:'Sangue',description:'Transforma dano sofrido recentemente em bônus temporário de ataque e dano.',effects:{}},

  // Acessórios
  {id:'acc-carisma',name:'Carisma',scope:'accessory',element:'Conhecimento',description:'+1 em Presença enquanto o acessório estiver sendo usado.',effects:{attributeBonus:{pre:1}}},
  {id:'acc-conjuracao',name:'Conjuração',scope:'accessory',element:'Conhecimento',description:'O acessório contém um ritual de 1º círculo que pode ser conjurado pelo portador.',effects:{}},
  {id:'acc-escudo-mental',name:'Escudo Mental',scope:'accessory',element:'Conhecimento',description:'Fornece resistência mental 10.',effects:{}},
  {id:'acc-reflexao',name:'Reflexão',scope:'accessory',element:'Conhecimento',description:'Pode refletir um ritual de volta ao conjurador mediante gasto de PD.',effects:{}},
  {id:'acc-sagacidade',name:'Sagacidade',scope:'accessory',element:'Conhecimento',description:'+1 em Intelecto enquanto o acessório estiver sendo usado.',effects:{attributeBonus:{int:1}}},
  {id:'acc-defesa',name:'Defesa',scope:'accessory',element:'Energia',description:'Barreira invisível que fornece +5 de Defesa.',effects:{defenseBonus:5}},
  {id:'acc-destreza',name:'Destreza',scope:'accessory',element:'Energia',description:'+1 em Agilidade enquanto o acessório estiver sendo usado.',effects:{attributeBonus:{dex:1}}},
  {id:'acc-potencia',name:'Potência',scope:'accessory',element:'Energia',description:'+1 na DT de habilidades, poderes e rituais.',effects:{ritualDtBonus:1}},
  {id:'acc-esforco-adicional',name:'Esforço Adicional',scope:'accessory',element:'Morte',description:'Na regra de Determinação da mesa, fornece +5 PD máximos após um dia de uso.',effects:{pdBonus:5}},
  {id:'acc-disposicao',name:'Disposição',scope:'accessory',element:'Sangue',description:'+1 em Vigor enquanto o acessório estiver sendo usado.',effects:{attributeBonus:{vit:1}}},
  {id:'acc-pujanca',name:'Pujança',scope:'accessory',element:'Sangue',description:'+1 em Força enquanto o acessório estiver sendo usado.',effects:{attributeBonus:{str:1}}},
  {id:'acc-vitalidade',name:'Vitalidade',scope:'accessory',element:'Sangue',description:'Fornece +15 PV máximos após um dia de uso.',effects:{pvBonus:15}},
  {id:'acc-protecao-elemental',name:'Proteção Elemental',scope:'accessory',element:'Varia',description:'Fornece resistência 10 contra um elemento escolhido.',effects:{}},
];

export const OPPRESSING_ELEMENTS = {Conhecimento:'Energia',Energia:'Conhecimento',Sangue:'Morte',Morte:'Sangue'};

export function isAccessory(item){
  const path=String(item?.categoryPath||item?.group||'');
  return item?.type==='generalEquipment' && /Acess|Utens|Vestimenta/i.test(path+' '+String(item?.name||''));
}
export function itemEnhancementScope(item){
  if(item?.type==='armament')return 'weapon';
  if(item?.type==='protection')return 'protection';
  if(isAccessory(item))return 'accessory';
  if(/muni|bala/i.test(String(item?.categoryPath||'')+' '+String(item?.name||'')))return 'ammo';
  return 'general';
}
export function modificationsFor(item){
  const scope=itemEnhancementScope(item);
  if(scope==='weapon')return WEAPON_MODIFICATIONS.filter(m=>m.groups?.includes(item?.rangeType==='ranged'?'ranged':'melee'));
  if(scope==='protection')return PROTECTION_MODIFICATIONS;
  if(scope==='accessory')return ACCESSORY_MODIFICATIONS;
  if(scope==='ammo')return AMMO_MODIFICATIONS;
  return [];
}
export function cursesFor(item){const scope=itemEnhancementScope(item);return ITEM_CURSES.filter(c=>c.scope===scope);}

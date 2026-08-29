import {ITEM_CURSES,WEAPON_MODIFICATIONS,AMMO_MODIFICATIONS,PROTECTION_MODIFICATIONS,ACCESSORY_MODIFICATIONS} from "./enhancements.js";
export const ID = "com.desordenados.dso-system";
export const ROOM_KEY = `${ID}/catalog-v2`;
export const LEGACY_ROOM_KEY = `${ID}/catalog-v1`;
export const SYNC_CHANNEL = `${ID}/sync-v2`;
export const CHAT_CHANNEL = "com.desordenados.chat-dados/chat";
export const SKILL_BRIDGE_CHANNEL = `${ID}/skill-bridge-v1`;
export const TOKEN_KEY = `${ID}/protagonist`;
export const LEGACY_TOKEN_KEY = `${ID}/character`;
export const BAR_KEY = `${ID}/resource-bar`;
export const SHEET_MODAL_ID = `${ID}/sheet`;
export const LINK_MODAL_ID = `${ID}/link`;
export const RESOURCE_MODAL_ID = `${ID}/resources`;

export const PATENTS = [
  {name:"Recruta",pp:0,limits:[2,0,0,0],credit:"Baixo",privilege:""},
  {name:"Agente",pp:10,limits:[3,0,0,0],credit:"Baixo",privilege:""},
  {name:"Operador",pp:20,limits:[3,1,0,0],credit:"Médio",privilege:""},
  {name:"Investigador",pp:35,limits:[3,2,0,0],credit:"Médio",privilege:""},
  {name:"Agente Especial",pp:50,limits:[3,2,1,0],credit:"Médio",privilege:""},
  {name:"Oficial de Campo",pp:90,limits:[3,3,1,0],credit:"Alto",privilege:"Prioridade no Almoxarifado para recursos limitados destinados a operações autorizadas."},
  {name:"Oficial de Operações",pp:140,limits:[3,3,2,1],credit:"Alto",privilege:"Acesso a arquivos restritos relacionados às suas operações."},
  {name:"Supervisor",pp:220,limits:[3,3,3,1],credit:"Alto",privilege:"Pode autorizar Requisições Especiais dentro de sua área de responsabilidade."},
  {name:"Comandante",pp:350,limits:[3,3,3,2],credit:"Ilimitado",privilege:"Pode mobilizar agentes, veículos e recursos especiais da DSO quando possuir autoridade sobre a operação."},
  {name:"Agente de Elite",pp:500,limits:[4,4,3,3],credit:"Ilimitado",privilege:"Maior nível regular de acesso ao Almoxarifado."},
];
export function patentForPrestige(pp){pp=Number(pp)||0;let out=PATENTS[0];for(const p of PATENTS)if(pp>=p.pp)out=p;return {...out,limits:[...out.limits]};}

export const ATTRIBUTES = {
  dex: { label: "Agilidade", abv: "AGI" },
  str: { label: "Força", abv: "FOR" },
  int: { label: "Intelecto", abv: "INT" },
  pre: { label: "Presença", abv: "PRE" },
  vit: { label: "Vigor", abv: "VIG" },
};
export const ATTRIBUTE_BY_ABV = Object.fromEntries(Object.entries(ATTRIBUTES).map(([k,v])=>[v.abv,k]));

export const CLASSES = {
  fighter: "Combatente",
  specialist: "Especialista",
  occultist: "Ocultista",
  survivor: "Sobrevivente",
};

export const SKILLS = [
  ["acrobatics","Acrobacia","dex",true,false],["animal","Adestramento","pre",false,true],["arts","Artes","pre",false,true],
  ["athleticism","Atletismo","str",false,false],["relevance","Atualidades","int",false,false],["sciences","Ciências","int",false,true],
  ["crime","Crime","dex",true,true],["diplomacy","Diplomacia","pre",false,false],["deception","Enganação","pre",false,false],
  ["resilience","Fortitude","vit",false,false],["stealth","Furtividade","dex",true,false],["initiative","Iniciativa","dex",false,false],
  ["intimidation","Intimidação","pre",false,false],["intuition","Intuição","pre",false,false],["investigation","Investigação","int",false,false],
  ["fighting","Luta","str",false,false],["medicine","Medicina","int",false,false],["occultism","Ocultismo","int",false,true],
  ["perception","Percepção","pre",false,false],["driving","Pilotagem","dex",false,true],["aim","Pontaria","dex",false,false],
  ["freeSkill","Profissão","int",false,true],["reflexes","Reflexos","dex",false,false],["religion","Religião","pre",false,true],
  ["survival","Sobrevivência","int",false,false],["tactics","Tática","int",false,true],["technology","Tecnologia","int",false,true],
  ["will","Vontade","pre",false,false],
].map(([key,label,attr,load,trained])=>({key,label,attr,load,trained}));

export function uid(){ return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`; }
export function clamp(n,min,max){ n=Number(n); return Number.isFinite(n)?Math.max(min,Math.min(max,n)):min; }
export function escapeHtml(value=""){ return String(value).replace(/[&<>'"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"}[c])); }
export function classLabel(key){ return CLASSES[key] || "Sem classe"; }
export function attrLabel(key){ return ATTRIBUTES[key]?.label || key; }
export function attrAbv(key){ return ATTRIBUTES[key]?.abv || key; }
export function trainingLabel(v){ return ({0:"Destreinado",5:"Treinado",10:"Veterano",15:"Expert"})[Number(v)] || String(v); }
export function signed(n){ n=Number(n)||0; return n>0?`+${n}`:`${n}`; }
export function stripHtml(html=""){ const div=document?.createElement?.("div"); if(div){div.innerHTML=String(html);return div.textContent||"";} return String(html).replace(/<[^>]+>/g," ").replace(/\s+/g," ").trim(); }


const PASSIVE_TRAINING = {
  "Acrobático":"acrobatics","Atlético":"athleticism","Dedos Ágeis":"crime","Detector de Mentiras":"intuition",
  "Especialista em Emergências":"medicine","Informado":"relevance","Interrogador":"intimidation","Mentiroso Nato":"deception",
  "Observador":"investigation","Pai de Pet":"animal","Palavras de Devoção":"religion","Pensamento Tático":"tactics",
  "Personalidade Esotérica":"occultism","Persuasivo":"diplomacy","Pesquisador Científico":"sciences","Proativo":"initiative",
  "Rato de Computador":"technology","Resposta Rápida":"reflexes","Sentidos Aguçados":"perception","Sobrevivencialista":"survival",
  "Sorrateiro":"stealth","Talentoso":"arts","Teimosia Obstinada":"will","Tenacidade":"resilience","Ás do Volante":"driving",
  "NEX 10% - Rastrear o Paranormal":"survival","NEX 10% - Revelação do Mal":"religion",
  "NEX 10% - Ser Amaldiçoado (Conhecimento)":"occultism","NEX 10% - Ser Amaldiçoado (Energia)":"occultism",
  "NEX 10% - Ser Amaldiçoado (Morte)":"occultism","NEX 10% - Ser Amaldiçoado (Sangue)":"occultism"
};
const PASSIVE_SKILL_FLAT = {"Vitalidade Reforçada":{resilience:2},"Vontade Inabalável":{will:2}};
function abilityNameSet(c){return new Set((c?.system?.abilities||[]).map(a=>String(a.name||"").trim()));}
function hasAbility(c,name){return abilityNameSet(c).has(name);}
export function effectiveSkill(c,skillKey){
  const raw=c?.system?.skills?.[skillKey]||{};let training=Number(raw.training)||0,mod=Number(raw.mod)||0,attr=raw.attr||SKILLS.find(s=>s.key===skillKey)?.attr||"int",auto=0;
  const names=abilityNameSet(c);
  for(const [name,key] of Object.entries(PASSIVE_TRAINING))if(key===skillKey&&names.has(name)){if(training<5)training=5;else auto+=2;}
  for(const [name,mods] of Object.entries(PASSIVE_SKILL_FLAT))if(names.has(name)&&mods[skillKey])auto+=mods[skillKey];
  if(skillKey==="will"&&names.has("Racionalidade Inflexível"))attr="int";
  if(skillKey==="occultism"&&names.has("Olhar Sinistro"))attr="pre";
  return {...raw,attr,training,mod:mod+auto,baseMod:mod,autoMod:auto};
}

export function defaultSkills(){
  return Object.fromEntries(SKILLS.map(s=>[s.key,{label:s.label,attr:s.attr,training:0,mod:0,load:s.load,trainedOnly:s.trained,name:s.key==="freeSkill"?"Profissão":"",originSource:""}]));
}

export function makeCharacter(){
  const now=Date.now();
  return {
    schema:4,id:uid(),type:"protagonist",name:"Novo Protagonista",portrait:"",controllers:[],createdAt:now,updatedAt:now,
    system:{
      class:"",origin:"",originState:{appliedOrigin:""},trilha:"",NEX:{value:0},nivel:{value:1},stage:{value:1},patent:{name:"Recruta",prestigePoints:0,itemLimits:[2,0,0,0],creditLimit:"Baixo"},
      PV:{value:0,max:0,manualMax:0},PD:{value:0,max:0,manualMax:0,perRound:1},
      defense:{value:10,dodge:10,manual:0,equipment:0},desloc:{base:9,manual:0,value:9},ritual:{DT:10,manualDT:0},
      attributes:{dex:{value:1},str:{value:1},int:{value:1},pre:{value:1},vit:{value:1}},skills:defaultSkills(),
      inventory:[],abilities:[],rituals:[],biography:"",goals:"",notes:"",
    }
  };
}

function normalizeAddedItem(x,kind){
  if(!x||typeof x!=="object") return null;
  return {
    id:String(x.id||uid()), catalogId:String(x.catalogId||x.sourceId||""), kind,
    name:String(x.name||"Sem nome").slice(0,180), image:String(x.image||x.img||"").slice(0,1200),
    description:String(x.description||"").slice(0,40000), group:String(x.group||""), path:String(x.path||""), type:String(x.type||""), autoSource:String(x.autoSource||""),
    activation:String(x.activation||""), cost:String(x.cost||""), costType:String(x.costType||""), preRequisite:String(x.preRequisite||""),
    circle:clamp(x.circle??0,0,9),element:String(x.element||""),execution:String(x.execution||""),range:String(x.range||""),target:String(x.target||""),duration:String(x.duration||""),resistance:String(x.resistance||""),studentForm:String(x.studentForm||""),trueForm:String(x.trueForm||""),
    category:String(x.category??""),weight:Number(x.weight)||0,quantity:Math.max(0,Number(x.quantity)||1),equipped:Boolean(x.equipped),defense:Number(x.defense)||0,
    critical:String(x.critical||""),proficiency:String(x.proficiency||""),attack:x.attack&&typeof x.attack==="object"?{...x.attack}:null,damage:x.damage&&typeof x.damage==="object"?{...x.damage}:null,
    folderPath:Array.isArray(x.folderPath)?x.folderPath.map(String).slice(0,8):[],categoryPath:String(x.categoryPath||""),rangeType:String(x.rangeType||""),gripType:String(x.gripType||""),ammunitionType:String(x.ammunitionType||""),range:String(x.range||""),
    modifications:Array.isArray(x.modifications)?x.modifications.filter(Boolean).map(String).slice(0,24):[],curses:Array.isArray(x.curses)?x.curses.filter(Boolean).map(String).slice(0,24):[],
  };
}

export function normalizeCharacter(raw){
  const b=makeCharacter(); if(!raw||typeof raw!=="object") return deriveCharacter(b,{refill:true});
  const c=b; c.id=String(raw.id||b.id); c.type="protagonist"; c.name=String(raw.name||b.name).slice(0,100); c.portrait=String(raw.portrait||"").slice(0,1500);
  c.controllers=Array.isArray(raw.controllers)?raw.controllers.filter(x=>typeof x==="string").slice(0,16):[]; c.createdAt=Number(raw.createdAt)||Date.now(); c.updatedAt=Number(raw.updatedAt)||Date.now();
  const s=raw.system||{}, o=c.system;
  o.class=CLASSES[s.class]?s.class:""; o.origin=String(s.origin||"").slice(0,120); o.originState={appliedOrigin:String(s.originState?.appliedOrigin||"").slice(0,120)}; o.trilha=String(s.trilha||"").slice(0,120);
  o.NEX.value=clamp(s.NEX?.value??0,0,100); o.nivel.value=clamp(s.nivel?.value??1,1,20); o.stage.value=clamp(s.stage?.value??1,1,5);
  o.patent.prestigePoints=clamp(s.patent?.prestigePoints??0,0,99999); const pat=patentForPrestige(o.patent.prestigePoints); o.patent.name=pat.name; o.patent.itemLimits=pat.limits; o.patent.creditLimit=pat.credit;
  for(const k of Object.keys(ATTRIBUTES)) o.attributes[k].value=clamp(s.attributes?.[k]?.value??1,0,10);
  // v0.1 migration: old .bonus becomes the explicit editable maximum modifier.
  o.PV.manualMax=clamp(s.PV?.manualMax??s.PV?.bonus??0,-999,9999); o.PD.manualMax=clamp(s.PD?.manualMax??s.PD?.bonus??0,-999,9999);
  o.PV.value=Number.isFinite(Number(s.PV?.value))?Number(s.PV.value):0; o.PD.value=Number.isFinite(Number(s.PD?.value))?Number(s.PD.value):0;
  o.defense.manual=clamp(s.defense?.manual??s.defense?.bonus??0,-99,99); o.desloc.base=clamp(s.desloc?.base??s.desloc?.value??9,0,99); o.desloc.manual=clamp(s.desloc?.manual??s.desloc?.bonus??0,-99,99); o.ritual.manualDT=clamp(s.ritual?.manualDT??0,-99,99);
  for(const sk of SKILLS){ const v=s.skills?.[sk.key]||{}; const base=o.skills[sk.key]; base.attr=ATTRIBUTES[v.attr]?v.attr:sk.attr; base.training=[0,5,10,15].includes(Number(v.training))?Number(v.training):[0,5,10,15].includes(Number(v.degree?.value))?Number(v.degree.value):0; base.mod=clamp(v.mod??v.value??0,-99,99); if(sk.key==="freeSkill")base.name=String(v.name||"Profissão").slice(0,80); base.originSource=String(v.originSource||"").slice(0,120); }
  o.inventory=(Array.isArray(s.inventory)?s.inventory:[]).map(x=>normalizeAddedItem(x,"inventory")).filter(Boolean).slice(0,300);
  o.abilities=(Array.isArray(s.abilities)?s.abilities:[]).map(x=>normalizeAddedItem(x,"ability")).filter(Boolean).slice(0,300);
  o.rituals=(Array.isArray(s.rituals)?s.rituals:[]).map(x=>normalizeAddedItem(x,"ritual")).filter(Boolean).slice(0,300);
  o.biography=String(s.biography||"").slice(0,20000); o.goals=String(s.goals||"").slice(0,10000); o.notes=String(s.notes||"").slice(0,20000);
  const hadPD=Number(s.PD?.value)>0 || Number(s.PD?.max)>0;
  deriveCharacter(c,{refill:false});
  if(!hadPD){ c.system.PD.value=c.system.PD.max; }
  if(!Number.isFinite(Number(s.PV?.value))||Number(s.PV?.value)<=0){ c.system.PV.value=c.system.PV.max; }
  c.system.PV.value=clamp(c.system.PV.value,0,c.system.PV.max); c.system.PD.value=clamp(c.system.PD.value,0,c.system.PD.max);
  return c;
}

export function progressionValue(c){
  if(c.system.class==="survivor") return Number(c.system.stage.value)||1;
  return Number(c.system.nivel.value)||1;
}

const MOD_EFFECTS=Object.fromEntries([...WEAPON_MODIFICATIONS,...AMMO_MODIFICATIONS,...PROTECTION_MODIFICATIONS,...ACCESSORY_MODIFICATIONS].map(m=>[m.id,m.effects||{}]));
const CURSE_BY_ID=Object.fromEntries(ITEM_CURSES.map(c=>[c.id,c]));
export function itemDerived(item){
  let baseWeight=Math.max(0,Number(item?.weight)||0);if(item?.type==='protection'){if(/Proteção Leve/i.test(item?.name||''))baseWeight=2;else if(/Proteção Pesada/i.test(item?.name||''))baseWeight=5;else if(/Escudo/i.test(item?.name||''))baseWeight=2;}const out={category:Math.max(0,Number(item?.category)||0),weight:baseWeight,defense:Number(item?.defense)||0,attackBonus:0,damageFlat:0,extraBaseDie:0,extraDamage:[],threatDelta:0,critMultiplierDelta:0,rangeSteps:0,automatic:false,rd:0,defenseBonus:0,movementBonus:0,ritualDtBonus:0,pvBonus:0,pdBonus:0,attributeBonus:{dex:0,str:0,int:0,pre:0,vit:0}};
  const mods=Array.isArray(item?.modifications)?item.modifications:[];
  out.category+=mods.length;
  for(const id of mods){const e=MOD_EFFECTS[id]||{};for(const k of ['weightDelta','attackBonus','damageFlat','extraBaseDie','threatDelta','critMultiplierDelta','rangeSteps','defenseBonus','movementBonus','ritualDtBonus','pvBonus','pdBonus'])if(e[k])out[k]=(out[k]||0)+e[k];if(e.automatic)out.automatic=true;if(e.rd)out.rd=Math.max(out.rd,e.rd);if(e.extraDamage)out.extraDamage.push(e.extraDamage);}
  const curses=Array.isArray(item?.curses)?item.curses:[]; if(curses.length)out.category+=2+Math.max(0,curses.length-1);
  for(const id of curses){const e=CURSE_BY_ID[id]?.effects||{};for(const k of ['weightDelta','attackBonus','damageFlat','extraBaseDie','threatDelta','critMultiplierDelta','rangeSteps','defenseBonus','movementBonus','ritualDtBonus','pvBonus','pdBonus'])if(e[k])out[k]=(out[k]||0)+e[k];if(e.doubleThreat)out.doubleThreat=true;if(e.extraDamage)out.extraDamage.push(e.extraDamage);if(e.attributeBonus)for(const [a,n] of Object.entries(e.attributeBonus))out.attributeBonus[a]=(out.attributeBonus[a]||0)+(Number(n)||0);}
  out.weight=Math.max(0,out.weight+(out.weightDelta||0)); out.defense+=out.defenseBonus||0; return out;
}
export function effectiveItemCategory(item,c=null){let cat=itemDerived(item).category;if(c&&item?.type==='generalEquipment'&&hasAbility(c,'NEX 40% - Remendão'))cat-=1;return Math.max(0,cat);}
export function inventoryState(c){
  const s=c.system,pat=patentForPrestige(s.patent?.prestigePoints||0),counts=[0,0,0,0],FOR=Number(s.attributes.str.value)||0,INT=Number(s.attributes.int.value)||0,names=abilityNameSet(c),capacityBase=names.has('NEX 10% - Inventário Otimizado')?FOR+INT:FOR,max=capacityBase===0?2:capacityBase*5;let used=0;
  for(const item of s.inventory||[]){const q=Math.max(0,Number(item.quantity)||0),d=itemDerived(item),cat=effectiveItemCategory(item,c);used+=d.weight*q;if(cat>=1&&cat<=4)counts[cat-1]+=q;}
  return {patent:pat,counts,limits:pat.limits,credit:pat.credit,used:Math.round(used*100)/100,max,hardMax:max*2,overloaded:used>max,invalid:used>max*2};
}
function equippedDefense(inventory){
  const equipped=(inventory||[]).filter(i=>i.type==="protection"&&i.equipped); let shield=0,armor=0;
  for(const item of equipped){const v=itemDerived(item).defense;if(/escudo/i.test(item.name))shield+=v;else armor=Math.max(armor,v);}return armor+shield;
}

export function deriveCharacter(c,{refill=false,previousMax=null}={}){
  const s=c.system,level=progressionValue(c),adjust=Math.max(0,level-1),names=abilityNameSet(c);
  const pat=patentForPrestige(s.patent?.prestigePoints||0);s.patent.name=pat.name;s.patent.itemLimits=pat.limits;s.patent.creditLimit=pat.credit;
  const itemAuto={PV:0,PD:0,defense:0,movement:0,ritualDT:0,attrs:{dex:0,str:0,int:0,pre:0,vit:0}};
  for(const item of s.inventory||[]){if(!item.equipped)continue;const d=itemDerived(item);itemAuto.PV+=d.pvBonus||0;itemAuto.PD+=d.pdBonus||0;itemAuto.defense+=item.type==='protection'?0:(d.defenseBonus||0);itemAuto.movement+=d.movementBonus||0;itemAuto.ritualDT+=d.ritualDtBonus||0;for(const a of Object.keys(itemAuto.attrs))itemAuto.attrs[a]+=d.attributeBonus?.[a]||0;}
  const VIG=(Number(s.attributes.vit.value)||0)+itemAuto.attrs.vit,PRE=(Number(s.attributes.pre.value)||0)+itemAuto.attrs.pre,INT=(Number(s.attributes.int.value)||0)+itemAuto.attrs.int;
  const determinationAttribute=names.has("Racionalidade Inflexível")?INT:PRE;
  let basePV=8+VIG+adjust*2, basePD=4+determinationAttribute+adjust*2;
  if(s.class==="fighter"){basePV=20+VIG+adjust*(4+VIG);basePD=6+determinationAttribute+adjust*(3+determinationAttribute);}
  if(s.class==="specialist"){basePV=16+VIG+adjust*(3+VIG);basePD=8+determinationAttribute+adjust*(4+determinationAttribute);}
  if(s.class==="occultist"){basePV=12+VIG+adjust*(2+VIG);basePD=10+determinationAttribute+adjust*(5+determinationAttribute);}
  if(s.class==="survivor"){basePV=8+VIG+adjust*2;basePD=4+determinationAttribute+adjust*2;}
  let autoPV=itemAuto.PV,autoPD=itemAuto.PD,autoDefense=itemAuto.defense,autoMovement=itemAuto.movement,autoPerRound=0;
  if(names.has("Calejado"))autoPV+=level;
  if(names.has("Vitalidade Reforçada"))autoPV+=level;
  if(names.has("NEX 10% - Casca Grossa"))autoPV+=level;
  if(names.has("Durão"))autoPV+=4+(Number(s.stage?.value||1)>=3?2:0);
  if(names.has("Personalidade Esotérica"))autoPD+=3;
  if(names.has("Vontade Inabalável"))autoPD+=Math.floor(level/2);
  if(names.has("Dedicação")){autoPD+=Math.ceil(level/2);autoPerRound+=1;}
  if(names.has("Patrulha"))autoDefense+=2;
  if(names.has("Reflexos Defensivos"))autoDefense+=2;
  if(names.has("Atlético"))autoMovement+=3;
  if(names.has("Correria Desesperada"))autoMovement+=3;
  const hasHeavy=(s.inventory||[]).some(i=>i.type==="protection"&&i.equipped&&/Proteção Pesada|Escudo/i.test(i.name));
  if(names.has("Tanque de Guerra")&&hasHeavy)autoDefense+=2;
  const oldPV=previousMax?.PV ?? (Number(s.PV.max)||0), oldPD=previousMax?.PD ?? (Number(s.PD.max)||0);
  const wasFullPV=Number(s.PV.value)===oldPV, wasFullPD=Number(s.PD.value)===oldPD;
  s.auto={PV:autoPV,PD:autoPD,defense:autoDefense,movement:autoMovement,perRound:autoPerRound,determinationAttribute:names.has("Racionalidade Inflexível")?"INT":"PRE"};
  s.PV.max=Math.max(0,Math.trunc(basePV+autoPV+(Number(s.PV.manualMax)||0))); s.PD.max=Math.max(0,Math.trunc(basePD+autoPD+(Number(s.PD.manualMax)||0)));
  if(refill||wasFullPV)s.PV.value=s.PV.max; else s.PV.value=clamp(s.PV.value,0,s.PV.max);
  if(refill||wasFullPD)s.PD.value=s.PD.max; else s.PD.value=clamp(s.PD.value,0,s.PD.max);
  s.PD.perRound=(s.class==="survivor"?1:Math.max(1,level))+autoPerRound;
  const agi=(Number(s.attributes.dex.value)||0)+itemAuto.attrs.dex, ref=effectiveSkill(c,"reflexes");
  s.defense.equipment=equippedDefense(s.inventory); s.defense.value=10+agi+s.defense.equipment+autoDefense+(Number(s.defense.manual)||0); s.defense.dodge=s.defense.value+(Number(ref.training)||0)+(Number(ref.mod)||0);
  s.desloc.value=Math.max(0,(Number(s.desloc.base)||9)+autoMovement+(Number(s.desloc.manual)||0));
  s.ritual.DT=10+s.PD.perRound+PRE+itemAuto.ritualDT+(Number(s.ritual.manualDT)||0); const inv=inventoryState(c); s.spaces={value:inv.used,max:inv.max,hardMax:inv.hardMax,overloaded:inv.overloaded,invalid:inv.invalid}; if(inv.overloaded){s.defense.value-=5;s.defense.dodge-=5;s.desloc.value=Math.max(0,s.desloc.value-3);} c.schema=4;
  return c;
}

export function catalogSummary(character){
  const c=deriveCharacter(character); const s=c.system;
  return {id:c.id,name:c.name,portrait:c.portrait,class:s.class,origin:s.origin,trilha:s.trilha,NEX:s.NEX.value,nivel:s.nivel.value,controllers:[...c.controllers],updatedAt:c.updatedAt,PV:{value:s.PV.value,max:s.PV.max},PD:{value:s.PD.value,max:s.PD.max}};
}
export function defaultCatalog(gmId=""){return {schema:2,gmId,settings:{determination:true,separateLevelNex:true},characters:[]};}
export function normalizeCatalog(raw,gmId=""){
  const b=defaultCatalog(gmId); if(!raw||typeof raw!=="object")return b; b.gmId=String(raw.gmId||gmId||"");
  b.characters=Array.isArray(raw.characters)?raw.characters.filter(x=>x?.id).slice(0,80).map(x=>({...x,PD:x.PD||{value:0,max:0}})):[]; return b;
}

export function storageKey(roomId){return `dso.system.characters.${roomId}`;}
export function cacheKey(roomId,playerId){return `dso.system.cache.${roomId}.${playerId}`;}
export function loadStore(roomId){try{const v=JSON.parse(localStorage.getItem(storageKey(roomId))||"{}");return v&&typeof v==="object"?v:{};}catch{return{};}}
export function saveStore(roomId,store){localStorage.setItem(storageKey(roomId),JSON.stringify(store));}
export function loadCache(roomId,playerId){try{return JSON.parse(localStorage.getItem(cacheKey(roomId,playerId))||"{}");}catch{return{};}}
export function saveCache(roomId,playerId,cache){try{localStorage.setItem(cacheKey(roomId,playerId),JSON.stringify(cache));}catch{}}
export function isAuthorized(c,playerId,role){return role==="GM"||c.controllers?.includes(playerId);}

export function profileFromCharacter(c){
  const s=c.system; const attrs={}; for(const [k,v] of Object.entries(ATTRIBUTES))attrs[v.abv]=Number(s.attributes[k]?.value)||0;
  const skills={}; for(const def of SKILLS){const raw=s.skills[def.key]||{},sk=effectiveSkill(c,def.key);const name=def.key==="freeSkill"?(raw.name||"Profissão"):def.label;skills[name]={attribute:attrAbv(sk.attr||def.attr),training:Number(sk.training)||0,other:Number(sk.mod)||0};}
  return {schema:1,protagonistId:c.id,protagonistName:c.name,attributes:attrs,skills,updatedAt:c.updatedAt};
}

export function effectiveAttribute(c,key){let n=Number(c?.system?.attributes?.[key]?.value)||0;for(const item of c?.system?.inventory||[]){if(item.equipped)n+=itemDerived(item).attributeBonus?.[key]||0;}return n;}

export function randomInt(max){const a=new Uint32Array(1);if(globalThis.crypto?.getRandomValues){const range=0x100000000,limit=range-(range%max);do{crypto.getRandomValues(a)}while(a[0]>=limit);return(a[0]%max)+1;}return Math.floor(Math.random()*max)+1;}
export function rollSkill(c,skillKey){const skill=effectiveSkill(c,skillKey);if(!c.system.skills[skillKey])throw new Error("Perícia inexistente");const attr=skill.attr,score=effectiveAttribute(c,attr),bonus=(Number(skill.training)||0)+(Number(skill.mod)||0),count=score<=0?2:score,rolls=Array.from({length:count},()=>randomInt(20)),kept=score<=0?Math.min(...rolls):Math.max(...rolls);return{skill,attr,score,bonus,rolls,kept,total:kept+bonus,formula:`${count}d20${score<=0?"kl":"kh"}${bonus?bonus>0?` + ${bonus}`:` - ${Math.abs(bonus)}`:""}`};}
export function makeChatEntry(c,skillKey,roll,author){const skillName=skillKey==="freeSkill"?(c.system.skills.freeSkill.name||"Profissão"):roll.skill.label;return{kind:"roll",id:uid(),authorId:author.id,authorName:c.name||author.name||"Protagonista",authorColor:author.color||"#b51d26",createdAt:Date.now(),title:`Teste de ${skillName} com ${attrLabel(roll.attr)}`,subtitle:roll.score<=0?"Atributo 0 — mantém o menor d20":"Mantém o maior d20",formula:roll.formula,total:roll.total,modifier:roll.bonus,natural:roll.kept,terms:[{count:roll.rolls.length,sides:20,rolls:roll.rolls,subtotal:roll.kept,keep:roll.score<=0?"lowest":"highest",kept:roll.kept}]};}

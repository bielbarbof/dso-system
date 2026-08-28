export const ID = "com.desordenados.dso-system";
export const ROOM_KEY = `${ID}/catalog-v1`;
export const SYNC_CHANNEL = `${ID}/sync-v1`;
export const CHAT_CHANNEL = "com.desordenados.chat-dados/chat";
export const TOKEN_KEY = `${ID}/character`;
export const SHEET_MODAL_ID = `${ID}/sheet`;
export const LINK_MODAL_ID = `${ID}/link`;

export const ATTRIBUTES = {
  dex: { label: "Agilidade", abv: "AGI" },
  str: { label: "Força", abv: "FOR" },
  int: { label: "Intelecto", abv: "INT" },
  pre: { label: "Presença", abv: "PRE" },
  vit: { label: "Vigor", abv: "VIG" },
};

export const CLASSES = {
  fighter: "Combatente",
  specialist: "Especialista",
  occultist: "Ocultista",
  survivor: "Sobrevivente",
};

export const ORIGINS = ["Acadêmico","Agente de Saúde","Amigo dos Animais","Amnésico","Artista","Astronauta","Atleta","Blaster","Body Builder","Chef","Chef do Outro Lado","Cientista Forense","Colegial","Cosplayer","Criminoso","Cultista Arrependido","Desgarrado","Diplomata","Dublê","Engenheiro","Escritor","Executivo","Experimento","Explorador","Fanático por Criaturas","Fotógrafo","Gaudério Abutre","Ginasta","Inventor Paranormal","Investigador","Jornalista","Jovem Místico","Legista do Turno da Noite","Lutador","Magnata","Mateiro","Mercenário","Mergulhador","Militar","Motorista","Nerd Entusiasta","Operário","Personal Trainer","Policial","Professor","Profetizado","Psicólogo","Religioso","Reporter Investigativo","Revoltado","Servidor Público","Teórico da Conspiração","T.I.","Trabalhador Rural","Trambiqueiro","Universitário","Vítima"];
export const TRAILS = ["Agente Secreto","Aniquilador","Caçador","Comandante de Campo","Monstruoso","Operações Especiais","Tropa de Choque","Guerreiro","Infiltrador","Atirador de Elite","Bibliotecário","Médico de Campo","Muambeiro","Negociador","Perseverante","Técnico","Conduíte","Exorcista","Flagelador","Graduado","Intuitivo","Lâmina Paranormal","Parapsicólogo","Possuído","Durão","Esperto","Esotérico"];

export const SKILLS = [
  ["acrobatics","Acrobacia","dex",true,false],["animal","Adestramento","pre",false,true],["arts","Artes","pre",false,false],
  ["athleticism","Atletismo","str",false,false],["relevance","Atualidades","int",false,false],["sciences","Ciências","int",false,false],
  ["crime","Crime","dex",true,true],["diplomacy","Diplomacia","pre",false,false],["deception","Enganação","pre",false,false],
  ["resilience","Fortitude","vit",false,false],["stealth","Furtividade","dex",true,false],["initiative","Iniciativa","dex",false,false],
  ["intimidation","Intimidação","pre",false,false],["intuition","Intuição","pre",false,false],["investigation","Investigação","int",false,false],
  ["fighting","Luta","str",false,false],["medicine","Medicina","int",false,false],["occultism","Ocultismo","int",false,true],
  ["perception","Percepção","pre",false,false],["driving","Pilotagem","dex",false,true],["aim","Pontaria","dex",false,false],
  ["reflexes","Reflexos","dex",false,false],["religion","Religião","pre",false,true],["survival","Sobrevivência","int",false,false],
  ["tactics","Tática","int",false,true],["technology","Tecnologia","int",false,true],["will","Vontade","pre",false,false],
  ["freeSkill","Perícia Livre","int",false,false],
].map(([key,label,attr,load,trained])=>({key,label,attr,load,trained}));

export function uid(){ return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`; }
export function clamp(n,min,max){ n=Number(n); return Number.isFinite(n)?Math.max(min,Math.min(max,n)):min; }
export function escapeHtml(value=""){ return String(value).replace(/[&<>'"]/g, c=>({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"}[c])); }
export function signed(n){ n=Number(n)||0; return n>0?`+${n}`:`${n}`; }
export function classLabel(key){ return CLASSES[key] || "Sem classe"; }
export function attrLabel(key){ return ATTRIBUTES[key]?.label || key; }
export function trainingLabel(v){ return ({0:"Destreinado",5:"Treinado",10:"Veterano",15:"Expert"})[Number(v)] || String(v); }

export function defaultSkills(){
  return Object.fromEntries(SKILLS.map(s=>[s.key,{label:s.label,attr:s.attr,training:0,mod:0,load:s.load,trained:s.trained,name:s.key==='freeSkill'?'Perícia Livre':''}]));
}

export function makeCharacter(){
  const now=Date.now();
  return {
    schema:1,id:uid(),type:"agent",name:"Novo Agente",portrait:"",controllers:[],createdAt:now,updatedAt:now,
    system:{
      class:"",origin:"",trilha:"",NEX:{value:5},nivel:{value:1},stage:{value:1},
      patent:{name:"Recruta",prestigePoints:0},
      PV:{value:20,max:20,bonus:0},SAN:{value:12,max:12,bonus:0},PE:{value:2,max:2,bonus:0,perRound:1},PD:{value:0,max:0,bonus:0,perRound:1},
      defense:{base:10,bonus:0,value:11,dodge:11},desloc:{value:9,bonus:0},
      attributes:{dex:{value:1,bonus:0},str:{value:1,bonus:0},int:{value:1,bonus:0},pre:{value:1,bonus:0},vit:{value:1,bonus:0}},
      skills:defaultSkills(),ritual:{DT:10},resources:{res1:{value:0,max:0,label:""},res2:{value:0,max:0,label:""},res3:{value:0,max:0,label:""}},
      inventory:[],abilities:[],rituals:[],biography:"",goals:"",
    }
  };
}

export function normalizeCharacter(raw){
  const base=makeCharacter();
  if(!raw||typeof raw!=="object") return base;
  const c=structuredClone ? structuredClone(base) : JSON.parse(JSON.stringify(base));
  c.id=String(raw.id||base.id); c.name=String(raw.name||base.name).slice(0,80); c.portrait=String(raw.portrait||"").slice(0,1000);
  c.controllers=Array.isArray(raw.controllers)?raw.controllers.filter(x=>typeof x==="string").slice(0,16):[];
  c.createdAt=Number(raw.createdAt)||Date.now(); c.updatedAt=Number(raw.updatedAt)||Date.now();
  const s=raw.system||{}; const o=c.system;
  o.class=CLASSES[s.class]?s.class:""; o.origin=String(s.origin||"").slice(0,100); o.trilha=String(s.trilha||"").slice(0,100);
  o.NEX.value=clamp(s.NEX?.value ?? 5,0,100); o.nivel.value=clamp(s.nivel?.value ?? 1,1,99); o.stage.value=clamp(s.stage?.value ?? 1,1,20);
  o.patent.name=String(s.patent?.name||"Recruta").slice(0,60); o.patent.prestigePoints=clamp(s.patent?.prestigePoints ?? 0,-9999,99999);
  for(const k of Object.keys(ATTRIBUTES)){ o.attributes[k].value=clamp(s.attributes?.[k]?.value ?? 1,0,10); o.attributes[k].bonus=clamp(s.attributes?.[k]?.bonus ?? 0,-20,20); }
  for(const r of ["PV","SAN","PE","PD"]){ o[r].value=clamp(s[r]?.value ?? o[r].value,-999,9999); o[r].bonus=clamp(s[r]?.bonus ?? 0,-999,999); }
  o.defense.bonus=clamp(s.defense?.bonus ?? 0,-99,99); o.desloc.value=clamp(s.desloc?.value ?? 9,0,999); o.desloc.bonus=clamp(s.desloc?.bonus ?? 0,-99,99);
  for(const sk of SKILLS){ const v=s.skills?.[sk.key]||{}; o.skills[sk.key]={...o.skills[sk.key],attr:ATTRIBUTES[v.attr]?v.attr:sk.attr,training:[0,5,10,15].includes(Number(v.training))?Number(v.training):0,mod:clamp(v.mod??0,-99,99),name:String(v.name||o.skills[sk.key].name||"").slice(0,80)}; }
  for(const key of ["inventory","abilities","rituals"]){ o[key]=Array.isArray(s[key])?s[key].filter(x=>x&&typeof x==="object").slice(0,100).map(x=>({...x,id:String(x.id||uid())})):[]; }
  o.biography=String(s.biography||"").slice(0,10000); o.goals=String(s.goals||"").slice(0,5000);
  return deriveCharacter(c);
}

export function progressionValue(c, settings={progression:"nex"}){
  if(c.system.class==="survivor") return Number(c.system.stage.value)||1;
  if(settings.progression==="level") return Number(c.system.nivel.value)||1;
  const nex=Number(c.system.NEX.value)||0; return nex<99?Math.floor(nex/5):20;
}

export function deriveCharacter(input, settings={progression:"nex",sanity:true}){
  const c=input; const s=c.system; const progress=progressionValue(c,settings); const adjust=progress-1; const advanced=progress>1;
  const VIG=Number(s.attributes.vit.value)||0, PRE=Number(s.attributes.pre.value)||0;
  const pvB=Number(s.PV.bonus)||0,sanB=Number(s.SAN.bonus)||0,peB=Number(s.PE.bonus)||0,pdB=Number(s.PD.bonus)||0;
  let pv=s.PV.max,san=s.SAN.max,pe=s.PE.max,pd=s.PD.max;
  if(s.class==="fighter"){ pv=20+VIG+(advanced?adjust*(4+VIG):0)+pvB; san=12+(advanced?adjust*3:0)+sanB; pe=2+PRE+(advanced?adjust*(2+PRE):0)+peB; pd=6+PRE+(advanced?adjust*(3+PRE):0)+pdB; }
  if(s.class==="specialist"){ pv=16+VIG+(advanced?adjust*(3+VIG):0)+pvB; san=16+(advanced?adjust*4:0)+sanB; pe=3+PRE+(advanced?adjust*(3+PRE):0)+peB; pd=8+PRE+(advanced?adjust*(4+PRE):0)+pdB; }
  if(s.class==="occultist"){ pv=12+VIG+(advanced?adjust*(2+VIG):0)+pvB; san=20+(advanced?adjust*5:0)+sanB; pe=4+PRE+(advanced?adjust*(4+PRE):0)+peB; pd=10+PRE+(advanced?adjust*(5+PRE):0)+pdB; }
  if(s.class==="survivor"){ pv=8+VIG+(advanced?adjust*2:0)+pvB; san=8+(advanced?adjust*2:0)+sanB; pe=2+PRE+(advanced?adjust:0)+peB; pd=4+PRE+(advanced?adjust*2:0)+pdB; }
  s.PV.max=Math.max(0,pv); s.SAN.max=Math.max(0,san); s.PE.max=Math.max(0,pe); s.PD.max=Math.max(0,pd);
  s.PE.perRound=s.class==="survivor"?1:Math.max(0,progress); s.PD.perRound=s.class==="survivor"?1:Math.max(0,progress);
  const agi=Number(s.attributes.dex.value)||0; const ref=s.skills.reflexes||{training:0,mod:0};
  s.defense.value=10+agi+(Number(s.defense.bonus)||0); s.defense.dodge=s.defense.value+(Number(ref.training)||0)+(Number(ref.mod)||0);
  s.ritual.DT=10+(s.class==="survivor"?0:Math.max(0,progress))+PRE;
  return c;
}

export function catalogSummary(c){ c=deriveCharacter(c); return {id:c.id,name:c.name,portrait:c.portrait,class:c.system.class,origin:c.system.origin,trilha:c.system.trilha,NEX:c.system.NEX.value,nivel:c.system.nivel.value,controllers:[...c.controllers],updatedAt:c.updatedAt,PV:{value:c.system.PV.value,max:c.system.PV.max},PE:{value:c.system.PE.value,max:c.system.PE.max},SAN:{value:c.system.SAN.value,max:c.system.SAN.max}}; }
export function defaultCatalog(gmId=""){ return {schema:1,gmId,settings:{progression:"nex",sanity:true},characters:[]}; }
export function normalizeCatalog(raw,gmId=""){ const b=defaultCatalog(gmId); if(!raw||typeof raw!=="object")return b; b.gmId=String(raw.gmId||gmId||""); b.settings.progression=raw.settings?.progression==="level"?"level":"nex"; b.settings.sanity=raw.settings?.sanity!==false; b.characters=Array.isArray(raw.characters)?raw.characters.filter(x=>x?.id).slice(0,40):[]; return b; }
export function storageKey(roomId){ return `dso.system.characters.${roomId}`; }
export function cacheKey(roomId,playerId){ return `dso.system.cache.${roomId}.${playerId}`; }
export function loadStore(roomId){ try{ const v=JSON.parse(localStorage.getItem(storageKey(roomId))||"{}"); return v&&typeof v==="object"?v:{}; }catch{return{};} }
export function saveStore(roomId,store){ localStorage.setItem(storageKey(roomId),JSON.stringify(store)); }
export function loadCache(roomId,playerId){ try{return JSON.parse(localStorage.getItem(cacheKey(roomId,playerId))||"{}");}catch{return{};} }
export function saveCache(roomId,playerId,cache){ try{localStorage.setItem(cacheKey(roomId,playerId),JSON.stringify(cache));}catch{} }
export function isAuthorized(c,playerId,role){ return role==="GM" || c.controllers?.includes(playerId); }

export function randomInt(max){ const a=new Uint32Array(1); if(globalThis.crypto?.getRandomValues){ const range=0x100000000,limit=range-(range%max); do{crypto.getRandomValues(a)}while(a[0]>=limit); return (a[0]%max)+1;} return Math.floor(Math.random()*max)+1; }
export function rollSkill(c,skillKey){ const skill=c.system.skills[skillKey]; if(!skill)throw new Error("Perícia inexistente"); const attr=skill.attr; const score=Number(c.system.attributes[attr]?.value)||0; const bonus=(Number(skill.training)||0)+(Number(skill.mod)||0); const count=score<=0?2:score; const rolls=Array.from({length:count},()=>randomInt(20)); const kept=score<=0?Math.min(...rolls):Math.max(...rolls); return {skill,attr,score,bonus,rolls,kept,total:kept+bonus,formula:`${count}d20${score<=0?"kl":"kh"}${bonus?bonus>0?` + ${bonus}`:` - ${Math.abs(bonus)}`:""}`}; }
export function makeChatEntry(c,skillKey,roll,author){ const skillName=skillKey==="freeSkill"?(c.system.skills.freeSkill.name||"Perícia Livre"):roll.skill.label; return {kind:"roll",id:uid(),authorId:author.id,authorName:c.name||author.name||"Agente",authorColor:author.color||"#b51d26",createdAt:Date.now(),title:`Teste de ${skillName} com ${attrLabel(roll.attr)}`,subtitle:roll.score<=0?"Atributo 0 — mantém o menor d20":"Mantém o maior d20",formula:roll.formula,total:roll.total,modifier:roll.bonus,natural:roll.kept,terms:[{count:roll.rolls.length,sides:20,rolls:roll.rolls,subtotal:roll.kept,keep:roll.score<=0?"lowest":"highest",kept:roll.kept}]}; }

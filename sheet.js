import OBR from "https://esm.unpkg.com/@owlbear-rodeo/sdk@3.1.0";
import {ATTRIBUTES,CLASSES,SKILLS,SYNC_CHANNEL,CHAT_CHANNEL,SKILL_BRIDGE_CHANNEL,SHEET_MODAL_ID,ROOM_KEY,LEGACY_ROOM_KEY,makeCharacter,normalizeCharacter,deriveCharacter,loadStore,saveStore,loadCache,saveCache,catalogSummary,normalizeCatalog,rollSkill,makeChatEntry,uid,isAuthorized,escapeHtml,trainingLabel,profileFromCharacter,attrAbv,effectiveSkill} from "./core.js";
const $=s=>document.querySelector(s), params=new URLSearchParams(location.search);
const state={role:"PLAYER",playerId:"preview",connectionId:"preview",name:"Protagonista",color:"#b51d26",roomId:"preview-room",catalog:null,char:null,isNew:params.get("new")==="1",canEdit:false,requestId:null,dirty:false,party:[],compendium:null,library:{type:"",primary:"Todos",secondary:"Todos",query:""}};
const d20=`<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.35"><path d="m16 2 12 8v12l-12 8L4 22V10Z"/><path d="m16 2 5 14-5 14-5-14Z"/><path d="M4 10l17 6 7-6M4 22l12-6 12 6"/><path d="m11 16 5-5 5 5-5 5Z"/></svg>`;
const chevron=`<svg class="expand-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m6 9 6 6 6-6"/></svg>`;
const ELEMENTS={blood:"Sangue",knowledge:"Conhecimento",energy:"Energia",death:"Morte",fear:"Medo",varies:"Varia"};
const RITUAL_LABELS={
  execution:{default:"Padrão",complete:"Completa",full:"Completa",reaction:"Reação",free:"Livre"},
  range:{touch:"Toque",short:"Curto",medium:"Médio",long:"Longo",extreme:"Extremo",personal:"Pessoal",self:"Pessoal",unlimited:"Ilimitado"},
  target:{creatures:"Criatura(s)",people:"Pessoa(s)",area:"Área",self:"Você",equipment:"Equipamento",object:"Objeto",weapons:"Arma"},
  duration:{scene:"Cena",instantaneous:"Instantânea",sustained:"Sustentada",setDuration:"Definida pelo ritual",permanent:"Permanente",special:"Especial"},
  resistance:{partial:"Parcial",nullifies:"Anula",none:"Nenhuma",reducesByHalf:"Reduz à metade",will:"Vontade",fortitude:"Fortitude","Willpower negates":"Vontade anula"}
};
function ritualLabel(field,value){const raw=String(value||"");return RITUAL_LABELS[field]?.[raw]||raw}
const GROUP_SHORT={"Trilhas — Combatente":"Trilhas Combatente","Trilhas — Especialista":"Trilhas Especialista","Trilhas — Ocultista":"Trilhas Ocultista"};
function opt(obj,current){return Object.entries(obj).map(([k,v])=>`<option value="${escapeHtml(k)}" ${k===current?"selected":""}>${escapeHtml(v)}</option>`).join("")}
function setDirty(v=true){state.dirty=v;$("#saveState").textContent=v?"ALTERAÇÕES PENDENTES":"SINCRONIZADO"}
function toast(t){const e=$("#toast");e.textContent=t;e.classList.remove("hidden");setTimeout(()=>e.classList.add("hidden"),1800)}
function pct(v,m){return m>0?Math.max(0,Math.min(100,(Number(v)||0)/(Number(m)||1)*100)):0}
function adaptCampaignText(value="", item=null, kind=""){
  let text=String(value||"")
    .replace(/Pontos de Esforço/gi,"Pontos de Determinação")
    .replace(/pontos de esforço/gi,"pontos de determinação")
    .replace(/\bPE\b/g,"PD")
    .replace(/Sanidade/gi,"Determinação")
    .replace(/\bSAN\b/g,"PD");
  if(kind==="abilities" && item && !/Poderes Paranormais/i.test(item.group||"")){
    text=text.replace(/NEX\s*(\d{1,2}|99)%/gi,(_,n)=>`Nível ${Math.max(1,Math.ceil(Number(n)/5))}`);
  }
  return text;
}
function displayItemName(item,kind=""){
  const name=String(item?.name||"Sem nome");
  if(kind==="abilities" && !/Poderes Paranormais/i.test(item?.group||""))return name.replace(/^NEX\s*(\d{1,2}|99)%\s*[-–—]\s*/i,(_,n)=>`NÍVEL ${Math.max(1,Math.ceil(Number(n)/5))} — `);
  return name;
}
function sanitizeHtml(html="",item=null,kind=""){
  const doc=new DOMParser().parseFromString(`<div>${adaptCampaignText(html,item,kind)}</div>`,"text/html"),root=doc.body.firstElementChild,allowed=new Set(["P","BR","STRONG","B","EM","I","UL","OL","LI","H3","H4","BLOCKQUOTE","SPAN"]);
  const walk=(node)=>{for(const child of [...node.children]){if(!allowed.has(child.tagName)){child.replaceWith(...child.childNodes);continue;}for(const a of [...child.attributes])child.removeAttribute(a.name);walk(child)}};walk(root);return root.innerHTML;
}
function plainMeta(value){
  const doc=new DOMParser().parseFromString(String(value||""),"text/html");
  return String(doc.body.textContent||"").replace(/\s+/g," ").trim();
}
function imageOrMark(item,mark="◇"){return item?.image?`<img src="${escapeHtml(item.image)}" alt="" onerror="this.remove()">`:mark}
function updateResourceBars(){const s=state.char.system;$("#pvFill").style.width=`${pct(s.PV.value,s.PV.max)}%`;$("#pdFill").style.width=`${pct(s.PD.value,s.PD.max)}%`}
function renderDerived(){const s=state.char.system;$("#pvMax").textContent=s.PV.max;$("#pdMax").textContent=s.PD.max;$("#defense").textContent=s.defense.value;$("#dodge").textContent=s.defense.dodge;$("#ritualDt").textContent=s.ritual.DT;$("#pdRound").textContent=s.PD.perRound;updateResourceBars();$("#derivedGrid").innerHTML=[['PV BASE + AJUSTE',s.PV.max],['PD BASE + AJUSTE',s.PD.max],['DEFESA',s.defense.value],['ESQUIVA',s.defense.dodge],['DESLOCAMENTO',`${s.desloc.value}m`]].map(([a,b])=>`<div class="derived-card"><span>${a}</span><strong>${b}</strong></div>`).join("");renderCombat()}
function renderAttributes(){const s=state.char.system;$("#attributes").innerHTML=Object.entries(ATTRIBUTES).map(([k,a])=>`<label class="attr-card" title="${escapeHtml(a.label)}"><span>${a.abv}</span><input data-attr="${k}" type="number" min="0" max="10" value="${s.attributes[k].value}" aria-label="${escapeHtml(a.label)}"></label>`).join("")}
function renderSkillAttributes(){const s=state.char.system;$("#skillAttributes").innerHTML=Object.entries(ATTRIBUTES).map(([k,a])=>`<label class="skill-attribute-cell" title="${escapeHtml(a.label)}"><span>${a.abv}</span><input data-skill-attribute-score="${k}" type="number" min="0" max="10" value="${s.attributes[k].value}" inputmode="numeric" aria-label="${escapeHtml(a.label)}"></label>`).join("")}
function renderSkills(){
  renderSkillAttributes();
  const sys=state.char.system;
  $("#skills").innerHTML=SKILLS.map(def=>{
    const raw=sys.skills[def.key],eff=effectiveSkill(state.char,def.key),label=def.key==="freeSkill"?(raw.name||"Profissão"):def.label;
    const bonus=(Number(eff.training)||0)+(Number(eff.mod)||0),attrOptions=Object.entries(ATTRIBUTES).map(([k,a])=>`<option value="${k}" ${eff.attr===k?"selected":""}>${a.abv}</option>`).join("");
    const trainingOptions=[0,5,10,15].map(v=>`<option value="${v}" ${Number(raw.training)===v?"selected":""}>${v}</option>`).join("");
    const auto=eff.training!==raw.training||eff.autoMod||raw.originSource;
    return `<div class="skill-row training-${eff.training}" data-skill="${def.key}" ${auto?'title="Inclui benefício automático da ficha"':''}>
      <div class="skill-identity"><button class="skill-roll" type="button" data-roll="${def.key}" aria-label="Rolar ${escapeHtml(label)}"><span class="skill-d20">${d20}</span></button>${def.key==="freeSkill"?`<span class="skill-name"><input data-free-name value="${escapeHtml(label)}" aria-label="Nome da profissão"></span>`:`<span class="skill-name">${escapeHtml(label)}</span>`}</div>
      <label class="matrix-select-wrap">(<select data-skill-attr aria-label="Atributo de ${escapeHtml(label)}">${attrOptions}</select>)</label>
      <output class="skill-bonus">(${bonus>0?`+${bonus}`:bonus})</output>
      <select class="skill-training" data-training aria-label="Treino de ${escapeHtml(label)}">${trainingOptions}</select>
      <input class="skill-other" data-skill-mod type="number" min="-99" max="99" value="${raw.mod}" inputmode="numeric" aria-label="Outros bônus de ${escapeHtml(label)}">
    </div>`;
  }).join("");
}
function itemMeta(it,kind){if(kind==='rituals')return `${ELEMENTS[it.element]||it.element||'Ritual'} // ${it.circle||'?'}º CÍRCULO${it.execution?` // ${ritualLabel('execution',it.execution)}`:''}`;if(kind==='abilities')return `${it.group||'Habilidade'}${it.path?` // ${it.path}`:''}${it.activation?` // ${it.activation}`:''}`;if(it.type==='armament')return `ARMAMENTO // CAT ${it.category||0}${it.damage?.formula?` // ${it.damage.formula}`:''}`;if(it.type==='protection')return `PROTEÇÃO // DEF +${it.defense||0} // CAT ${it.category||0}`;return `${it.group||it.categoryPath||'EQUIPAMENTO'}${it.category?` // CAT ${it.category}`:''}`}
function detailHtml(it,kind){let chips=[];if(kind==='rituals'){chips=[ELEMENTS[it.element]||it.element,`${it.circle||'?'}º círculo`,ritualLabel('execution',it.execution),ritualLabel('range',it.range),ritualLabel('target',it.target),ritualLabel('duration',it.duration),ritualLabel('resistance',it.resistance),it.studentForm==='True'?'Discente':null,it.trueForm==='True'?'Verdadeiro':null].filter(Boolean)}else if(kind==='abilities'){chips=[it.group,it.path,it.activation,it.cost?`${it.cost} ${it.costType||'PD'}`:'',it.preRequisite?`Pré: ${adaptCampaignText(it.preRequisite,it,kind)}`:''].filter(Boolean)}else{chips=[it.type==='armament'?'Armamento':it.type==='protection'?'Proteção':'Equipamento',it.category?`Cat ${it.category}`:'',it.weight?`${it.weight} espaço(s)`:'',it.critical?`Crítico ${it.critical}`:'',it.range?`Alcance ${it.range}`:''].filter(Boolean)}return `<div class="meta-chips">${chips.map(x=>`<span class="chip">${escapeHtml(x)}</span>`).join("")}</div><div class="description-html">${sanitizeHtml(it.description||'<p>Sem descrição.</p>',it,kind)}</div>`}
function selectedCard(it,kind,index){
  const equip=kind==='inventory'&&(it.type==='armament'||it.type==='protection');
  return `<article class="selected-card ${it.equipped?'active-equipment':''}" data-selected-kind="${kind}" data-index="${index}"><div class="selected-main"><div class="selected-icon">${imageOrMark(it,kind==='rituals'?'◈':'◇')}</div><div class="selected-info"><strong>${escapeHtml(displayItemName(it,kind))}</strong><span>${escapeHtml(itemMeta(it,kind))}</span></div><div class="selected-actions">${kind==='inventory'?`<label title="Quantidade">QTD <input data-quantity type="number" min="0" value="${it.quantity??1}" style="width:42px;border:0;background:transparent;text-align:center"></label>`:''}${equip?`<label><input data-equipped type="checkbox" ${it.equipped?'checked':''}> USAR</label>`:''}<button data-toggle-detail title="Detalhes" aria-label="Detalhes">${chevron}</button><button class="danger" data-remove-selected title="Remover" aria-label="Remover">×</button></div></div><div class="selected-detail">${detailHtml(it,kind)}</div></article>`;
}
function collectionSection(title,items,kind){if(!items.length)return "";return `<section class="collection-group"><div class="collection-group-title"><span>${escapeHtml(title)}</span><i></i><em>${items.length}</em></div>${items.map(({item,index})=>selectedCard(item,kind,index)).join("")}</section>`}
function renderCollections(){
  const s=state.char.system;
  if(s.inventory.length){
    const rows=s.inventory.map((item,index)=>({item,index}));
    $("#inventoryList").innerHTML=[
      collectionSection("ARMAMENTOS",rows.filter(x=>x.item.type==="armament"),"inventory"),
      collectionSection("PROTEÇÕES",rows.filter(x=>x.item.type==="protection"),"inventory"),
      collectionSection("EQUIPAMENTOS",rows.filter(x=>!["armament","protection"].includes(x.item.type)),"inventory")
    ].join("");
  }else $("#inventoryList").innerHTML='<div class="selected-empty">Nenhum item adicionado.</div>';
  if(s.abilities.length){
    const rows=s.abilities.map((item,index)=>({item,index})), bucket=(item)=>item.group==="Origens"?"ORIGEM":item.group==="Poderes Paranormais"?"PODERES PARANORMAIS":item.group==="Poderes Gerais"?"PODERES GERAIS":String(item.group||"").startsWith("Trilhas")?"TRILHA":"CLASSE";
    const order=["ORIGEM","CLASSE","TRILHA","PODERES GERAIS","PODERES PARANORMAIS"];
    $("#abilityList").innerHTML=order.map(name=>collectionSection(name,rows.filter(x=>bucket(x.item)===name),"abilities")).join("");
  }else $("#abilityList").innerHTML='<div class="selected-empty">Nenhuma habilidade adicionada.</div>';
  if(s.rituals.length){
    const rows=s.rituals.map((item,index)=>({item,index}));
    $("#ritualList").innerHTML=[1,2,3,4].map(circle=>collectionSection(`${circle}º CÍRCULO`,rows.filter(x=>Number(x.item.circle)===circle),"rituals")).join("");
  }else $("#ritualList").innerHTML='<div class="selected-empty">Nenhum ritual adicionado.</div>';
  renderCombat();
}
function renderCombat(){if(!state.char)return;const s=state.char.system;$("#combatSummary").innerHTML=[['DEFESA',s.defense.value],['ESQUIVA',s.defense.dodge],['PV',`${s.PV.value}/${s.PV.max}`],['PD',`${s.PD.value}/${s.PD.max}`],['DESLOC.',`${s.desloc.value}m`]].map(([a,b])=>`<div class="combat-stat"><span>${a}</span><strong>${b}</strong></div>`).join('');const weapons=s.inventory.filter(i=>i.type==='armament'&&i.equipped);$("#combatWeapons").innerHTML=weapons.length?weapons.map((w,i)=>`<article class="selected-card"><div class="selected-main"><div class="selected-icon">${imageOrMark(w,'◇')}</div><div class="selected-info"><strong>${escapeHtml(w.name)}</strong><span>${escapeHtml([w.damage?.formula,w.critical?`CRIT ${w.critical}`:'',w.range].filter(Boolean).join(' // '))}</span></div><div class="selected-actions"><button data-weapon-info="${escapeHtml(w.catalogId)}">DETALHES</button></div></div></article>`).join(''):'<div class="selected-empty">Equipe um armamento no Inventário para destacá-lo aqui.</div>'}
function originRule(name){return state.compendium?.originRules?.[name]||null}
function renderOriginNotice(){
  const box=$("#originNotice"),name=state.char?.system?.origin,rule=originRule(name);
  if(!name||!rule){box.classList.add("hidden");box.innerHTML="";return}
  const skillNames=(rule.skills||[]).map(k=>SKILLS.find(x=>x.key===k)?.label||k);
  box.classList.remove("hidden");box.innerHTML=`<strong>${escapeHtml(name.toUpperCase())}</strong> <span>aplica automaticamente ${skillNames.length?`treino em ${escapeHtml(skillNames.join(" e "))} e `:""}o poder ${escapeHtml(rule.power||"de origem")}.${name==="Amnésico"?" As duas perícias do Amnésico continuam à escolha do Mestre.":""}</span>`;
}
function applyOriginSelection(nextOrigin,{silent=false}={}){
  const c=state.char,s=c.system,previous=s.originState?.appliedOrigin||s.origin||"";
  s.originState=s.originState||{appliedOrigin:""};
  if(previous&&previous!==nextOrigin){for(const v of Object.values(s.skills)){if(v.originSource===previous){if(Number(v.training)===5)v.training=0;v.originSource=""}}}
  s.abilities=(s.abilities||[]).filter(a=>!String(a.autoSource||"").startsWith("origin:"));
  s.origin=nextOrigin;
  const rule=originRule(nextOrigin);
  if(rule){
    for(const key of rule.skills||[]){const v=s.skills[key];if(v&&Number(v.training)<5){v.training=5;v.originSource=nextOrigin}}
    const src=(state.compendium.abilities||[]).find(a=>a.group==="Origens"&&a.name===rule.power);
    if(src&&!s.abilities.some(a=>a.catalogId===src.id)){const copy=JSON.parse(JSON.stringify(src));copy.id=uid();copy.catalogId=src.id;copy.autoSource=`origin:${nextOrigin}`;s.abilities.push(copy)}
  }
  s.originState.appliedOrigin=nextOrigin;deriveCharacter(c);renderSkills();renderCollections();renderDerived();renderOriginNotice();setDirty();if(!silent&&nextOrigin)toast("ORIGEM APLICADA AUTOMATICAMENTE");
}
function render(){
  const c=state.char,s=c.system;
  if(state.role==="GM"&&s.origin&&s.originState?.appliedOrigin!==s.origin)applyOriginSelection(s.origin,{silent:true});
  $("#topName").textContent=c.name.toUpperCase();$("#name").value=c.name;
  $("#class").innerHTML=`<option value="">Sem classe</option>${opt(CLASSES,s.class)}`;
  $("#origin").innerHTML=`<option value="">Sem origem</option>${(state.compendium?.origins||[]).map(x=>`<option value="${escapeHtml(x)}" ${x===s.origin?'selected':''}>${escapeHtml(x)}</option>`).join('')}`;
  $("#trail").innerHTML=`<option value="">Sem trilha</option>${(state.compendium?.trails||[]).map(x=>`<option value="${escapeHtml(x)}" ${x===s.trilha?'selected':''}>${escapeHtml(x)}</option>`).join('')}`;
  $("#nex").value=s.NEX.value;$("#level").value=s.nivel.value;$("#patent").value=s.patent.name;$("#pv").value=s.PV.value;$("#pd").value=s.PD.value;$("#pvBonus").value=s.PV.manualMax;$("#pdBonus").value=s.PD.manualMax;$("#defBonus").value=s.defense.manual;$("#movementBonus").value=s.desloc.manual;$("#ritualDtBonus").value=s.ritual.manualDT;$("#prestige").value=s.patent.prestigePoints;$("#biography").value=s.biography;$("#goals").value=s.goals;$("#notes").value=s.notes;
  renderAttributes();renderSkills();renderCollections();renderDerived();renderOriginNotice();setEditable();$("#loading").classList.add("hidden");
}
function setEditable(){state.canEdit=isAuthorized(state.char,state.playerId,state.role);$("#locked").classList.toggle("hidden",state.canEdit);document.querySelectorAll("input,select,textarea,[data-open-library],[data-remove-selected]").forEach(el=>{el.disabled=!state.canEdit});document.querySelectorAll("[data-roll]").forEach(el=>el.disabled=false);$("#saveBtn").disabled=!state.canEdit}
function readCore(){
  const c=state.char,s=c.system,old={PV:s.PV.max,PD:s.PD.max};
  c.name=$("#name").value.trim()||"Protagonista";s.class=$("#class").value;s.trilha=$("#trail").value;s.NEX.value=Number($("#nex").value)||0;s.nivel.value=Number($("#level").value)||1;s.patent.name=$("#patent").value.trim()||"Recruta";s.PV.value=Number($("#pv").value)||0;s.PD.value=Number($("#pd").value)||0;s.PV.manualMax=Number($("#pvBonus").value)||0;s.PD.manualMax=Number($("#pdBonus").value)||0;s.defense.manual=Number($("#defBonus").value)||0;s.desloc.manual=Number($("#movementBonus").value)||0;s.ritual.manualDT=Number($("#ritualDtBonus").value)||0;s.patent.prestigePoints=Number($("#prestige").value)||0;s.biography=$("#biography").value;s.goals=$("#goals").value;s.notes=$("#notes").value;
  document.querySelectorAll("[data-attr]").forEach(x=>s.attributes[x.dataset.attr].value=Number(x.value)||0);
  document.querySelectorAll(".skill-row").forEach(row=>{const v=s.skills[row.dataset.skill];v.attr=row.querySelector("[data-skill-attr]").value;v.training=Number(row.querySelector("[data-training]").value)||0;v.mod=Number(row.querySelector("[data-skill-mod]").value)||0;if(row.dataset.skill==='freeSkill')v.name=row.querySelector('[data-free-name]').value.trim()||'Profissão'});
  c.updatedAt=Date.now();deriveCharacter(c,{previousMax:old});$("#pv").value=s.PV.value;$("#pd").value=s.PD.value;renderDerived();return c;
}
async function publishProfile(c){if(!OBR.isAvailable)return;const profile=profileFromCharacter(c);if(state.role==='GM'){for(const pid of c.controllers||[]){const p=state.party.find(x=>x.id===pid);if(p?.connectionId)await OBR.broadcast.sendMessage(SKILL_BRIDGE_CHANNEL,{type:'profile',targetConnectionId:p.connectionId,profile},{destination:'REMOTE'})}}}
async function save(){if(!state.canEdit)return;readCore();if(state.role==='GM'){const store=loadStore(state.roomId),wasNew=!store[state.char.id];store[state.char.id]=normalizeCharacter(state.char);saveStore(state.roomId,store);const meta=await OBR.room.getMetadata(),cat=normalizeCatalog(meta[ROOM_KEY]||meta[LEGACY_ROOM_KEY],state.playerId),sm=catalogSummary(store[state.char.id]),i=cat.characters.findIndex(x=>x.id===sm.id);if(i>=0)cat.characters[i]=sm;else cat.characters.push(sm);state.catalog=cat;await OBR.room.setMetadata({[ROOM_KEY]:cat});state.char=store[state.char.id];state.isNew=false;await OBR.broadcast.sendMessage(SYNC_CHANNEL,{type:'catalog-changed',characterId:state.char.id},{destination:'REMOTE'});await OBR.broadcast.sendMessage(SYNC_CHANNEL,{type:'character-updated',characterId:state.char.id,character:state.char},{destination:'REMOTE'});await OBR.broadcast.sendMessage(SYNC_CHANNEL,{type:'token-linked',characterId:state.char.id},{destination:'ALL'});await publishProfile(state.char);setDirty(false);toast(wasNew?'PROTAGONISTA CRIADO':'FICHA SALVA');render()}else{const req=uid();state.requestId=req;await OBR.broadcast.sendMessage(SYNC_CHANNEL,{type:'update-character',requestId:req,characterId:state.char.id,character:state.char},{destination:'REMOTE'});$("#saveState").textContent='ENVIANDO AO MESTRE…'}}
async function request(id){const cache=loadCache(state.roomId,state.playerId);if(cache[id]){state.char=normalizeCharacter(cache[id]);render()}const req=uid();state.requestId=req;await OBR.broadcast.sendMessage(SYNC_CHANNEL,{type:'request-character',requestId:req,characterId:id},{destination:'REMOTE'})}
async function onSync(event){const d=event.data||{};if(d.targetConnectionId&&d.targetConnectionId!==state.connectionId)return;if(d.type==='character-deleted'&&d.characterId===state.char?.id){toast('PROTAGONISTA EXCLUÍDO');if(OBR.isAvailable)setTimeout(()=>OBR.modal.close(SHEET_MODAL_ID),700);return;}if(d.type==='character-snapshot'&&d.requestId===state.requestId&&d.character){state.char=normalizeCharacter(d.character);const cache=loadCache(state.roomId,state.playerId);cache[state.char.id]=state.char;saveCache(state.roomId,state.playerId,cache);render()}if(d.type==='update-result'&&d.requestId===state.requestId&&d.ok&&d.character){state.char=normalizeCharacter(d.character);const cache=loadCache(state.roomId,state.playerId);cache[state.char.id]=state.char;saveCache(state.roomId,state.playerId,cache);setDirty(false);toast('FICHA SINCRONIZADA');render()}if(d.type==='character-updated'&&d.characterId===state.char?.id&&d.character&&!state.dirty){state.char=normalizeCharacter(d.character);render()}}
async function roll(sk){readCore();const roll=rollSkill(state.char,sk),author={id:state.playerId,name:state.name,color:state.color},entry=makeChatEntry(state.char,sk,roll,author);if(OBR.isAvailable)await OBR.broadcast.sendMessage(CHAT_CHANNEL,{type:'entry',entry},{destination:'ALL'});toast(`${entry.title}: ${entry.total}`)}

function librarySource(type){if(type==='rituals')return state.compendium.rituals;if(type==='abilities')return state.compendium.abilities;return state.compendium.inventory}
function currentList(type){return type==='rituals'?state.char.system.rituals:type==='abilities'?state.char.system.abilities:state.char.system.inventory}
function primaryFilters(type){
  if(type==='rituals')return ['Todos','Conhecimento','Energia','Morte','Sangue','Medo'];
  if(type==='abilities')return ['Todos','Poderes de Classe','Trilhas','Origens','Poderes Gerais','Poderes Paranormais'];
  return ['Todos','Armamentos','Equipamentos','Proteções'];
}
function itemPrimaryMatch(it,value,type){
  if(value==='Todos')return true;
  if(type==='rituals')return (ELEMENTS[it.element]||it.element)===value;
  if(type==='inventory')return value==='Armamentos'?it.type==='armament':value==='Proteções'?it.type==='protection':it.type==='generalEquipment';
  if(value==='Poderes de Classe')return ['Combatente','Especialista','Ocultista','Sobrevivente'].includes(it.group);
  if(value==='Trilhas')return String(it.group).startsWith('Trilhas');
  return it.group===value;
}
function secondaryFilters(type,primary){
  if(type==='rituals')return ['Todos','1º Círculo','2º Círculo','3º Círculo','4º Círculo'];
  const src=librarySource(type).filter(i=>itemPrimaryMatch(i,primary,type));
  if(type==='abilities'){
    if(primary==='Poderes de Classe')return ['Todos','Combatente','Especialista','Ocultista','Sobrevivente'];
    if(primary==='Trilhas'||primary==='Poderes Paranormais')return ['Todos',...[...new Set(src.map(i=>i.path).filter(Boolean))].sort((a,b)=>a.localeCompare(b,'pt-BR'))];
    return ['Todos'];
  }
  return ['Todos',...[...new Set(src.map(i=>(i.folderPath||[])[0]).filter(Boolean))].sort((a,b)=>a.localeCompare(b,'pt-BR'))];
}
function secondaryMatch(it,value,type){
  if(value==='Todos')return true;
  if(type==='rituals')return Number(it.circle)===Number(value[0]);
  if(type==='abilities'){
    if(state.library.primary==='Poderes de Classe')return it.group===value;
    if(state.library.primary==='Trilhas'||state.library.primary==='Poderes Paranormais')return it.path===value;
    return true;
  }
  return (it.folderPath||[])[0]===value;
}
function libraryMeta(it,type){if(type==='rituals')return `${ELEMENTS[it.element]||it.element} ${it.circle} // ${ritualLabel('execution',it.execution)}`;if(type==='abilities')return `${GROUP_SHORT[it.group]||it.group}${it.path?` // ${it.path}`:''}`;return itemMeta(it,'inventory')}
function libraryDescription(it,type){if(type==='rituals')return `<div class="ritual-meta">${[['EXECUÇÃO',ritualLabel('execution',it.execution)],['ALCANCE',ritualLabel('range',it.range)],['ALVO',ritualLabel('target',it.target)],['DURAÇÃO',ritualLabel('duration',it.duration)],['RESISTÊNCIA',ritualLabel('resistance',it.resistance)],['CÍRCULO',it.circle]].filter(x=>x[1]).map(([k,v])=>`<span><b>${k}</b><br>${escapeHtml(v)}</span>`).join('')}</div>${detailHtml(it,'rituals')}`;return detailHtml(it,type)}
function renderLibrary(){
  const L=state.library,type=L.type,prim=primaryFilters(type);$("#libraryPrimary").innerHTML=prim.map(x=>`<button data-lib-primary="${escapeHtml(x)}" class="${L.primary===x?'active':''}">${escapeHtml(x)}</button>`).join('');
  const sec=secondaryFilters(type,L.primary);if(!sec.includes(L.secondary))L.secondary='Todos';$("#librarySecondary").innerHTML=sec.map(x=>`<button data-lib-secondary="${escapeHtml(x)}" class="${L.secondary===x?'active':''}">${escapeHtml(x)}</button>`).join('');
  const q=L.query.trim().toLocaleLowerCase('pt-BR'),list=librarySource(type).filter(i=>itemPrimaryMatch(i,L.primary,type)&&secondaryMatch(i,L.secondary,type)&&(!q||`${i.name} ${plainMeta(i.description)} ${i.path||''} ${i.group||''}`.toLocaleLowerCase('pt-BR').includes(q))),added=new Set(currentList(type).map(i=>i.catalogId));$("#libraryCount").textContent=`${list.length} REGISTROS`;
  $("#libraryResults").innerHTML=list.map(it=>{const excerpt=adaptCampaignText(plainMeta(it.description||'Sem descrição.'),it,type).slice(0,260);return `<article class="library-item" data-lib-id="${escapeHtml(it.id)}"><div class="library-row"><div class="library-copy"><strong>${escapeHtml(displayItemName(it,type))}</strong><small>${escapeHtml(libraryMeta(it,type))}</small><p>${escapeHtml(excerpt)}</p></div><div class="library-actions"><button data-lib-expand title="Ver descrição" aria-label="Ver descrição">${chevron}</button><button class="add ${added.has(it.id)?'added':''}" data-lib-add title="Adicionar" aria-label="Adicionar">${added.has(it.id)?'✓':'+'}</button></div></div><div class="library-description">${libraryDescription(it,type)}</div></article>`}).join('')||'<div class="selected-empty">Nenhum registro encontrado.</div>';
}
function openLibrary(type){if(!state.canEdit)return;state.library={type,primary:'Todos',secondary:'Todos',query:''};$("#librarySearch").value='';$("#libraryEyebrow").textContent='ARQUIVO DSO';$("#libraryTitle").textContent=type==='rituals'?'ADICIONAR RITUAIS':type==='abilities'?'ADICIONAR HABILIDADES':'ADICIONAR ITENS';$("#libraryModal").classList.remove('hidden');$("#libraryModal").setAttribute('aria-hidden','false');renderLibrary()}
function closeLibrary(){$("#libraryModal").classList.add('hidden');$("#libraryModal").setAttribute('aria-hidden','true')}
function addFromLibrary(id){const type=state.library.type,src=librarySource(type).find(i=>i.id===id);if(!src)return;const arr=currentList(type);if(arr.some(x=>x.catalogId===id)){toast('JÁ ADICIONADO');return;}const copy=JSON.parse(JSON.stringify(src));copy.id=uid();copy.catalogId=src.id;copy.equipped=false;copy.quantity=copy.quantity||1;arr.push(copy);deriveCharacter(state.char);renderCollections();renderDerived();setDirty();renderLibrary();toast(`${src.name.toUpperCase()} ADICIONADO`)}
function removeSelected(kind,index){const arr=currentList(kind);arr.splice(index,1);deriveCharacter(state.char);renderCollections();renderDerived();setDirty()}
async function init(){state.compendium=await fetch('./data/compendium.json').then(r=>r.json());if(!OBR.isAvailable){state.role='GM';state.char=deriveCharacter(makeCharacter(),{refill:true});state.char.system.PV.value=state.char.system.PV.max;state.char.system.PD.value=state.char.system.PD.max;state.catalog=normalizeCatalog(null,'preview');state.canEdit=true;render();return;}await new Promise(r=>OBR.onReady(r));[state.role,state.name,state.connectionId,state.color]=await Promise.all([OBR.player.getRole(),OBR.player.getName(),OBR.player.getConnectionId(),OBR.player.getColor()]);state.playerId=OBR.player.id;state.roomId=OBR.room.id;state.party=await OBR.party.getPlayers();const meta=await OBR.room.getMetadata();state.catalog=normalizeCatalog(meta[ROOM_KEY]||meta[LEGACY_ROOM_KEY],state.role==='GM'?state.playerId:'');OBR.broadcast.onMessage(SYNC_CHANNEL,onSync);OBR.room.onMetadataChange(m=>state.catalog=normalizeCatalog(m[ROOM_KEY]||m[LEGACY_ROOM_KEY],state.catalog?.gmId||''));OBR.party.onChange(p=>state.party=p);if(state.isNew){if(state.role!=='GM'){await OBR.modal.close(SHEET_MODAL_ID);return;}state.char=deriveCharacter(makeCharacter(),{refill:true});render()}else{const id=params.get('id');if(!id){await OBR.modal.close(SHEET_MODAL_ID);return;}if(state.role==='GM'){const store=loadStore(state.roomId),raw=store[id];if(!raw){toast('REGISTRO NÃO ENCONTRADO');return;}state.char=normalizeCharacter(raw);render()}else await request(id)}}

$("#tabs").addEventListener('click',e=>{const b=e.target.closest('[data-tab]');if(!b)return;document.querySelectorAll('#tabs button').forEach(x=>x.classList.toggle('active',x===b));document.querySelectorAll('.tab-panel').forEach(x=>x.classList.toggle('active',x.id===`tab-${b.dataset.tab}`))});
$("#closeBtn").addEventListener('click',()=>OBR.isAvailable?OBR.modal.close(SHEET_MODAL_ID):history.back());$("#saveBtn").addEventListener('click',()=>void save());
const reactiveIds=['name','class','trail','nex','level','patent','pv','pd','pvBonus','pdBonus','defBonus','movementBonus','ritualDtBonus','prestige','biography','goals','notes'];
for(const id of reactiveIds){$("#"+id).addEventListener('input',()=>{if(!state.canEdit)return;readCore();setDirty();if(id==='name')$("#topName").textContent=$("#name").value.toUpperCase()})}
$("#origin").addEventListener('change',()=>{if(!state.canEdit)return;applyOriginSelection($("#origin").value)});
$("#attributes").addEventListener('input',()=>{if(!state.canEdit)return;readCore();renderSkills();setDirty()});
$("#skillAttributes").addEventListener('input',e=>{if(!state.canEdit)return;const input=e.target.closest('[data-skill-attribute-score]');if(!input)return;const key=input.dataset.skillAttributeScore,value=Math.max(0,Math.min(10,Number(input.value)||0));state.char.system.attributes[key].value=value;const general=document.querySelector(`[data-attr="${key}"]`);if(general)general.value=value;deriveCharacter(state.char);renderDerived();setDirty()});
$("#skills").addEventListener('input',()=>{if(!state.canEdit)return;readCore();setDirty()});$("#skills").addEventListener('change',()=>{if(!state.canEdit)return;readCore();renderSkills();setDirty()});$("#skills").addEventListener('click',e=>{const b=e.target.closest('[data-roll]');if(b)void roll(b.dataset.roll)});
document.addEventListener('click',e=>{const open=e.target.closest('[data-open-library]');if(open)openLibrary(open.dataset.openLibrary);const card=e.target.closest('.selected-card');if(e.target.closest('[data-toggle-detail]')&&card)card.classList.toggle('expanded');const rem=e.target.closest('[data-remove-selected]');if(rem&&card&&state.canEdit)removeSelected(card.dataset.selectedKind,Number(card.dataset.index))});
document.addEventListener('change',e=>{const card=e.target.closest('.selected-card');if(!card||!state.canEdit)return;const arr=currentList(card.dataset.selectedKind),it=arr[Number(card.dataset.index)];if(!it)return;if(e.target.matches('[data-equipped]'))it.equipped=e.target.checked;if(e.target.matches('[data-quantity]'))it.quantity=Math.max(0,Number(e.target.value)||0);deriveCharacter(state.char);renderCollections();renderDerived();setDirty()});
$("#libraryClose").addEventListener('click',closeLibrary);$("#libraryModal").addEventListener('click',e=>{if(e.target===$("#libraryModal"))closeLibrary()});$("#libraryPrimary").addEventListener('click',e=>{const b=e.target.closest('[data-lib-primary]');if(!b)return;state.library.primary=b.dataset.libPrimary;state.library.secondary='Todos';renderLibrary()});$("#librarySecondary").addEventListener('click',e=>{const b=e.target.closest('[data-lib-secondary]');if(!b)return;state.library.secondary=b.dataset.libSecondary;renderLibrary()});$("#librarySearch").addEventListener('input',e=>{state.library.query=e.target.value;renderLibrary()});$("#libraryResults").addEventListener('click',e=>{const row=e.target.closest('[data-lib-id]');if(!row)return;if(e.target.closest('[data-lib-expand]'))row.classList.toggle('expanded');if(e.target.closest('[data-lib-add]'))addFromLibrary(row.dataset.libId)});
init().catch(err=>{console.error(err);$("#loading").textContent='ERRO AO CARREGAR // '+(err?.message||err)});

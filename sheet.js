import OBR from "https://esm.unpkg.com/@owlbear-rodeo/sdk@3.1.0";
import {
  ATTRIBUTES, CLASSES, SKILLS, ROOM_DB_KEY, ROOM_KEY, LEGACY_ROOM_KEY,
  SYNC_CHANNEL, CHAT_CHANNEL, SKILL_BRIDGE_CHANNEL, SHEET_MODAL_ID,
  makeCharacter, normalizeCharacter, deriveCharacter, loadStore, saveCache,
  packRoomDb, unpackRoomDb, validateRoomDbSize, roomDbBytes,
  rollSkill, makeChatEntry, uid, isAuthorized, escapeHtml, profileFromCharacter,
  attrAbv, attrLabel, effectiveSkill, effectiveAttribute, inventoryState,
  itemDerived, effectiveItemCategory, randomInt
} from "./core.js";
import { modificationsFor, cursesFor, OPPRESSING_ELEMENTS, itemEnhancementScope } from "./enhancements.js";

const $ = s => document.querySelector(s);
const params = new URLSearchParams(location.search);
const state = {
  role: "PLAYER", playerId: "preview", connectionId: "preview", name: "Protagonista", color: "#b51d26",
  roomId: "preview-room", db: null, store: {}, char: null, isNew: params.get("new") === "1",
  canEdit: false, requestId: null, dirty: false, party: [], compendium: null,
  library: { type: "", primary: "Todos", secondary: "Todos", query: "", limit: 50 },
  enhancement: { index: -1, tab: "mods" }, editor: { kind: "", index: -1 },
  lastAttack: {}, selectedDie: 20, popupTimer: null
};

const d20 = `<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.35"><path d="m16 2 12 8v12l-12 8L4 22V10Z"/><path d="m16 2 5 14-5 14-5-14Z"/><path d="M4 10l17 6 7-6M4 22l12-6 12 6"/><path d="m11 16 5-5 5 5-5 5Z"/></svg>`;
const chevron = `<svg class="expand-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m6 9 6 6 6-6"/></svg>`;
const ELEMENTS = { blood: "Sangue", knowledge: "Conhecimento", energy: "Energia", death: "Morte", fear: "Medo", varies: "Varia" };
const ELEMENT_CLASS = { blood: "blood", knowledge: "knowledge", energy: "energy", death: "death", fear: "fear", varies: "" };
const RITUAL_LABELS = {
  execution: { default: "Padrão", complete: "Completa", full: "Completa", reaction: "Reação", free: "Livre" },
  range: { touch: "Toque", short: "Curto", medium: "Médio", long: "Longo", extreme: "Extremo", personal: "Pessoal", self: "Pessoal", unlimited: "Ilimitado" },
  target: { creatures: "Criatura(s)", people: "Pessoa(s)", area: "Área", self: "Você", equipment: "Equipamento", object: "Objeto", weapons: "Arma" },
  duration: { scene: "Cena", instantaneous: "Instantânea", sustained: "Sustentada", setDuration: "Definida pelo ritual", permanent: "Permanente", special: "Especial" },
  resistance: { partial: "Parcial", nullifies: "Anula", none: "Nenhuma", reducesByHalf: "Reduz à metade", will: "Vontade", fortitude: "Fortitude", "Willpower negates": "Vontade anula" }
};
const GROUP_SHORT = { "Trilhas — Combatente": "Trilhas Combatente", "Trilhas — Especialista": "Trilhas Especialista", "Trilhas — Ocultista": "Trilhas Ocultista" };
const DAMAGE_TYPES = ["Corte", "Perfuração", "Balístico", "Impacto", "Fogo", "Frio", "Eletricidade", "Ácido", "Mental", "Sangue", "Morte", "Energia", "Conhecimento", "Medo"];
const DAMAGE_TYPE_VALUES = [["cuttingDamage","Corte"],["piercingDamage","Perfuração"],["ballisticDamage","Balístico"],["impactDamage","Impacto"],["fireDamage","Fogo"],["coldDamage","Frio"],["electricityDamage","Eletricidade"],["acidDamage","Ácido"],["mentalDamage","Mental"],["bloodDamage","Sangue"],["deathDamage","Morte"],["energyDamage","Energia"],["knowledgeDamage","Conhecimento"],["fearDamage","Medo"]];
const PROFICIENCY_LABELS = { tacticalWeapons:"Armas Táticas", simpleWeapons:"Armas Simples", heavyWeapons:"Armas Pesadas" };
const GRIP_LABELS = { twoHands:"Duas Mãos", oneHand:"Uma Mão", light:"Leve" };
const RANGE_TYPE_LABELS = { melee:"Corpo a Corpo", ranged:"À Distância" };
const ITEM_TYPE_LABELS = { armament:"Armamento", protection:"Proteção", generalEquipment:"Equipamento" };
const FIELD_VALUE_LABELS = { ...PROFICIENCY_LABELS, ...GRIP_LABELS, ...RANGE_TYPE_LABELS, ...ITEM_TYPE_LABELS };


function opt(obj, current) { return Object.entries(obj).map(([k, v]) => `<option value="${escapeHtml(k)}" ${k === current ? "selected" : ""}>${escapeHtml(v)}</option>`).join(""); }
function ritualLabel(field, value) { const raw = String(value || ""); return RITUAL_LABELS[field]?.[raw] || raw; }
function pct(v, m) { return m > 0 ? Math.max(0, Math.min(100, (Number(v) || 0) / (Number(m) || 1) * 100)) : 0; }
function setDirty(v = true) { state.dirty = v; $("#saveState").textContent = v ? "ALTERAÇÕES PENDENTES" : "SINCRONIZADO"; }
function toast(text, { title = "DSO SYSTEM // ATUALIZAÇÃO", tone = "info", duration = 2800 } = {}) {
  const e = $("#toast"); e.className = `toast ${tone}`; e.innerHTML = `<strong>${escapeHtml(title)}</strong><span>${escapeHtml(String(text || ""))}</span>`; e.classList.remove("hidden");
  clearTimeout(e._timer); e._timer = setTimeout(() => e.classList.add("hidden"), duration);
}
function deepCopy(v) { return typeof structuredClone === "function" ? structuredClone(v) : JSON.parse(JSON.stringify(v)); }
function romanCategory(value) { const n = Math.max(0, Number(value) || 0); return n === 0 ? "0" : (["", "I", "II", "III", "IV", "V", "VI"][n] || String(n)); }
function damageTypeLabel(v = "") { return ({ cuttingDamage: "Corte", piercingDamage: "Perfuração", ballisticDamage: "Balístico", impactDamage: "Impacto", fireDamage: "Fogo", coldDamage: "Frio", electricityDamage: "Eletricidade", acidDamage: "Ácido", mentalDamage: "Mental", bloodDamage: "Sangue", deathDamage: "Morte", energyDamage: "Energia", knowledgeDamage: "Conhecimento", fearDamage: "Medo" })[v] || String(v || "").replace(/Damage$/i, "") || "Dano"; }
function rangeLabel(v = "") { return ritualLabel("range", v) || String(v || "") || "—"; }
function steppedRange(value = "", steps = 0) { const order = ["Curto", "Médio", "Longo", "Extremo"], raw = rangeLabel(value), i = order.findIndex(x => x.toLocaleLowerCase("pt-BR") === raw.toLocaleLowerCase("pt-BR")); return i < 0 ? raw : order[Math.min(order.length - 1, Math.max(0, i + (Number(steps) || 0)))]; }
function numericBonus(v) { const n = Number(String(v ?? "").trim()); return Number.isFinite(n) ? n : 0; }
function imageOrMark(item, mark = "◇") { return item?.image ? `<img src="${escapeHtml(item.image)}" alt="" onerror="this.remove()">` : mark; }
function elementTag(raw) { const name = ELEMENTS[raw] || raw; return name ? `<span class="element-tag ${ELEMENT_CLASS[raw] || ""}">${escapeHtml(String(name).toUpperCase())}</span>` : ""; }
function friendlyValue(value = "") { return FIELD_VALUE_LABELS[value] || damageTypeLabel(value) || String(value || ""); }
function editorText(value = "") {
  const doc = new DOMParser().parseFromString(String(value || ""), "text/html");
  doc.querySelectorAll("br").forEach(br => br.replaceWith("\n"));
  doc.querySelectorAll("p,li,div,h1,h2,h3,h4,blockquote").forEach(el => { el.insertAdjacentText("beforeend", "\n"); });
  return String(doc.body.textContent || "").replace(/\u00a0/g," ").replace(/[ \t]+\n/g,"\n").replace(/\n{3,}/g,"\n\n").trim();
}
function syncDsoSelect(id) {
  const select = $("#" + id), wrap = document.querySelector(`.dso-select[data-select-for="${id}"]`); if (!select || !wrap) return;
  const trigger = wrap.querySelector(".dso-select-trigger"), menu = wrap.querySelector(".dso-select-menu"), selected = select.options[select.selectedIndex];
  trigger.querySelector("b").textContent = selected?.textContent || "—"; trigger.disabled = select.disabled;
  menu.innerHTML = [...select.options].map(o => `<button type="button" role="option" data-dso-option="${escapeHtml(o.value)}" class="${o.selected ? "selected" : ""}">${escapeHtml(o.textContent)}</button>`).join("");
}
function syncIdentitySelects() { ["class","origin","trail"].forEach(syncDsoSelect); }
function closeDsoSelects(except = null) { document.querySelectorAll(".dso-select.open").forEach(x => { if (x !== except) { x.classList.remove("open"); x.querySelector(".dso-select-trigger")?.setAttribute("aria-expanded","false"); } }); }

function adaptCampaignText(value = "", item = null, kind = "") {
  let text = String(value || "")
    .replace(/Pontos de Esforço/gi, "Pontos de Determinação")
    .replace(/pontos de esforço/gi, "pontos de determinação")
    .replace(/\bPE\b/g, "PD")
    .replace(/Sanidade/gi, "Determinação")
    .replace(/\bSAN\b/g, "PD");
  if (kind === "abilities" && item && !/Poderes Paranormais/i.test(item.group || "")) text = text.replace(/NEX\s*(\d{1,2}|99)%/gi, (_, n) => `Nível ${Math.max(1, Math.ceil(Number(n) / 5))}`);
  return text;
}
function displayItemName(item, kind = "") {
  const name = String(item?.name || "Sem nome");
  if (kind === "abilities" && !/Poderes Paranormais/i.test(item?.group || "")) return name.replace(/^NEX\s*(\d{1,2}|99)%\s*[-–—]\s*/i, (_, n) => `NÍVEL ${Math.max(1, Math.ceil(Number(n) / 5))} — `);
  return name;
}
function sanitizeHtml(html = "", item = null, kind = "") {
  const adapted = adaptCampaignText(html, item, kind);
  if (!/<[a-z][\s\S]*>/i.test(adapted)) return escapeHtml(adapted).replace(/\n/g, "<br>");
  const doc = new DOMParser().parseFromString(`<div>${adapted}</div>`, "text/html"), root = doc.body.firstElementChild;
  const allowed = new Set(["P", "BR", "STRONG", "B", "EM", "I", "UL", "OL", "LI", "H3", "H4", "BLOCKQUOTE", "SPAN"]);
  const walk = node => { for (const child of [...node.children]) { if (!allowed.has(child.tagName)) { child.replaceWith(...child.childNodes); continue; } for (const a of [...child.attributes]) child.removeAttribute(a.name); walk(child); } };
  walk(root); return root.innerHTML;
}
function plainMeta(value) { const doc = new DOMParser().parseFromString(String(value || ""), "text/html"); return String(doc.body.textContent || "").replace(/\s+/g, " ").trim(); }

function loadDb(meta) {
  const raw = meta?.[ROOM_DB_KEY];
  if (!raw) return false;
  state.db = raw; state.store = unpackRoomDb(raw, state.compendium);
  return true;
}
function storageLabel() {
  if (!state.db) return "OWLBEAR // AGUARDANDO MIGRAÇÃO";
  const bytes = roomDbBytes(state.db), pctv = validateRoomDbSize(state.db).percent;
  return `OWLBEAR // ${(bytes / 1024).toFixed(1)} KB · ${pctv}%`;
}
async function writeCharacterAsGM() {
  const meta = await OBR.room.getMetadata();
  const store = meta[ROOM_DB_KEY] ? unpackRoomDb(meta[ROOM_DB_KEY], state.compendium) : {};
  const existing = store[state.char.id];
  const incoming = normalizeCharacter(state.char);
  if (existing && state.isNew === false) {
    // Não perde uma atribuição feita pelo painel do Mestre enquanto a ficha estava aberta.
    incoming.controllers = [...(existing.controllers || incoming.controllers || [])];
    incoming.createdAt = existing.createdAt || incoming.createdAt;
  }
  incoming.updatedAt = Date.now(); store[incoming.id] = incoming;
  const db = packRoomDb(store, state.compendium, state.playerId), size = validateRoomDbSize(db);
  if (!size.ok) throw new Error(`O banco da sala atingiria ${(size.bytes / 1024).toFixed(1)} KB. Reduza textos personalizados longos antes de salvar.`);
  await OBR.room.setMetadata({ [ROOM_DB_KEY]: db });
  state.db = db; state.store = unpackRoomDb(db, state.compendium); state.char = state.store[incoming.id];
  saveCache(state.roomId, state.playerId, state.store);
}

function updateResourceBars() { const s = state.char.system; $("#pvFill").style.width = `${pct(s.PV.value, s.PV.max)}%`; $("#pdFill").style.width = `${pct(s.PD.value, s.PD.max)}%`; }
function renderAttributes() {
  const s = state.char.system;
  $("#attributes").innerHTML = Object.entries(ATTRIBUTES).map(([k, a]) => `<label class="attr-card" title="${escapeHtml(a.label)}"><span>${a.abv}</span><input data-attr="${k}" type="number" min="0" max="10" value="${s.attributes[k].value}" aria-label="${escapeHtml(a.label)}"></label>`).join("");
}
function renderSkills() {
  const sys = state.char.system;
  $("#skills").innerHTML = SKILLS.map(def => {
    const raw = sys.skills[def.key], eff = effectiveSkill(state.char, def.key), label = def.key === "freeSkill" ? (raw.name || "Profissão") : def.label;
    const bonus = (Number(eff.training) || 0) + (Number(eff.mod) || 0), attrOptions = Object.entries(ATTRIBUTES).map(([k, a]) => `<option value="${k}" ${eff.attr === k ? "selected" : ""}>${a.abv}</option>`).join("");
    const trainingOptions = [0, 5, 10, 15].map(v => `<option value="${v}" ${Number(raw.training) === v ? "selected" : ""}>${v}</option>`).join("");
    const auto = eff.training !== raw.training || eff.autoMod || raw.originSource;
    return `<div class="skill-row training-${eff.training}" data-skill="${def.key}" ${auto ? 'title="Inclui benefício automático da ficha"' : ""}>
      <div class="skill-identity"><button class="skill-roll" type="button" data-roll="${def.key}" aria-label="Rolar ${escapeHtml(label)}"><span class="skill-d20">${d20}</span></button>${def.key === "freeSkill" ? `<span class="skill-name"><input data-free-name value="${escapeHtml(label)}" aria-label="Nome da profissão"></span>` : `<span class="skill-name">${escapeHtml(label)}${def.load ? "*" : ""}${def.trained ? "†" : ""}</span>`}</div>
      <label class="matrix-select-wrap">(<select data-skill-attr aria-label="Atributo de ${escapeHtml(label)}">${attrOptions}</select>)</label>
      <output class="skill-bonus">(${bonus > 0 ? `+${bonus}` : bonus})</output>
      <select class="skill-training" data-training aria-label="Treino de ${escapeHtml(label)}">${trainingOptions}</select>
      <input class="skill-other" data-skill-mod type="number" min="-99" max="99" value="${raw.mod}" inputmode="numeric" aria-label="Outros bônus de ${escapeHtml(label)}">
    </div>`;
  }).join("");
}
function equippedProtectionNames() { return (state.char.system.inventory || []).filter(i => i.type === "protection" && i.equipped).map(i => i.name).join(" + ") || "—"; }
function renderDerived() {
  const s = state.char.system;
  $("#pvMax").textContent = Math.round(s.PV.max); $("#pdMax").textContent = Math.round(s.PD.max);
  $("#pv").value = Math.round(s.PV.value); $("#pd").value = Math.round(s.PD.value);
  $("#defense").textContent = s.defense.value; $("#block").textContent = s.defense.block; $("#dodge").textContent = s.defense.dodge; $("#ritualDt").textContent = s.ritual.DT;
  $("#pdRound").textContent = s.PD.perRound; $("#movement").textContent = `${s.desloc.value}m`;
  $("#nexEffective").textContent = `${s.NEX.value}%`; $("#nexBase").value = s.NEX.base;
  $("#nexBonus").textContent = s.NEX.ritualBonus ? `+${s.NEX.ritualBonus}% por ${s.NEX.ritualBonus} ritual(is)` : "";
  $("#patent").textContent = s.patent.name.toUpperCase();
  $("#protection").textContent = equippedProtectionNames(); $("#resistances").textContent = s.resistances || "—"; $("#proficiencies").textContent = s.proficiencies || "—";
  const agi = effectiveAttribute(state.char, "dex"), auto = Number(s.auto?.defense) || 0, equip = Number(s.defense.equipment) || 0, manual = Number(s.defense.manual) || 0;
  $("#defenseFormula").textContent = `= 10 BASE + ${agi} AGI + ${equip} EQUIP. + ${auto} AUTO + ${manual} OUTROS`;
  updateResourceBars(); renderCombat(); renderInventoryDashboard();
}

function originRule(name) { return state.compendium?.originRules?.[name] || null; }
function renderOriginNotice() { const box = $("#originNotice"); if (box) { box.classList.add("hidden"); box.innerHTML = ""; } }
function applyOriginSelection(nextOrigin, { silent = false } = {}) {
  const c = state.char, s = c.system, previous = s.originState?.appliedOrigin || s.origin || "";
  s.originState = s.originState || { appliedOrigin: "" };
  if (previous && previous !== nextOrigin) {
    for (const v of Object.values(s.skills)) if (v.originSource === previous) { if (Number(v.training) === 5) v.training = 0; v.originSource = ""; }
  }
  s.abilities = (s.abilities || []).filter(a => !String(a.autoSource || "").startsWith("origin:"));
  s.origin = nextOrigin; const rule = originRule(nextOrigin);
  if (rule) {
    for (const key of rule.skills || []) { const v = s.skills[key]; if (v && Number(v.training) < 5) { v.training = 5; v.originSource = nextOrigin; } }
    const src = (state.compendium.abilities || []).find(a => a.group === "Origens" && a.name === rule.power);
    if (src && !s.abilities.some(a => a.catalogId === src.id)) { const copy = deepCopy(src); copy.id = uid(); copy.catalogId = src.id; copy.autoSource = `origin:${nextOrigin}`; copy.equipped = false; copy.quantity = 1; copy.modifications = []; copy.curses = []; s.abilities.push(copy); }
  }
  s.originState.appliedOrigin = nextOrigin; deriveCharacter(c); renderSkills(); renderCollections(); renderDerived(); renderOriginNotice(); setDirty();
  if (!silent && nextOrigin) {
    const skills = (rule?.skills || []).map(k => SKILLS.find(x => x.key === k)?.label || k), details = [];
    if (skills.length) details.push(`${skills.join(" + ")} treinada${skills.length > 1 ? "s" : ""}`);
    if (rule?.power) details.push(`${rule.power} adicionado`);
    if (nextOrigin === "Amnésico") details.push("perícias à escolha do Mestre");
    toast(details.join(" // ") || "Benefícios aplicados automaticamente.", { title: `ORIGEM APLICADA // ${nextOrigin.toUpperCase()}`, duration: 4300 });
  }
}

function controllerName() {
  const pid = state.char?.controllers?.[0];
  if (!pid) return state.role === "GM" ? "Mestre / sem controlador" : state.name;
  return state.party.find(p => p.id === pid)?.name || "Jogador atribuído";
}
function render() {
  if (!state.char) return;
  const c = state.char, s = c.system;
  if (state.role === "GM" && s.origin && s.originState?.appliedOrigin !== s.origin) applyOriginSelection(s.origin, { silent: true });
  $("#topName").textContent = c.name.toUpperCase(); $("#name").value = c.name; $("#controllerName").textContent = controllerName();
  $("#class").innerHTML = `<option value="">Sem classe</option>${opt(CLASSES, s.class)}`;
  $("#origin").innerHTML = `<option value="">Sem origem</option>${(state.compendium?.origins || []).map(x => `<option value="${escapeHtml(x)}" ${x === s.origin ? "selected" : ""}>${escapeHtml(x)}</option>`).join("")}`;
  $("#trail").innerHTML = `<option value="">Sem trilha</option>${(state.compendium?.trails || []).map(x => `<option value="${escapeHtml(x)}" ${x === s.trilha ? "selected" : ""}>${escapeHtml(x)}</option>`).join("")}`;
  syncIdentitySelects();
  $("#level").value = s.nivel.value; $("#prestige").value = s.patent.prestigePoints;
  $("#pvBonus").value = s.PV.manualMax; $("#pdBonus").value = s.PD.manualMax; $("#defBonus").value = s.defense.manual; $("#movementBonus").value = s.desloc.manual; $("#ritualDtBonus").value = s.ritual.manualDT;
  $("#storageState").textContent = storageLabel();
  renderAttributes(); renderSkills(); renderCollections(); renderDerived(); renderOriginNotice(); setEditable(); $("#loading").classList.add("hidden");
}
function setEditable() {
  state.canEdit = isAuthorized(state.char, state.playerId, state.role) || state.isNew && state.role === "GM";
  $("#locked").classList.toggle("hidden", state.canEdit);
  document.querySelectorAll("input,select,textarea,[data-open-library],[data-remove-selected],[data-edit-selected],[data-edit-weapon],[data-equipped],[data-quantity]").forEach(el => { el.disabled = !state.canEdit; });
  // Rolagens continuam disponíveis em modo de consulta; elas não alteram a ficha.
  document.querySelectorAll("[data-roll],[data-weapon-attack],[data-ritual-roll],#diceRoll").forEach(el => el.disabled = false);
  $("#saveBtn").disabled = !state.canEdit; syncIdentitySelects();
}
function readCore({ renderAfter = true } = {}) {
  if (!state.char) return null;
  const c = state.char, s = c.system, old = { PV: s.PV.max, PD: s.PD.max };
  c.name = $("#name").value.trim() || "Protagonista"; s.class = $("#class").value; s.trilha = $("#trail").value;
  s.NEX.base = Number($("#nexBase").value) || 0; s.nivel.value = Number($("#level").value) || 1; s.PV.value = Number($("#pv").value) || 0; s.PD.value = Number($("#pd").value) || 0;
  s.PV.manualMax = Number($("#pvBonus").value) || 0; s.PD.manualMax = Number($("#pdBonus").value) || 0; s.defense.manual = Number($("#defBonus").value) || 0; s.desloc.manual = Number($("#movementBonus").value) || 0; s.ritual.manualDT = Number($("#ritualDtBonus").value) || 0; s.patent.prestigePoints = Number($("#prestige").value) || 0;
  document.querySelectorAll("[data-attr]").forEach(x => s.attributes[x.dataset.attr].value = Number(x.value) || 0);
  document.querySelectorAll(".skill-row").forEach(row => {
    const v = s.skills[row.dataset.skill]; if (!v) return;
    v.attr = row.querySelector("[data-skill-attr]").value; v.training = Number(row.querySelector("[data-training]").value) || 0; v.mod = Number(row.querySelector("[data-skill-mod]").value) || 0;
    if (row.dataset.skill === "freeSkill") v.name = row.querySelector("[data-free-name]").value.trim() || "Profissão";
  });
  c.updatedAt = Date.now(); deriveCharacter(c, { previousMax: old });
  if (renderAfter) { renderDerived(); renderInventoryDashboard(); }
  return c;
}

async function publishProfile(c) {
  if (!OBR.isAvailable || state.role !== "GM") return;
  const profile = profileFromCharacter(c);
  for (const pid of c.controllers || []) { const p = state.party.find(x => x.id === pid); if (p?.connectionId) await OBR.broadcast.sendMessage(SKILL_BRIDGE_CHANNEL, { type: "profile", targetConnectionId: p.connectionId, profile }, { destination: "REMOTE" }); }
}
async function save() {
  if (!state.canEdit) return;
  readCore(); $("#saveBtn").disabled = true;
  try {
    if (state.role === "GM") {
      const wasNew = state.isNew; await writeCharacterAsGM(); state.isNew = false;
      await OBR.broadcast.sendMessage(SYNC_CHANNEL, { type: "catalog-changed", characterId: state.char.id }, { destination: "REMOTE" });
      await OBR.broadcast.sendMessage(SYNC_CHANNEL, { type: "character-updated", characterId: state.char.id }, { destination: "REMOTE" });
      await OBR.broadcast.sendMessage(SYNC_CHANNEL, { type: "token-linked", characterId: state.char.id }, { destination: "ALL" });
      await publishProfile(state.char); setDirty(false); toast(wasNew ? "PROTAGONISTA CRIADO NO OWLBEAR" : "FICHA SALVA NO OWLBEAR"); render();
    } else {
      const req = uid(); state.requestId = req;
      await OBR.broadcast.sendMessage(SYNC_CHANNEL, { type: "update-character", requestId: req, characterId: state.char.id, character: normalizeCharacter(state.char) }, { destination: "REMOTE" });
      $("#saveState").textContent = "ENVIANDO AO MESTRE…";
    }
  } catch (e) { console.error(e); toast(`ERRO // ${e.message || e}`); $("#saveState").textContent = "ERRO AO SALVAR"; }
  finally { $("#saveBtn").disabled = !state.canEdit; }
}
async function request(id) { const req = uid(); state.requestId = req; await OBR.broadcast.sendMessage(SYNC_CHANNEL, { type: "request-character", requestId: req, characterId: id }, { destination: "REMOTE" }); }
async function onSync(event) {
  const d = event.data || {}; if (d.targetConnectionId && d.targetConnectionId !== state.connectionId) return;
  if (d.type === "character-deleted" && d.characterId === state.char?.id) { toast("PROTAGONISTA EXCLUÍDO"); if (OBR.isAvailable) setTimeout(() => OBR.modal.close(SHEET_MODAL_ID), 700); return; }
  if (d.type === "update-result" && d.requestId === state.requestId && !d.ok) {
    const message = d.error || "O Mestre não conseguiu salvar a ficha no Owlbear.";
    $("#saveState").textContent = "ERRO AO SALVAR";
    $("#saveBtn").disabled = !state.canEdit;
    toast(`ERRO // ${message}`);
    return;
  }
  if ((d.type === "character-snapshot" && d.requestId === state.requestId) || (d.type === "update-result" && d.requestId === state.requestId && d.ok)) {
    if (d.character) { state.char = normalizeCharacter(d.character); state.isNew = false; setDirty(false); render(); }
  }
  if (d.type === "character-updated" && d.characterId === state.char?.id && !state.dirty) {
    const meta = await OBR.room.getMetadata(); if (loadDb(meta) && state.store[d.characterId]) { state.char = state.store[d.characterId]; render(); }
  }
}

// ---------- coleções ----------
function itemMeta(it, kind) {
  if (kind === "rituals") return `${ELEMENTS[it.element] || it.element || "Ritual"} // ${it.circle || "?"}º CÍRCULO${it.execution ? ` // ${ritualLabel("execution", it.execution)}` : ""}`;
  if (kind === "abilities") return `${it.group || "Habilidade"}${it.path ? ` // ${it.path}` : ""}${it.activation ? ` // ${it.activation}` : ""}`;
  const d = itemDerived(it), cat = effectiveItemCategory(it, state.char);
  if (it.type === "armament") return `ARMAMENTO // CAT ${romanCategory(cat)} // ${d.weight} ESP${it.damage?.formula ? ` // ${it.damage.formula}` : ""}`;
  if (it.type === "protection") return `PROTEÇÃO // DEF +${d.defense || 0} // CAT ${romanCategory(cat)} // ${d.weight} ESP`;
  return `${it.group || it.categoryPath || "EQUIPAMENTO"} // CAT ${romanCategory(cat)} // ${d.weight} ESP`;
}
function enhancementChips(it) {
  const mods = modificationsFor(it), curses = cursesFor(it), modMap = new Map(mods.map(x => [x.id, x])), curseMap = new Map(curses.map(x => [x.id, x]));
  const selected = [...(it.modifications || []).map(id => ({ label: modMap.get(id)?.name || id, kind: "MOD" })), ...(it.curses || []).map(id => ({ label: curseMap.get(id)?.name || id, kind: "MALDIÇÃO", element: curseMap.get(id)?.element }))];
  return selected.length ? `<div class="enhancement-chips">${selected.map(x => `<span class="enh-chip ${x.element ? (ELEMENT_CLASS[Object.keys(ELEMENTS).find(k => ELEMENTS[k] === x.element)] || "") : ""}"><b>${x.kind}</b>${escapeHtml(x.label)}</span>`).join("")}</div>` : "";
}
function ritualRollButtons(it, index) {
  const modes = it.damageModes && typeof it.damageModes === "object" ? it.damageModes : {};
  const labels = { normal: "NORMAL", discente: "DISCENTE", verdadeiro: "VERDADEIRO" };
  return Object.entries(modes).filter(([, v]) => v?.formula).map(([key, v]) => `<span class="ritual-roll"><span>${labels[key] || key.toUpperCase()}</span><strong>${escapeHtml(v.formula)}</strong><button type="button" data-ritual-roll="${index}:${escapeHtml(key)}" title="Rolar dano">${d20}</button></span>`).join("");
}
function detailHtml(it, kind) {
  let chips = [];
  if (kind === "rituals") chips = [`${it.circle || "?"}º círculo`, ritualLabel("execution", it.execution), ritualLabel("range", it.range), ritualLabel("target", it.target), ritualLabel("duration", it.duration), ritualLabel("resistance", it.resistance)].filter(Boolean);
  else if (kind === "abilities") chips = [it.group, it.path, it.activation, it.cost ? `${it.cost} ${it.costType || "PD"}` : "", it.preRequisite ? `Pré: ${adaptCampaignText(it.preRequisite, it, kind)}` : ""].filter(Boolean);
  else { const d = itemDerived(it), cat = effectiveItemCategory(it, state.char); chips = [it.type === "armament" ? "Armamento" : it.type === "protection" ? "Proteção" : "Equipamento", `Cat ${romanCategory(cat)}`, `${d.weight} espaço(s)`, it.critical ? `Crítico ${it.critical}` : "", it.range ? `Alcance ${rangeLabel(it.range)}` : "", it.damage?.type ? damageTypeLabel(it.damage.type) : ""].filter(Boolean); }
  return `${kind === "rituals" ? `<div class="meta-chips">${elementTag(it.element)}${chips.map(x => `<span class="chip">${escapeHtml(x)}</span>`).join("")}</div>` : `<div class="meta-chips">${chips.map(x => `<span class="chip">${escapeHtml(x)}</span>`).join("")}</div>`}${kind === "inventory" ? enhancementChips(it) : ""}<div class="description-html">${sanitizeHtml(it.description || "<p>Sem descrição.</p>", it, kind)}</div>`;
}
function recordActions(kind, index) { return `<div class="record-actions"><button class="danger" data-remove-selected>REMOVER</button><button data-edit-selected="${kind}:${index}">EDITAR</button></div>`; }
function selectedCard(it, kind, index) {
  const equip = kind === "inventory" && (it.type === "armament" || it.type === "protection" || itemEnhancementScope(it) === "accessory");
  const ritualRolls = kind === "rituals" ? ritualRollButtons(it, index) : "";
  const weaponUse = kind === "inventory" && it.type === "armament" ? `<button class="use-weapon" data-weapon-attack="${index}">USAR ARMA</button>` : "";
  return `<article class="selected-card ${it.equipped ? "active-equipment" : ""}" data-selected-kind="${kind}" data-index="${index}">
    <div class="selected-main">
      <div class="selected-icon" data-toggle-detail>${imageOrMark(it, kind === "rituals" ? "◈" : "◇")}</div>
      <div class="selected-info" data-toggle-detail><strong>${escapeHtml(displayItemName(it, kind))}</strong><span>${escapeHtml(itemMeta(it, kind))}</span>${kind === "inventory" && ((it.modifications || []).length || (it.curses || []).length) ? `<small>${(it.modifications || []).length} MOD // ${(it.curses || []).length} MALDIÇÃO</small>` : ""}</div>
      <div class="selected-actions">${ritualRolls}${kind === "inventory" ? `<label title="Quantidade">QTD <input data-quantity type="number" min="0" value="${it.quantity ?? 1}"></label>` : ""}${equip ? `<label><input data-equipped type="checkbox" ${it.equipped ? "checked" : ""}> USAR</label>` : ""}${weaponUse}<button data-edit-selected="${kind}:${index}">EDITAR</button><button class="danger" data-remove-selected>REMOVER</button><button data-toggle-detail title="Visualizar" aria-label="Visualizar">${chevron}</button></div>
    </div>
    <div class="selected-detail">${detailHtml(it, kind)}${recordActions(kind, index)}</div>
  </article>`;
}
function collectionSection(title, items, kind) { if (!items.length) return ""; return `<section class="collection-group"><div class="collection-group-title"><span>${escapeHtml(title)}</span><i></i><em>${items.length}</em></div>${items.map(({ item, index }) => selectedCard(item, kind, index)).join("")}</section>`; }
function renderInventoryDashboard() {
  if (!state.char) return; const inv = inventoryState(state.char), p = inv.patent;
  $("#inventoryPrestige").textContent = `${state.char.system.patent.prestigePoints} PP`; $("#inventoryPatent").textContent = p.name.toUpperCase(); $("#inventoryCredit").textContent = p.credit.toUpperCase();
  const privilege = $("#patentPrivilege"); if (p.privilege) { privilege.classList.remove("hidden"); privilege.textContent = p.privilege; } else { privilege.classList.add("hidden"); privilege.textContent = ""; }
  p.limits.forEach((v, i) => { $(`#limitCat${i + 1}`).textContent = v; const count = inv.counts[i] || 0, cell = $(`#countCat${i + 1}`); cell.textContent = count; cell.classList.toggle("limit-over", count > v); });
  $("#loadNumbers").textContent = `${inv.used} / ${inv.max}`; $("#loadHard").textContent = `MÁX. ABSOLUTO ${inv.hardMax}`; $("#loadFill").style.width = `${inv.hardMax ? Math.min(100, inv.used / inv.hardMax * 100) : 0}%`;
  $("#loadFill").classList.toggle("overloaded", inv.overloaded); $("#loadFill").classList.toggle("invalid", inv.invalid); $("#loadStatus").textContent = inv.invalid ? "CARGA INVÁLIDA" : inv.overloaded ? "SOBRECARREGADO" : "NORMAL"; $("#loadStatus").className = inv.invalid ? "invalid" : inv.overloaded ? "overloaded" : "";
  const categoryOver = inv.counts.some((n, i) => n > inv.limits[i]), notice = $("#inventoryNotice");
  if (categoryOver || inv.invalid || inv.overloaded) { notice.classList.remove("hidden"); notice.innerHTML = `<strong>${inv.invalid ? "CARGA ACIMA DO LIMITE ABSOLUTO" : inv.overloaded ? "SOBRECARREGADO" : "LIMITE DE CATEGORIA EXCEDIDO"}</strong><span>${categoryOver ? " Há mais itens requisitados em alguma categoria do que sua patente permite." : ""}${inv.overloaded ? " A carga atual aplica as penalidades automáticas de sobrecarga." : ""}</span>`; } else { notice.classList.add("hidden"); notice.innerHTML = ""; }
}
function renderCollections() {
  if (!state.char) return; const s = state.char.system; renderInventoryDashboard();
  if (s.inventory.length) {
    const rows = s.inventory.map((item, index) => ({ item, index }));
    $("#inventoryList").innerHTML = [collectionSection("ARMAMENTOS", rows.filter(x => x.item.type === "armament"), "inventory"), collectionSection("PROTEÇÕES", rows.filter(x => x.item.type === "protection"), "inventory"), collectionSection("EQUIPAMENTOS", rows.filter(x => !["armament", "protection"].includes(x.item.type)), "inventory")].join("");
  } else $("#inventoryList").innerHTML = '<div class="selected-empty">Nenhum item adicionado.</div>';
  if (s.abilities.length) {
    const rows = s.abilities.map((item, index) => ({ item, index })), bucket = item => item.group === "Origens" ? "ORIGEM" : item.group === "Poderes Paranormais" ? "PODERES PARANORMAIS" : item.group === "Poderes Gerais" ? "PODERES GERAIS" : String(item.group || "").startsWith("Trilhas") ? "TRILHA" : "CLASSE";
    $("#abilityList").innerHTML = ["ORIGEM", "CLASSE", "TRILHA", "PODERES GERAIS", "PODERES PARANORMAIS"].map(name => collectionSection(name, rows.filter(x => bucket(x.item) === name), "abilities")).join("");
  } else $("#abilityList").innerHTML = '<div class="selected-empty">Nenhuma habilidade adicionada.</div>';
  if (s.rituals.length) { const rows = s.rituals.map((item, index) => ({ item, index })); $("#ritualList").innerHTML = [1, 2, 3, 4].map(circle => collectionSection(`${circle}º CÍRCULO`, rows.filter(x => Number(x.item.circle) === circle), "rituals")).join("") + collectionSection("OUTROS", rows.filter(x => ![1, 2, 3, 4].includes(Number(x.item.circle))), "rituals"); }
  else $("#ritualList").innerHTML = '<div class="selected-empty">Nenhum ritual adicionado.</div>';
  renderCombat(); setEditable();
}

// ---------- combate ----------
function parseBaseCritical(w) {
  const raw = String(w?.critical || "").trim().toLowerCase(); let threshold = 20, mult = 2;
  if (raw.includes("/")) { const [a, b] = raw.split("/"); if (/^\d+$/.test(a)) threshold = Number(a) || 20; const mm = String(b || "").match(/x?(\d+)/); if (mm) mult = Number(mm[1]) || 2; }
  else if (/^x\d+$/.test(raw)) mult = Number(raw.slice(1)) || 2; else if (/^\d+$/.test(raw)) threshold = Number(raw) || 20;
  return { threshold, mult };
}
function criticalProfile(w) { const base = parseBaseCritical(w), d = itemDerived(w); let threshold = Math.max(2, base.threshold - (Number(d.threatDelta) || 0)), mult = Math.max(2, base.mult + (Number(d.critMultiplierDelta) || 0)); if (d.doubleThreat) threshold = Math.max(2, 21 - (21 - threshold) * 2); return { threshold, mult }; }
function weaponMeta(w) { const d = itemDerived(w), crit = criticalProfile(w), skill = SKILLS.find(s => s.key === (w.attack?.skill || (w.rangeType === "ranged" ? "aim" : "fighting"))), attr = w.attack?.attr || (w.rangeType === "ranged" ? "dex" : "str"), range = steppedRange(w.range, d.rangeSteps); return { d, crit, skill, attr, range }; }
function renderCombat() {
  if (!state.char) return; const weapons = state.char.system.inventory.map((w, index) => ({ w, index })).filter(x => x.w.type === "armament" && x.w.equipped);
  $("#combatWeapons").innerHTML = weapons.length ? weapons.map(({ w, index }) => {
    const { d, crit, skill, attr, range } = weaponMeta(w), extra = d.extraDamage?.length ? ` · + ${d.extraDamage.map(x => `${x.formula}${x.type ? ` ${x.type}` : ""}`).join(" + ")}` : "";
    return `<article class="weapon-card" data-weapon-card="${index}">
      <div class="weapon-main"><div class="weapon-icon" data-toggle-weapon="${index}">${imageOrMark(w, "◇")}</div><div class="weapon-copy" data-toggle-weapon="${index}"><strong>${escapeHtml(w.name)}</strong><span>${attrAbv(attr)} // ${escapeHtml(skill?.label || "Luta")} // CAT ${romanCategory(effectiveItemCategory(w, state.char))}</span><small>Dano ${escapeHtml(w.damage?.formula || "—")}${extra} · Crítico ${crit.threshold}/x${crit.mult} · ${escapeHtml(range)}</small></div><div class="weapon-actions"><button class="use-weapon" data-weapon-attack="${index}">USAR ARMA</button><button data-edit-weapon="${index}">EDITAR</button><button class="danger" data-remove-weapon="${index}">REMOVER</button></div></div>
      <div class="weapon-detail"><div class="weapon-stats"><span><b>ATAQUE</b>${attrAbv(attr)} // ${escapeHtml(skill?.label || "Luta")}</span><span><b>DANO</b>${escapeHtml(w.damage?.formula || "—")}${w.damage?.attr ? ` + ${attrAbv(w.damage.attr)}` : ""}</span><span><b>CRÍTICO</b>${crit.threshold}/x${crit.mult}</span><span><b>ALCANCE</b>${escapeHtml(range)}</span></div>${enhancementChips(w)}${detailHtml(w, "inventory")}</div>
    </article>`;
  }).join("") : '<div class="selected-empty">Marque <b>USAR</b> em um armamento no Inventário para destacá-lo aqui.</div>';
}
function parseDiceExpression(formula = "") {
  const clean = String(formula || "").replace(/\s+/g, "").replace(/−/g, "-"), parts = clean.match(/[+-]?[^+-]+/g) || []; let total = 0; const terms = [];
  for (let token of parts) {
    let sign = 1; if (token[0] === "+") token = token.slice(1); else if (token[0] === "-") { sign = -1; token = token.slice(1); }
    const dm = token.match(/^(\d*)d(\d+)$/i);
    if (dm) { const count = Math.min(100, Math.max(0, Number(dm[1] || 1))), sides = Math.max(1, Number(dm[2])), rolls = Array.from({ length: count }, () => randomInt(sides)), raw = rolls.reduce((a, b) => a + b, 0), subtotal = raw * sign; total += subtotal; terms.push({ count, sides, rolls, subtotal, sign }); continue; }
    const n = Number(token); if (Number.isFinite(n)) { total += n * sign; terms.push({ flat: n * sign }); }
  }
  return { total, terms };
}
function addBaseDice(formula = "", delta = 0, mult = 1) { const raw = String(formula || "0"); let done = false; return raw.replace(/(\d*)d(\d+)/i, (_, count, sides) => { done = true; const c = Math.max(1, Number(count || 1) + Number(delta || 0)); return `${Math.max(1, c * Math.max(1, Number(mult) || 1))}d${sides}`; }) + (done ? "" : ""); }
function rollEntryBase(title, subtitle, formula, total, terms, natural = 0, modifier = 0) { return { kind: "roll", id: uid(), authorId: state.playerId, authorName: state.char?.name || state.name, authorColor: state.color, createdAt: Date.now(), title, subtitle, formula, total, modifier, natural, terms }; }
async function sendRollEntry(entry, { critical = false, damageIndex = null } = {}) {
  if (OBR.isAvailable) await OBR.broadcast.sendMessage(CHAT_CHANNEL, { type: "entry", entry }, { destination: "ALL" });
  showRollPopup(entry, { critical, damageIndex });
}
function showRollPopup(entry, { critical = false, damageIndex = null } = {}) {
  const p = $("#rollPopup"); clearTimeout(state.popupTimer); p.classList.remove("hidden", "critical"); p.classList.toggle("critical", critical);
  $("#rollPopupAuthor").textContent = entry.authorName || state.char?.name || "PROTAGONISTA"; $("#rollPopupTitle").textContent = entry.title || "ROLAGEM"; $("#rollPopupSubtitle").textContent = entry.subtitle || ""; $("#rollPopupFormula").textContent = entry.formula || ""; $("#rollPopupTotal").textContent = entry.total;
  const dmg = $("#rollPopupDamage"); if (damageIndex !== null) { dmg.classList.remove("hidden"); dmg.dataset.weaponDamage = String(damageIndex); } else { dmg.classList.add("hidden"); delete dmg.dataset.weaponDamage; }
  state.popupTimer = setTimeout(() => p.classList.add("hidden"), 8000);
}
async function rollSkillFromSheet(skillKey) { if (!state.char) return; readCore({ renderAfter: false }); const r = rollSkill(state.char, skillKey), entry = makeChatEntry(state.char, skillKey, r, { id: state.playerId, name: state.name, color: state.color }); await sendRollEntry(entry); }
async function attackWithWeapon(index) {
  if (!state.char) return; readCore({ renderAfter: false }); const w = state.char.system.inventory[index]; if (!w || w.type !== "armament") return;
  const { d, crit, skill, attr } = weaponMeta(w), score = effectiveAttribute(state.char, attr), eff = effectiveSkill(state.char, skill?.key || w.attack?.skill || "fighting"), count = score <= 0 ? 2 : Math.max(1, score), rolls = Array.from({ length: count }, () => randomInt(20)), kept = score <= 0 ? Math.min(...rolls) : Math.max(...rolls), bonus = (Number(eff.training) || 0) + (Number(eff.mod) || 0) + numericBonus(w.attack?.bonus) + (Number(d.attackBonus) || 0), total = kept + bonus, isCrit = kept >= crit.threshold;
  state.lastAttack[w.id] = { critical: isCrit, natural: kept, at: Date.now() };
  const formula = `${count}d20${score <= 0 ? "kl" : "kh"}${bonus ? bonus > 0 ? ` + ${bonus}` : ` - ${Math.abs(bonus)}` : ""}`;
  const entry = rollEntryBase(`Ataque — ${w.name}${isCrit ? " // CRÍTICO" : ""}`, `${skill?.label || "Luta"} com ${attrLabel(attr)} · ameaça ${crit.threshold}/x${crit.mult}`, formula, total, [{ count, sides: 20, rolls, subtotal: kept, keep: score <= 0 ? "lowest" : "highest", kept }], kept, bonus);
  await sendRollEntry(entry, { critical: isCrit, damageIndex: index });
}
async function damageWithWeapon(index) {
  if (!state.char) return; readCore({ renderAfter: false }); const w = state.char.system.inventory[index]; if (!w || w.type !== "armament") return;
  const d = itemDerived(w), last = state.lastAttack[w.id], crit = criticalProfile(w), critical = Boolean(last?.critical), base = addBaseDice(w.damage?.formula || "0", d.extraBaseDie || 0, critical ? crit.mult : 1), attrBonus = w.damage?.attr ? effectiveAttribute(state.char, w.damage.attr) : 0, flat = attrBonus + numericBonus(w.damage?.bonus) + (Number(d.damageFlat) || 0), extras = (d.extraDamage || []).filter(x => x?.formula), formula = [base, ...extras.map(x => x.formula), flat ? String(flat) : ""].filter(Boolean).join(" + "), rolled = parseDiceExpression(formula);
  const types = [damageTypeLabel(w.damage?.type), ...extras.map(x => damageTypeLabel(x.type)).filter(Boolean)].join(" + ");
  const entry = rollEntryBase(`Dano — ${w.name}${critical ? " // CRÍTICO" : ""}`, `${types || "Dano"}${critical ? ` · x${crit.mult}` : ""}`, formula, rolled.total, rolled.terms.filter(x => x.sides).map(x => ({ count: x.count, sides: x.sides, rolls: x.rolls, subtotal: x.subtotal })), 0, flat);
  await sendRollEntry(entry, { critical });
}
async function rollRitualDamage(index, mode) {
  const r = state.char?.system?.rituals?.[index], data = r?.damageModes?.[mode]; if (!r || !data?.formula) return;
  const rolled = parseDiceExpression(data.formula), label = { normal: "Normal", discente: "Discente", verdadeiro: "Verdadeiro" }[mode] || mode;
  const entry = rollEntryBase(`${r.name} — ${label}`, data.type || `${ELEMENTS[r.element] || "Ritual"}`, data.formula, rolled.total, rolled.terms.filter(x => x.sides).map(x => ({ count: x.count, sides: x.sides, rolls: x.rolls, subtotal: x.subtotal })));
  await sendRollEntry(entry);
}
async function rollFreeDice() {
  const count = Math.max(1, Math.min(30, Number($("#diceQty").value) || 1)), sides = state.selectedDie || 20, bonus = Number($("#diceBonus").value) || 0, khRaw = Number($("#diceKh").value) || 0, kh = khRaw > 0 ? Math.min(count, Math.max(1, khRaw)) : 0, rolls = Array.from({ length: count }, () => randomInt(sides));
  let keptRolls = rolls, diceTotal = rolls.reduce((a, b) => a + b, 0), formula = `${count}d${sides}`;
  if (kh) { keptRolls = [...rolls].sort((a, b) => b - a).slice(0, kh); diceTotal = keptRolls.reduce((a, b) => a + b, 0); formula += `kh${kh}`; }
  if (bonus) formula += bonus > 0 ? ` + ${bonus}` : ` - ${Math.abs(bonus)}`;
  const total = diceTotal + bonus, entry = rollEntryBase(`Rolagem livre — D${sides}`, kh ? `Mantém os ${kh} maiores dados` : `${count} dado(s)`, formula, total, [{ count, sides, rolls, subtotal: diceTotal, keep: kh ? "highest" : undefined, kept: kh ? keptRolls : undefined }], 0, bonus);
  await sendRollEntry(entry);
}

// ---------- biblioteca estável ----------
function currentList(type) { return type === "inventory" ? state.char.system.inventory : type === "abilities" ? state.char.system.abilities : state.char.system.rituals; }
function librarySource(type) { return state.compendium?.[type] || []; }
function primaryFilters(type) { if (type === "rituals") return ["Todos", "Conhecimento", "Energia", "Morte", "Sangue", "Medo"]; if (type === "abilities") return ["Todos", "Poderes de Classe", "Trilhas", "Origens", "Poderes Gerais", "Poderes Paranormais"]; return ["Todos", "Armamentos", "Equipamentos", "Proteções"]; }
function itemPrimaryMatch(it, value, type) {
  if (value === "Todos") return true;
  if (type === "rituals") return (ELEMENTS[it.element] || it.element) === value;
  if (type === "inventory") { if (value === "Armamentos") return it.type === "armament"; if (value === "Proteções") return it.type === "protection"; if (value === "Equipamentos") return it.type === "generalEquipment"; }
  if (value === "Poderes de Classe") return ["Combatente", "Especialista", "Ocultista", "Sobrevivente"].includes(it.group);
  if (value === "Trilhas") return String(it.group).startsWith("Trilhas");
  return it.group === value;
}
function secondaryFilters(type, primary) {
  if (type === "rituals") return ["Todos", "1º Círculo", "2º Círculo", "3º Círculo", "4º Círculo"];
  const src = librarySource(type).filter(i => itemPrimaryMatch(i, primary, type));
  if (type === "abilities") { if (primary === "Poderes de Classe") return ["Todos", "Combatente", "Especialista", "Ocultista", "Sobrevivente"]; if (primary === "Trilhas" || primary === "Poderes Paranormais") return ["Todos", ...[...new Set(src.map(i => i.path).filter(Boolean))].sort((a, b) => a.localeCompare(b, "pt-BR"))]; return ["Todos"]; }
  return ["Todos", ...[...new Set(src.map(i => (i.folderPath || [])[0]).filter(Boolean))].sort((a, b) => a.localeCompare(b, "pt-BR"))];
}
function secondaryMatch(it, value, type) { if (value === "Todos") return true; if (type === "rituals") return Number(it.circle) === Number(value[0]); if (type === "abilities") { if (state.library.primary === "Poderes de Classe") return it.group === value; if (state.library.primary === "Trilhas" || state.library.primary === "Poderes Paranormais") return it.path === value; return true; } return (it.folderPath || [])[0] === value; }
function libraryMeta(it, type) { if (type === "rituals") return `${ELEMENTS[it.element] || it.element} ${it.circle}º CÍRCULO // ${ritualLabel("execution", it.execution)}`; if (type === "abilities") return `${GROUP_SHORT[it.group] || it.group}${it.path ? ` // ${it.path}` : ""}`; return itemMeta(it, "inventory"); }
function libraryDescription(it, type) { if (type === "rituals") return `<div class="ritual-meta">${[["EXECUÇÃO", ritualLabel("execution", it.execution)], ["ALCANCE", ritualLabel("range", it.range)], ["ALVO", ritualLabel("target", it.target)], ["DURAÇÃO", ritualLabel("duration", it.duration)], ["RESISTÊNCIA", ritualLabel("resistance", it.resistance)], ["CÍRCULO", it.circle]].filter(x => x[1]).map(([k, v]) => `<span><b>${k}</b><br>${escapeHtml(v)}</span>`).join("")}</div>${detailHtml(it, "rituals")}`; return detailHtml(it, type); }
function filteredLibrary() { const L = state.library, type = L.type, q = L.query.trim().toLocaleLowerCase("pt-BR"); return librarySource(type).filter(i => itemPrimaryMatch(i, L.primary, type) && secondaryMatch(i, L.secondary, type) && (!q || `${i.name} ${plainMeta(i.description)} ${i.path || ""} ${i.group || ""} ${(i.folderPath || []).join(" ")}`.toLocaleLowerCase("pt-BR").includes(q))).sort((a, b) => displayItemName(a, type).localeCompare(displayItemName(b, type), "pt-BR")); }
function renderLibrary() {
  const L = state.library, type = L.type, prim = primaryFilters(type); $("#libraryPrimary").innerHTML = prim.map(x => `<button data-lib-primary="${escapeHtml(x)}" class="${L.primary === x ? "active" : ""}">${escapeHtml(x)}</button>`).join("");
  const sec = secondaryFilters(type, L.primary); if (!sec.includes(L.secondary)) L.secondary = "Todos"; $("#librarySecondary").innerHTML = sec.map(x => `<button data-lib-secondary="${escapeHtml(x)}" class="${L.secondary === x ? "active" : ""}">${escapeHtml(x)}</button>`).join("");
  const list = filteredLibrary(), visible = list.slice(0, L.limit || 50), added = new Set(currentList(type).map(i => i.catalogId)); $("#libraryCount").textContent = `${list.length} REGISTROS // EXIBINDO ${visible.length}`;
  const cards = visible.map(it => { const excerpt = adaptCampaignText(plainMeta(it.description || "Sem descrição."), it, type).slice(0, 300); return `<article class="library-item" data-lib-id="${escapeHtml(it.id)}"><div class="library-row"><div class="library-copy"><strong>${escapeHtml(displayItemName(it, type))}</strong><small>${escapeHtml(libraryMeta(it, type))}</small><p>${escapeHtml(excerpt)}</p></div><div class="library-actions"><button data-lib-expand title="Ver descrição" aria-label="Ver descrição">${chevron}</button><button class="add ${added.has(it.id) ? "added" : ""}" data-lib-add title="Adicionar" aria-label="Adicionar">${added.has(it.id) ? "✓" : "+"}</button></div></div><div class="library-description" data-lazy-description></div></article>`; }).join("");
  const more = list.length > visible.length ? `<button class="library-more" data-lib-more>CARREGAR MAIS <span>${Math.min(50, list.length - visible.length)}</span></button>` : "";
  $("#libraryResults").innerHTML = (cards || '<div class="selected-empty">Nenhum registro encontrado.</div>') + more;
}
function openLibrary(type) { if (!state.canEdit) return; state.library = { type, primary: "Todos", secondary: "Todos", query: "", limit: 50 }; $("#librarySearch").value = ""; $("#libraryEyebrow").textContent = "ARQUIVO DSO"; $("#libraryTitle").textContent = type === "rituals" ? "ADICIONAR RITUAIS" : type === "abilities" ? "ADICIONAR HABILIDADES" : "ADICIONAR ITENS"; $("#libraryModal").classList.remove("hidden"); $("#libraryModal").setAttribute("aria-hidden", "false"); renderLibrary(); }
function closeLibrary() { $("#libraryModal").classList.add("hidden"); $("#libraryModal").setAttribute("aria-hidden", "true"); }
function addFromLibrary(id) {
  const type = state.library.type, src = librarySource(type).find(i => i.id === id); if (!src) return; const arr = currentList(type);
  if (arr.some(x => x.catalogId === id)) { toast("JÁ ADICIONADO"); return; }
  const copy = deepCopy(src); copy.id = uid(); copy.catalogId = src.id; copy.equipped = false; copy.quantity = copy.quantity || 1; copy.modifications = []; copy.curses = []; copy.extraDamage = copy.extraDamage || [];
  if (copy.type === "protection") { if (/Proteção Leve/i.test(copy.name)) copy.weight = 2; if (/Proteção Pesada/i.test(copy.name)) copy.weight = 5; if (/Escudo/i.test(copy.name)) copy.weight = 2; }
  arr.push(copy); deriveCharacter(state.char); renderCollections(); renderDerived(); setDirty(); renderLibrary(); toast(`${src.name.toUpperCase()} ADICIONADO`);
}
function removeSelected(kind, index) { const arr = currentList(kind); const item = arr[index]; if (!item) return; if (!confirm(`Remover ${item.name || "este registro"} da ficha?`)) return; arr.splice(index, 1); deriveCharacter(state.char); renderCollections(); renderDerived(); setDirty(); }

// ---------- melhorias ----------
function findInventory(index) { return state.char?.system?.inventory?.[Number(index)] || null; }
function enhancementAllowed(item, opt, kind) {
  if (kind === "mods") {
    if (item.type === "protection") {
      const heavy = /Pesada|Escudo/i.test(item.name), light = /Leve/i.test(item.name);
      if (["antibombas", "blindada"].includes(opt.id) && !heavy) return "Somente proteção pesada.";
      if (opt.id === "discreta-protecao" && !light) return "Somente proteção leve.";
      if (opt.id === "reforcada" && (item.modifications || []).includes("discreta-protecao")) return "Reforçada e Discreta não podem coexistir.";
      if (opt.id === "discreta-protecao" && (item.modifications || []).includes("reforcada")) return "Discreta e Reforçada não podem coexistir.";
    }
    return "";
  }
  if (opt.element && opt.element !== "Varia") {
    const selected = (item.curses || []).map(id => cursesFor(item).find(x => x.id === id)).filter(Boolean);
    if (selected.some(c => OPPRESSING_ELEMENTS[c.element] === opt.element || OPPRESSING_ELEMENTS[opt.element] === c.element)) return `O elemento ${opt.element} é opressor de uma maldição já aplicada.`;
  }
  return "";
}
function openEnhancement(index) { const item = findInventory(index); if (!item) return; state.enhancement = { index: Number(index), tab: "mods" }; const modal = $("#enhancementModal"); modal.classList.remove("hidden"); modal.setAttribute("aria-hidden", "false"); document.body.classList.add("nested-modal-open"); renderEnhancement(); setTimeout(() => $("#enhancementClose")?.focus(), 0); }
function closeEnhancement() { $("#enhancementModal").classList.add("hidden"); $("#enhancementModal").setAttribute("aria-hidden", "true"); document.body.classList.remove("nested-modal-open"); if (!$("#editorModal").classList.contains("hidden")) setTimeout(() => $("#editorEnhancements")?.focus(), 0); }
function renderEnhancement() {
  const item = findInventory(state.enhancement.index); if (!item) { closeEnhancement(); return; }
  const tab = state.enhancement.tab, defs = tab === "mods" ? modificationsFor(item) : cursesFor(item), selected = tab === "mods" ? (item.modifications || []) : (item.curses || []), d = itemDerived(item);
  $("#enhancementTitle").textContent = `MELHORIAS // ${item.name.toUpperCase()}`; $("#enhancementMeta").innerHTML = `<span>CAT BASE <b>${romanCategory(Number(item.category) || 0)}</b></span><span>CAT ATUAL <b>${romanCategory(effectiveItemCategory(item, state.char))}</b></span><span>ESPAÇOS <b>${d.weight}</b></span>`;
  document.querySelectorAll("[data-enh-tab]").forEach(b => b.classList.toggle("active", b.dataset.enhTab === tab));
  $("#enhancementResults").innerHTML = defs.length ? defs.map(opt => { const active = selected.includes(opt.id), blocked = !active && enhancementAllowed(item, opt, tab), catDelta = tab === "mods" ? 1 : (item.curses || []).length ? 1 : 2; return `<article class="enhancement-option ${active ? "selected" : ""} ${blocked ? "blocked" : ""}" data-enh-id="${opt.id}"><div><div class="enhancement-name"><strong>${escapeHtml(opt.name)}</strong>${tab === "curses" ? elementTag(Object.keys(ELEMENTS).find(k => ELEMENTS[k] === opt.element) || "") : ""}<em>CAT +${catDelta}</em></div><p>${escapeHtml(opt.description)}</p>${blocked ? `<small>${escapeHtml(blocked)}</small>` : ""}</div><button data-toggle-enh="${opt.id}" ${blocked ? "disabled" : ""}>${active ? "REMOVER" : "ADICIONAR"}</button></article>`; }).join("") : '<div class="selected-empty">Este tipo de item não possui melhorias compatíveis.</div>';
}
function toggleEnhancement(id) {
  const item = findInventory(state.enhancement.index); if (!item) return; const tab = state.enhancement.tab, defs = tab === "mods" ? modificationsFor(item) : cursesFor(item), optn = defs.find(x => x.id === id); if (!optn) return;
  const key = tab === "mods" ? "modifications" : "curses", arr = item[key] || (item[key] = []), pos = arr.indexOf(id);
  if (pos >= 0) arr.splice(pos, 1); else { const blocked = enhancementAllowed(item, optn, tab); if (blocked) return toast(blocked.toUpperCase()); const delta = tab === "mods" ? 1 : (item.curses || []).length ? 1 : 2; if (effectiveItemCategory(item, state.char) + delta > 4) return toast("A CATEGORIA FINAL NÃO PODE PASSAR DE IV"); arr.push(id); }
  deriveCharacter(state.char); renderEnhancement(); renderCollections(); renderDerived(); setDirty();
}

// ---------- editor local / overrides ----------
function editorField(label, name, value = "", { type = "text", span = 1, options = null, min = null, max = null, placeholder = "", cleanText = false } = {}) {
  const cls = span === 4 ? "span-4" : span === 2 ? "span-2" : "", safeValue = cleanText ? editorText(value) : value;
  if (type === "textarea") return `<label class="editor-field ${cls}"><span>${label}</span><textarea name="${name}" placeholder="${escapeHtml(placeholder)}">${escapeHtml(safeValue)}</textarea></label>`;
  if (options) return `<label class="editor-field ${cls}"><span>${label}</span><select name="${name}">${options.map(([v, l, selected]) => `<option value="${escapeHtml(v)}" ${(selected || String(v) === String(value)) ? "selected" : ""}>${escapeHtml(l)}</option>`).join("")}</select></label>`;
  return `<label class="editor-field ${cls}"><span>${label}</span><input name="${name}" type="${type}" value="${escapeHtml(safeValue)}" ${min !== null ? `min="${min}"` : ""} ${max !== null ? `max="${max}"` : ""} placeholder="${escapeHtml(placeholder)}"></label>`;
}
function editorSection(kicker, title, body, cls = "") { return `<section class="editor-section ${cls}"><header><span>${escapeHtml(kicker)}</span><strong>${escapeHtml(title)}</strong></header><div class="editor-section-grid">${body}</div></section>`; }
function damageTypeOptions(current) {
  const label = damageTypeLabel(current), known = DAMAGE_TYPE_VALUES.some(([v,l]) => v === current || l === current || l === label);
  const currentRaw = DAMAGE_TYPE_VALUES.find(([v,l]) => v === current || l === current || l === label)?.[0] || current;
  return [...(!known && current ? [[current, label]] : []), ...DAMAGE_TYPE_VALUES.map(([v,l]) => [v,l])].map(([v,l]) => [v,l, v === currentRaw]);
}
function renderExtraDamageRows(item) {
  const rows = item.extraDamage || [];
  const row = (x = {}, i = "") => `<div class="extra-damage-card" data-extra-row><div class="extra-damage-index"><span>DANO EXTRA</span><strong>${String(Number(i)+1).padStart(2,"0")}</strong></div><label><span>FÓRMULA</span><input name="extraFormula" value="${escapeHtml(x.formula || "")}" placeholder="Ex.: 1d6+2"></label><label><span>TIPO DE DANO</span><select name="extraType">${damageTypeOptions(x.type || "").map(([v,l,sel]) => `<option value="${escapeHtml(v)}" ${(sel || String(v) === String(x.type || "")) ? "selected" : ""}>${escapeHtml(l)}</option>`).join("")}</select></label><button type="button" class="extra-remove" data-remove-extra="${i}" aria-label="Remover dano extra">×</button></div>`;
  return `<div class="extra-damage-list" id="extraDamageList">${rows.map(row).join("")}</div><button type="button" class="editor-add-extra" id="editorAddExtra">+ ADICIONAR DANO EXTRA</button>`;
}
function openEditor(kind, index) {
  if (!state.canEdit) return; state.editor = { kind, index: Number(index) }; const arr = currentList(kind), item = arr[index]; if (!item) return;
  $("#editorEyebrow").textContent = `REGISTRO DSO // EDIÇÃO LOCAL // ${kind === "inventory" ? "ALMOXARIFADO" : kind === "rituals" ? "OCULTISMO" : "CAPACIDADES"}`; $("#editorTitle").textContent = `EDITAR // ${displayItemName(item, kind)}`;
  const attrOpts = [["", "Nenhum"], ...Object.entries(ATTRIBUTES).map(([k, a]) => [k, a.label])], skillOpts = SKILLS.map(s => [s.key, s.label]);
  let html = `<div class="editor-stack">`;
  if (kind === "inventory") {
    html += editorSection("REGISTRO", "IDENTIFICAÇÃO", editorField("NOME", "name", item.name, { span: 2 }) + editorField("CATEGORIA BASE", "category", item.category, { type: "number", min: 0, max: 4 }) + editorField("ESPAÇOS", "weight", item.weight, { type: "number", min: 0 }));
    if (item.type === "armament") {
      const crit = parseBaseCritical(item);
      html += editorSection("CONFIGURAÇÃO DE USO", "ATAQUE", editorField("PERÍCIA", "attack.skill", item.attack?.skill || (item.rangeType === "ranged" ? "aim" : "fighting"), { options: skillOpts }) + editorField("ATRIBUTO DE ATAQUE", "attack.attr", item.attack?.attr || (item.rangeType === "ranged" ? "dex" : "str"), { options: attrOpts }) + editorField("BÔNUS DE ATAQUE", "attack.bonus", item.attack?.bonus || 0, { type: "number" }) + editorField("PROFICIÊNCIA", "proficiency", item.proficiency || "", { options: Object.entries(PROFICIENCY_LABELS) }) + editorField("EMPUNHADURA", "gripType", item.gripType || "", { options: Object.entries(GRIP_LABELS) }) + editorField("TIPO DE ALCANCE", "rangeType", item.rangeType || "", { options: Object.entries(RANGE_TYPE_LABELS) }) + editorField("ALCANCE", "range", rangeLabel(item.range || "")));
      html += editorSection("PERFIL DE DANO", "DANO & CRÍTICO", editorField("DANO BASE", "damage.formula", item.damage?.formula || "", { span: 2 }) + editorField("TIPO DE DANO", "damage.type", item.damage?.type || "", { options: damageTypeOptions(item.damage?.type || "") }) + editorField("ATRIBUTO NO DANO", "damage.attr", item.damage?.attr || "", { options: attrOpts }) + editorField("BÔNUS DE DANO", "damage.bonus", item.damage?.bonus || 0, { type: "number" }) + editorField("MARGEM DE CRÍTICO", "criticalThreshold", crit.threshold, { type: "number", min: 2, max: 20 }) + editorField("MULTIPLICADOR", "criticalMultiplier", crit.mult, { type: "number", min: 2, max: 10 }));
      html += editorSection("COMPONENTES ADICIONAIS", "DANO EXTRA", renderExtraDamageRows(item), "extra-section");
    } else if (item.type === "protection") {
      html += editorSection("PROTEÇÃO", "DEFESA", editorField("DEFESA", "defense", item.defense || 0, { type: "number" }) + editorField("TIPO", "type", item.type || "", { options: [[item.type || "protection", friendlyValue(item.type || "protection")]] }));
    }
    html += editorSection("ARQUIVO", "DESCRIÇÃO / OBSERVAÇÕES", editorField("TEXTO", "description", item.description || "", { type: "textarea", span: 4, cleanText: true }), "description-section");
  } else if (kind === "abilities") {
    html += editorSection("CAPACIDADE", "IDENTIFICAÇÃO", editorField("NOME", "name", item.name, { span: 2 }) + editorField("GRUPO", "group", item.group || "") + editorField("TRILHA / ELEMENTO", "path", item.path || ""));
    html += editorSection("REGRA", "ATIVAÇÃO & REQUISITOS", editorField("ATIVAÇÃO", "activation", item.activation || "") + editorField("CUSTO", "cost", item.cost || "") + editorField("TIPO DO CUSTO", "costType", item.costType || "PD") + editorField("PRÉ-REQUISITO", "preRequisite", item.preRequisite || "", { span: 2 }));
    html += editorSection("ARQUIVO", "DESCRIÇÃO", editorField("DESCRIÇÃO", "description", item.description || "", { type: "textarea", span: 4, cleanText: true }), "description-section");
  } else {
    const modes = item.damageModes || {};
    html += editorSection("RITUAL", "IDENTIFICAÇÃO", editorField("NOME", "name", item.name, { span: 2 }) + editorField("ELEMENTO", "element", item.element || "", { options: [["knowledge", "Conhecimento"], ["energy", "Energia"], ["death", "Morte"], ["blood", "Sangue"], ["fear", "Medo"]] }) + editorField("CÍRCULO", "circle", item.circle || 1, { type: "number", min: 1, max: 4 }));
    html += editorSection("CONJURAÇÃO", "PARÂMETROS", editorField("EXECUÇÃO", "execution", ritualLabel("execution", item.execution || "")) + editorField("ALCANCE", "range", ritualLabel("range", item.range || "")) + editorField("ALVO", "target", ritualLabel("target", item.target || "")) + editorField("DURAÇÃO", "duration", ritualLabel("duration", item.duration || "")) + editorField("RESISTÊNCIA", "resistance", ritualLabel("resistance", item.resistance || ""), { span: 2 }));
    let modeFields = ""; for (const mode of ["normal", "discente", "verdadeiro"]) { const v = modes[mode] || {}; modeFields += editorField(`${mode.toUpperCase()} — FÓRMULA`, `ritual.${mode}.formula`, v.formula || "") + editorField(`${mode.toUpperCase()} — TIPO`, `ritual.${mode}.type`, v.type || "", { options: damageTypeOptions(v.type || "") }); }
    html += editorSection("ROLAGEM DIRETA", "DANO POR FORMA", modeFields);
    html += editorSection("ARQUIVO", "DESCRIÇÃO", editorField("DESCRIÇÃO COMPLETA", "description", item.description || "", { type: "textarea", span: 4, cleanText: true }), "description-section");
  }
  html += `</div>`; $("#editorBody").innerHTML = html;
  const enhance = $("#editorEnhancements"), can = kind === "inventory" && (modificationsFor(item).length || cursesFor(item).length); enhance.classList.toggle("hidden", !can);
  $("#editorModal").classList.remove("hidden"); $("#editorModal").setAttribute("aria-hidden", "false");
}
function closeEditor() { $("#editorModal").classList.add("hidden"); $("#editorModal").setAttribute("aria-hidden", "true"); }
function setNested(obj, path, value) { const parts = path.split("."); let cur = obj; while (parts.length > 1) { const k = parts.shift(); cur[k] = cur[k] && typeof cur[k] === "object" ? cur[k] : {}; cur = cur[k]; } cur[parts[0]] = value; }
function saveEditor() {
  const { kind, index } = state.editor, item = currentList(kind)?.[index]; if (!item) return;
  const fd = new FormData($("#editorForm"));
  for (const [name, raw] of fd.entries()) {
    if (["criticalThreshold", "criticalMultiplier", "extraFormula", "extraType"].includes(name) || name.startsWith("ritual.")) continue;
    let value = raw; if (["category", "weight", "defense", "circle", "attack.bonus", "damage.bonus"].includes(name)) value = Number(raw) || 0; setNested(item, name, value);
  }
  if (kind === "inventory" && item.type === "armament") {
    const threshold = Math.max(2, Math.min(20, Number(fd.get("criticalThreshold")) || 20)), mult = Math.max(2, Number(fd.get("criticalMultiplier")) || 2); item.critical = threshold === 20 ? `x${mult}` : `${threshold}/x${mult}`;
    item.extraDamage = [...$("#editorBody").querySelectorAll("[data-extra-row]")].map(row => ({ formula: row.querySelector('[name="extraFormula"]').value.trim(), type: row.querySelector('[name="extraType"]').value.trim() })).filter(x => x.formula);
  }
  if (kind === "rituals") {
    item.damageModes = {}; for (const mode of ["normal", "discente", "verdadeiro"]) { const formula = String(fd.get(`ritual.${mode}.formula`) || "").trim(), type = String(fd.get(`ritual.${mode}.type`) || "").trim(); if (formula) item.damageModes[mode] = { formula, type }; }
  }
  state.char.updatedAt = Date.now(); deriveCharacter(state.char); renderCollections(); renderDerived(); renderSkills(); setDirty(); closeEditor(); toast("ALTERAÇÃO LOCAL SALVA");
}

// ---------- init ----------
async function init() {
  state.compendium = await fetch("./data/compendium.json").then(r => r.json());
  if (!OBR.isAvailable) {
    state.role = "GM"; state.name = "Prévia"; state.playerId = "preview"; state.party = [];
    state.char = deriveCharacter(makeCharacter(), { refill: true }); state.char.system.PV.value = state.char.system.PV.max; state.char.system.PD.value = state.char.system.PD.max; state.canEdit = true; state.db = packRoomDb({ [state.char.id]: state.char }, state.compendium, "preview"); render(); return;
  }
  await new Promise(r => OBR.onReady(r));
  [state.role, state.name, state.connectionId, state.color] = await Promise.all([OBR.player.getRole(), OBR.player.getName(), OBR.player.getConnectionId(), OBR.player.getColor()]);
  state.playerId = OBR.player.id; state.roomId = OBR.room.id; state.party = await OBR.party.getPlayers();
  OBR.broadcast.onMessage(SYNC_CHANNEL, onSync); OBR.party.onChange(p => { state.party = p; if (state.char) $("#controllerName").textContent = controllerName(); });
  OBR.room.onMetadataChange(m => { if (m[ROOM_DB_KEY]) { state.db = m[ROOM_DB_KEY]; state.store = unpackRoomDb(state.db, state.compendium); $("#storageState").textContent = storageLabel(); const fresh = state.char && state.store[state.char.id]; if (fresh && !state.dirty) { state.char = fresh; render(); } } });
  const meta = await OBR.room.getMetadata(); loadDb(meta);
  if (state.isNew) {
    if (state.role !== "GM") { await OBR.modal.close(SHEET_MODAL_ID); return; }
    state.char = deriveCharacter(makeCharacter(), { refill: true }); state.char.system.PV.value = state.char.system.PV.max; state.char.system.PD.value = state.char.system.PD.max; render(); return;
  }
  const id = params.get("id"); if (!id) { await OBR.modal.close(SHEET_MODAL_ID); return; }
  if (state.store[id]) {
    const c = state.store[id]; if (!isAuthorized(c, state.playerId, state.role) && state.role !== "GM") { state.char = c; render(); return; }
    state.char = c; saveCache(state.roomId, state.playerId, { [id]: c }); render();
  } else if (state.role === "GM") {
    // Segurança de migração caso a tela principal ainda não tenha sido aberta.
    const legacy = loadStore(state.roomId), raw = legacy[id]; if (raw) { state.char = normalizeCharacter(raw); render(); toast("FICHA LEGADA CARREGADA // SALVE PARA MIGRAR AO OWLBEAR"); } else { $("#loading").textContent = "REGISTRO NÃO ENCONTRADO"; }
  } else await request(id);
}

// ---------- eventos ----------
$("#tabs").addEventListener("click", e => { const b = e.target.closest("[data-tab]"); if (!b) return; document.querySelectorAll("#tabs button").forEach(x => x.classList.toggle("active", x === b)); document.querySelectorAll(".tab-panel").forEach(x => x.classList.toggle("active", x.id === `tab-${b.dataset.tab}`)); });
$("#closeBtn").addEventListener("click", () => OBR.isAvailable ? OBR.modal.close(SHEET_MODAL_ID) : history.back());
$("#saveBtn").addEventListener("click", () => void save());

for (const id of ["name", "class", "trail", "nexBase", "level", "pv", "pd", "pvBonus", "pdBonus", "defBonus", "movementBonus", "ritualDtBonus", "prestige"]) {
  $("#" + id).addEventListener("input", () => { if (!state.canEdit) return; readCore(); setDirty(); if (id === "name") $("#topName").textContent = $("#name").value.toUpperCase(); if (["class", "nexBase", "level"].includes(id)) { renderSkills(); renderCollections(); } });
}
$("#class").addEventListener("change", () => { syncDsoSelect("class"); if (!state.canEdit) return; readCore(); renderDerived(); renderCollections(); setDirty(); });
$("#origin").addEventListener("change", () => { syncDsoSelect("origin"); if (state.canEdit) applyOriginSelection($("#origin").value); });
$("#trail").addEventListener("change", () => syncDsoSelect("trail"));
$("#attributes").addEventListener("input", () => { if (!state.canEdit) return; readCore(); renderSkills(); setDirty(); });
$("#skills").addEventListener("input", () => { if (!state.canEdit) return; readCore(); setDirty(); });
$("#skills").addEventListener("change", () => { if (!state.canEdit) return; readCore(); renderSkills(); setDirty(); });
$("#skills").addEventListener("click", e => { const b = e.target.closest("[data-roll]"); if (b) void rollSkillFromSheet(b.dataset.roll); });

document.addEventListener("click", e => {
  const trigger = e.target.closest(".dso-select-trigger");
  if (trigger) { const wrap = trigger.closest(".dso-select"); if (!trigger.disabled) { const opening = !wrap.classList.contains("open"); closeDsoSelects(wrap); wrap.classList.toggle("open", opening); trigger.setAttribute("aria-expanded", String(opening)); } return; }
  const option = e.target.closest("[data-dso-option]");
  if (option) { const wrap = option.closest(".dso-select"), id = wrap?.dataset.selectFor, select = id ? $("#" + id) : null; if (select && !select.disabled) { select.value = option.dataset.dsoOption; syncDsoSelect(id); closeDsoSelects(); select.dispatchEvent(new Event("input", { bubbles:true })); select.dispatchEvent(new Event("change", { bubbles:true })); } return; }
  if (!e.target.closest(".dso-select")) closeDsoSelects();
  const open = e.target.closest("[data-open-library]"); if (open) { openLibrary(open.dataset.openLibrary); return; }
  const attack = e.target.closest("[data-weapon-attack]"); if (attack) { void attackWithWeapon(Number(attack.dataset.weaponAttack)); return; }
  const ritual = e.target.closest("[data-ritual-roll]"); if (ritual) { const [i, mode] = ritual.dataset.ritualRoll.split(":"); void rollRitualDamage(Number(i), mode); return; }
  const editWeapon = e.target.closest("[data-edit-weapon]"); if (editWeapon) { openEditor("inventory", Number(editWeapon.dataset.editWeapon)); return; }
  const removeWeapon = e.target.closest("[data-remove-weapon]"); if (removeWeapon && state.canEdit) { removeSelected("inventory", Number(removeWeapon.dataset.removeWeapon)); return; }
  const toggleWeapon = e.target.closest("[data-toggle-weapon]"); if (toggleWeapon) { document.querySelector(`[data-weapon-card="${toggleWeapon.dataset.toggleWeapon}"]`)?.classList.toggle("expanded"); return; }
  const edit = e.target.closest("[data-edit-selected]"); if (edit) { const [kind, index] = edit.dataset.editSelected.split(":"); openEditor(kind, Number(index)); return; }
  const card = e.target.closest(".selected-card"); if (e.target.closest("[data-toggle-detail]") && card) { card.classList.toggle("expanded"); return; }
  const rem = e.target.closest("[data-remove-selected]"); if (rem && card && state.canEdit) { removeSelected(card.dataset.selectedKind, Number(card.dataset.index)); return; }
  const step = e.target.closest("[data-resource-step]"); if (step && state.canEdit) { const [kind, n] = step.dataset.resourceStep.split(":"), r = state.char.system[kind]; r.value = Math.max(0, Math.min(r.max, Number(r.value) + Number(n))); renderDerived(); setDirty(); return; }
});
document.addEventListener("change", e => {
  const card = e.target.closest(".selected-card"); if (!card || !state.canEdit) return; const arr = currentList(card.dataset.selectedKind), it = arr[Number(card.dataset.index)]; if (!it) return;
  if (e.target.matches("[data-equipped]")) it.equipped = e.target.checked; if (e.target.matches("[data-quantity]")) it.quantity = Math.max(0, Number(e.target.value) || 0); deriveCharacter(state.char); renderCollections(); renderDerived(); setDirty();
});

$("#diceTypes").addEventListener("click", e => { const b = e.target.closest("[data-die]"); if (!b) return; state.selectedDie = Number(b.dataset.die); document.querySelectorAll("#diceTypes button").forEach(x => x.classList.toggle("active", x === b)); });
$("#diceTypes").closest(".dice-console").addEventListener("click", e => { const b = e.target.closest("[data-dice-qty]"); if (!b) return; $("#diceQty").value = Math.max(1, Math.min(30, (Number($("#diceQty").value) || 1) + Number(b.dataset.diceQty))); });
$("#diceRoll").addEventListener("click", () => void rollFreeDice());

$("#libraryClose").addEventListener("click", closeLibrary); $("#libraryModal").addEventListener("click", e => { if (e.target === $("#libraryModal")) closeLibrary(); });
$("#libraryPrimary").addEventListener("click", e => { const b = e.target.closest("[data-lib-primary]"); if (!b) return; state.library.primary = b.dataset.libPrimary; state.library.secondary = "Todos"; state.library.limit = 50; renderLibrary(); });
$("#librarySecondary").addEventListener("click", e => { const b = e.target.closest("[data-lib-secondary]"); if (!b) return; state.library.secondary = b.dataset.libSecondary; state.library.limit = 50; renderLibrary(); });
$("#librarySearch").addEventListener("input", e => { state.library.query = e.target.value; state.library.limit = 50; renderLibrary(); });
$("#libraryResults").addEventListener("click", e => {
  const more = e.target.closest("[data-lib-more]"); if (more) { state.library.limit = (state.library.limit || 50) + 50; renderLibrary(); return; }
  const row = e.target.closest("[data-lib-id]"); if (!row) return;
  if (e.target.closest("[data-lib-expand]")) { const box = row.querySelector("[data-lazy-description]"); if (box && !box.dataset.loaded) { const it = librarySource(state.library.type).find(x => x.id === row.dataset.libId); if (it) { box.innerHTML = libraryDescription(it, state.library.type); box.dataset.loaded = "1"; } } row.classList.toggle("expanded"); return; }
  if (e.target.closest("[data-lib-add]")) addFromLibrary(row.dataset.libId);
});

$("#enhancementClose").addEventListener("click", closeEnhancement); $("#enhancementModal").addEventListener("click", e => { if (e.target === $("#enhancementModal")) closeEnhancement(); });
document.querySelector(".enhancement-tabs").addEventListener("click", e => { const b = e.target.closest("[data-enh-tab]"); if (!b) return; state.enhancement.tab = b.dataset.enhTab; renderEnhancement(); });
$("#enhancementResults").addEventListener("click", e => { const b = e.target.closest("[data-toggle-enh]"); if (b && !b.disabled) toggleEnhancement(b.dataset.toggleEnh); });

$("#editorClose").addEventListener("click", closeEditor); $("#editorCancel").addEventListener("click", closeEditor); $("#editorModal").addEventListener("click", e => { if (e.target === $("#editorModal")) closeEditor(); });
$("#editorForm").addEventListener("submit", e => { e.preventDefault(); if (state.canEdit) saveEditor(); });
$("#editorBody").addEventListener("click", e => {
  const rem = e.target.closest("[data-remove-extra]"); if (rem) { rem.closest("[data-extra-row]")?.remove(); return; }
  if (e.target.id === "editorAddExtra") { const list = $("#extraDamageList"); if (list) { const i = list.querySelectorAll("[data-extra-row]").length; list.insertAdjacentHTML("beforeend", `<div class="extra-damage-card" data-extra-row><div class="extra-damage-index"><span>DANO EXTRA</span><strong>${String(i+1).padStart(2,"0")}</strong></div><label><span>FÓRMULA</span><input name="extraFormula" placeholder="Ex.: 1d6+2"></label><label><span>TIPO DE DANO</span><select name="extraType">${damageTypeOptions("").map(([v,l]) => `<option value="${escapeHtml(v)}">${escapeHtml(l)}</option>`).join("")}</select></label><button type="button" class="extra-remove" data-remove-extra aria-label="Remover dano extra">×</button></div>`); } }
});
$("#editorEnhancements").addEventListener("click", () => { if (state.editor.kind === "inventory") openEnhancement(state.editor.index); });

document.addEventListener("keydown", e => { if (e.key !== "Escape") return; if (!$("#enhancementModal").classList.contains("hidden")) { e.preventDefault(); closeEnhancement(); return; } if (!$("#editorModal").classList.contains("hidden")) { e.preventDefault(); closeEditor(); return; } if (!$("#libraryModal").classList.contains("hidden")) { e.preventDefault(); closeLibrary(); return; } closeDsoSelects(); });
$("#rollPopupClose").addEventListener("click", () => { clearTimeout(state.popupTimer); $("#rollPopup").classList.add("hidden"); });
$("#rollPopupDamage").addEventListener("click", e => { const i = Number(e.currentTarget.dataset.weaponDamage); if (Number.isInteger(i)) void damageWithWeapon(i); });

init().catch(err => { console.error(err); $("#loading").textContent = `ERRO AO CARREGAR // ${err?.message || err}`; });

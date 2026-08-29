import OBR from "https://esm.unpkg.com/@owlbear-rodeo/sdk@3.1.0";
import {
  ROOM_DB_KEY, ROOM_KEY, LEGACY_ROOM_KEY, SYNC_CHANNEL, SKILL_BRIDGE_CHANNEL,
  SHEET_MODAL_ID, defaultCatalog, normalizeCatalog, loadStore, saveCache,
  normalizeCharacter, catalogSummary, classLabel, escapeHtml, profileFromCharacter,
  packRoomDb, unpackRoomDb, roomDbCatalog, validateRoomDbSize
} from "./core.js";

const $ = (s) => document.querySelector(s);
const state = {
  role: "PLAYER", playerId: "preview", name: "Protagonista", roomId: "preview-room",
  party: [], compendium: null, db: null, store: {}, catalog: defaultCatalog(), storage: null
};

function pct(v, m) { return m > 0 ? Math.max(0, Math.min(100, (Number(v) || 0) / (Number(m) || 1) * 100)) : 0; }
function roleName() { return state.role === "GM" ? "Mestre" : "Jogador"; }
function visibleChars() {
  const all = state.catalog?.characters || [];
  return state.role === "GM" ? all : all.filter(c => c.controllers?.includes(state.playerId));
}
function controllerOptions(c) {
  const all = [{ id: "", name: "Sem controlador" }, ...state.party.filter(p => p.role === "PLAYER").map(p => ({ id: p.id, name: p.name || "Jogador" }))];
  const current = c.controllers?.[0] || "";
  return all.map(p => `<option value="${escapeHtml(p.id)}" ${p.id === current ? "selected" : ""}>${escapeHtml(p.name)}</option>`).join("");
}
function resource(key, c) {
  const r = c[key] || { value: 0, max: 0 }, p = pct(r.value, r.max);
  return `<div class="resource ${key.toLowerCase()}"><span><b>${key}</b><em>${r.value ?? 0}/${r.max ?? 0}</em></span><div class="bar"><i style="width:${p}%"></i></div></div>`;
}
function card(c) {
  const meta = [classLabel(c.class), `NÍVEL ${c.nivel ?? 1}`, `NEX ${c.NEX ?? 0}%`, c.trilha || c.origin].filter(Boolean).join(" // ");
  return `<article class="agent-card">
    <div class="agent-main" data-open="${escapeHtml(c.id)}">
      <div class="doc-mark" aria-hidden="true"><img src="/icon.svg" alt=""></div>
      <div class="agent-info"><h3>${escapeHtml(c.name)}</h3><div class="agent-meta">${escapeHtml(meta)}</div><div class="resource-row">${resource("PV", c)}${resource("PD", c)}</div></div>
    </div>
    ${state.role === "GM" ? `<div class="controller-row"><label>CONTROLADOR</label><select class="controller-select" data-controller="${escapeHtml(c.id)}">${controllerOptions(c)}</select><button class="open-chip" data-open="${escapeHtml(c.id)}">ABRIR</button><button class="delete-chip" data-delete="${escapeHtml(c.id)}" title="Excluir protagonista" aria-label="Excluir protagonista"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M9 7V4h6v3m-8 0 1 13h8l1-13M10 11v6m4-6v6"/></svg></button></div>` : ""}
  </article>`;
}
function storageText() {
  if (!state.storage) return "OWLBEAR // —";
  return `OWLBEAR // ${Math.ceil(state.storage.bytes / 1024)} KB · ${state.storage.percent}%`;
}
function render() {
  const chars = visibleChars();
  $("#identity").textContent = `${state.name} · ${roleName()}`;
  $("#heading").textContent = state.role === "GM" ? "PROTAGONISTAS" : "MEUS PROTAGONISTAS";
  $("#subheading").textContent = state.role === "GM" ? `Banco oficial da sala salvo no Owlbear. ${storageText()}` : "Fichas sob sua responsabilidade nesta sala.";
  $("#newAgent").classList.toggle("hidden", state.role !== "GM");
  $("#stats").innerHTML = state.role === "GM"
    ? `<div class="stat"><span>PROTAGONISTAS</span><strong>${state.catalog.characters.length}</strong></div><div class="stat"><span>ATRIBUÍDOS</span><strong>${state.catalog.characters.filter(c => c.controllers?.length).length}</strong></div><div class="stat"><span>ARMAZENAMENTO</span><strong>${state.storage ? `${state.storage.percent}%` : "—"}</strong></div>`
    : `<div class="stat"><span>FICHAS</span><strong>${chars.length}</strong></div><div class="stat"><span>REGRAS</span><strong>PD</strong></div><div class="stat"><span>NÍVEL / NEX</span><strong>SEPARADOS</strong></div>`;
  $("#agentList").innerHTML = chars.map(card).join("");
  $("#empty").classList.toggle("hidden", chars.length > 0);
  $("#emptyText").textContent = state.role === "GM" ? "Crie o primeiro protagonista da sala." : "O Mestre ainda não atribuiu uma ficha a você.";
}

function rebuildFromDb(db) {
  state.db = db && typeof db === "object" ? db : { v: 1, g: state.role === "GM" ? state.playerId : "", c: [] };
  state.store = unpackRoomDb(state.db, state.compendium);
  state.catalog = roomDbCatalog(state.db, state.compendium);
  state.storage = validateRoomDbSize(state.db);
  if (state.role === "PLAYER") saveCache(state.roomId, state.playerId, state.store);
}

async function writeStore(nextStore = state.store) {
  if (state.role !== "GM") throw new Error("Somente o Mestre pode gravar o banco da sala.");
  const db = packRoomDb(nextStore, state.compendium, state.playerId);
  const size = validateRoomDbSize(db);
  if (!size.ok) throw new Error(`O banco DSO atingiria ${Math.ceil(size.bytes / 1024)} KB. O limite seguro definido é ${Math.ceil(size.limit / 1024)} KB. Remova textos personalizados muito longos ou exporte um backup antes de continuar.`);
  await OBR.room.setMetadata({ [ROOM_DB_KEY]: db });
  rebuildFromDb(db);
  saveCache(state.roomId, state.playerId, state.store);
  render();
  return db;
}

async function migrateLegacy(meta) {
  if (state.role !== "GM" || meta?.[ROOM_DB_KEY]) return false;
  const legacyStore = loadStore(state.roomId);
  const normalized = {};
  for (const [id, raw] of Object.entries(legacyStore || {})) {
    const c = normalizeCharacter(raw); c.id = id; normalized[id] = c;
  }
  if (Object.keys(normalized).length) {
    try {
      await writeStore(normalized);
      OBR.notification.show("DSO System: fichas da v0.4 migradas para o armazenamento do Owlbear.");
      return true;
    } catch (e) {
      console.error(e);
      OBR.notification.show("DSO System: a migração automática não coube no banco da sala. Exporte o backup da v0.4 antes de editar.");
    }
  }
  const empty = packRoomDb({}, state.compendium, state.playerId);
  await OBR.room.setMetadata({ [ROOM_DB_KEY]: empty });
  rebuildFromDb(empty);
  return true;
}

async function openSheet(id, newSheet = false) {
  if (!OBR.isAvailable) return alert("Abra a extensão dentro do Owlbear Rodeo.");
  await OBR.modal.open({ id: SHEET_MODAL_ID, url: newSheet ? "/sheet.html?new=1" : `/sheet.html?id=${encodeURIComponent(id)}`, fullScreen: true });
}

async function sendProfile(c, pid) {
  const player = state.party.find(p => p.id === pid);
  if (!player?.connectionId) return;
  await OBR.broadcast.sendMessage(SKILL_BRIDGE_CHANNEL, { type: "profile", targetConnectionId: player.connectionId, profile: profileFromCharacter(c) }, { destination: "REMOTE" });
}
async function assignController(id, pid) {
  if (state.role !== "GM") return;
  const c = state.store[id]; if (!c) return;
  c.controllers = pid ? [pid] : [];
  c.updatedAt = Date.now();
  state.store[id] = normalizeCharacter(c);
  try {
    await writeStore(state.store);
    await OBR.broadcast.sendMessage(SYNC_CHANNEL, { type: "catalog-changed" }, { destination: "REMOTE" });
    if (pid) await sendProfile(state.store[id], pid);
  } catch (e) { alert(e.message); }
}
async function deleteCharacter(id) {
  if (state.role !== "GM") return;
  const c = state.store[id]; if (!c) return;
  if (!confirm(`Excluir ${c.name || "este protagonista"}? Esta ação remove a ficha do armazenamento desta sala.`)) return;
  const next = { ...state.store }; delete next[id];
  try {
    await writeStore(next);
    await OBR.broadcast.sendMessage(SYNC_CHANNEL, { type: "character-deleted", characterId: id }, { destination: "ALL" });
    OBR.notification.show(`${c.name || "Protagonista"} excluído do DSO System.`);
  } catch (e) { alert(e.message); }
}

function download(name, data) {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }));
  a.download = name; document.body.append(a); a.click();
  setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 0);
}

async function init() {
  state.compendium = await fetch("./data/compendium.json").then(r => r.json());
  if (!OBR.isAvailable) {
    state.role = "GM"; state.name = "Prévia";
    rebuildFromDb(packRoomDb({}, state.compendium, "preview"));
    $("#loading").classList.add("hidden"); render(); return;
  }
  await new Promise(r => OBR.onReady(r));
  [state.role, state.name] = await Promise.all([OBR.player.getRole(), OBR.player.getName()]);
  state.playerId = OBR.player.id; state.roomId = OBR.room.id; state.party = await OBR.party.getPlayers();
  let meta = await OBR.room.getMetadata();
  if (await migrateLegacy(meta)) meta = await OBR.room.getMetadata();
  if (meta[ROOM_DB_KEY]) rebuildFromDb(meta[ROOM_DB_KEY]);
  else {
    // Leitura temporária de catálogo legado para jogadores enquanto o GM ainda não abriu a v0.5.
    state.catalog = normalizeCatalog(meta[ROOM_KEY] || meta[LEGACY_ROOM_KEY], "");
    state.store = {}; state.db = null; state.storage = null;
  }
  render(); $("#loading").classList.add("hidden");

  OBR.party.onChange(p => { state.party = p; render(); });
  OBR.room.onMetadataChange(m => {
    if (m[ROOM_DB_KEY]) rebuildFromDb(m[ROOM_DB_KEY]);
    else state.catalog = normalizeCatalog(m[ROOM_KEY] || m[LEGACY_ROOM_KEY], state.catalog?.gmId || "");
    render();
  });
  OBR.broadcast.onMessage(SYNC_CHANNEL, e => {
    if (["catalog-changed", "character-updated", "character-deleted"].includes(e.data?.type)) {
      void OBR.room.getMetadata().then(m => { if (m[ROOM_DB_KEY]) rebuildFromDb(m[ROOM_DB_KEY]); render(); });
    }
  });
}

$("#newAgent").addEventListener("click", () => openSheet("", true));
$("#menuBtn").addEventListener("click", () => $("#menu").classList.toggle("hidden"));
$("#refreshBtn").addEventListener("click", () => location.reload());
$("#agentList").addEventListener("click", e => {
  const del = e.target.closest("[data-delete]"); if (del) { void deleteCharacter(del.dataset.delete); return; }
  const el = e.target.closest("[data-open]"); if (el) void openSheet(el.dataset.open);
});
$("#agentList").addEventListener("change", e => { const el = e.target.closest("[data-controller]"); if (el) void assignController(el.dataset.controller, el.value); });
$("#exportBtn").addEventListener("click", () => {
  if (state.role !== "GM") return alert("Apenas o Mestre exporta o banco da sala.");
  download(`dso-system-${state.roomId}-v0.5.1.json`, { version: 5, source: "owlbear-room-metadata", exportedAt: Date.now(), characters: state.store });
});
$("#importInput").addEventListener("change", async e => {
  if (state.role !== "GM") return;
  const f = e.target.files?.[0]; if (!f) return;
  try {
    const data = JSON.parse(await f.text()), incoming = data.characters || {};
    const next = { ...state.store };
    for (const [id, raw] of Object.entries(incoming)) { const c = normalizeCharacter(raw); c.id = id; next[id] = c; }
    await writeStore(next);
    await OBR.broadcast.sendMessage(SYNC_CHANNEL, { type: "catalog-changed" }, { destination: "ALL" });
    alert("Backup importado para o armazenamento do Owlbear.");
  } catch (e2) { alert(e2?.message || "Arquivo de backup inválido."); }
  e.target.value = "";
});

init().catch(err => { console.error(err); $("#loading").textContent = `ERRO // ${err?.message || err}`; });

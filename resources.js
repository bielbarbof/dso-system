import OBR from "https://esm.unpkg.com/@owlbear-rodeo/sdk@3.1.0";
import { ROOM_DB_KEY, SYNC_CHANNEL, RESOURCE_MODAL_ID, unpackRoomDb, packRoomDb, validateRoomDbSize, normalizeCharacter, isAuthorized, clamp } from "./core.js";

const id = new URLSearchParams(location.search).get("id") || "";
let role = "PLAYER", playerId = "", connectionId = "", roomId = "", character = null, compendium = null, requestId = "";
const $ = s => document.querySelector(s);
function render() {
  if (!character) return; const s = character.system; $("#name").textContent = character.name || "PROTAGONISTA";
  for (const [k, r] of [["pv", s.PV], ["pd", s.PD]]) { $(`#${k}-current`).textContent = Math.round(r.value); $(`#${k}-max`).textContent = Math.round(r.max); $(`#${k}-input`).value = Math.round(r.value); $(`#${k}-input`).max = Math.max(0, r.max); $(`#${k}-fill`).style.width = `${r.max ? Math.max(0, Math.min(100, r.value / r.max * 100)) : 0}%`; }
  $("#loading").classList.add("hidden");
}
function setValue(kind, value) { if (!character) return; const r = character.system[kind]; r.value = clamp(value, 0, r.max); render(); }
async function readRoom() { const meta = await OBR.room.getMetadata(), store = meta[ROOM_DB_KEY] ? unpackRoomDb(meta[ROOM_DB_KEY], compendium) : {}; return { meta, store }; }
async function requestRemote() { requestId = crypto.randomUUID(); await OBR.broadcast.sendMessage(SYNC_CHANNEL, { type: "request-character", characterId: id, requestId }, { destination: "REMOTE" }); }
async function save() {
  if (!character) return; const PV = clamp($("#pv-input").value, 0, character.system.PV.max), PD = clamp($("#pd-input").value, 0, character.system.PD.max); $("#save").disabled = true; $("#status").textContent = "ATUALIZANDO…";
  try {
    if (role === "GM") {
      const { store } = await readRoom(), current = store[id]; if (!current) throw new Error("Protagonista não encontrado.");
      current.system.PV.value = PV; current.system.PD.value = PD; current.updatedAt = Date.now(); store[id] = normalizeCharacter(current);
      const db = packRoomDb(store, compendium, playerId), size = validateRoomDbSize(db); if (!size.ok) throw new Error("Banco DSO sem espaço seguro para salvar.");
      await OBR.room.setMetadata({ [ROOM_DB_KEY]: db }); character = store[id];
      await OBR.broadcast.sendMessage(SYNC_CHANNEL, { type: "token-linked", characterId: id }, { destination: "ALL" }); await OBR.broadcast.sendMessage(SYNC_CHANNEL, { type: "character-updated", characterId: id }, { destination: "REMOTE" });
    } else await OBR.broadcast.sendMessage(SYNC_CHANNEL, { type: "resource-update", characterId: id, PV, PD }, { destination: "REMOTE" });
    $("#status").textContent = "SALVO // OWLBEAR"; setTimeout(() => OBR.modal.close(RESOURCE_MODAL_ID), 240);
  } catch (e) { console.error(e); $("#status").textContent = `ERRO // ${e.message || "AO SALVAR"}`; $("#save").disabled = false; }
}
async function init() {
  compendium = await fetch("./data/compendium.json").then(r => r.json()); await new Promise(r => OBR.onReady(r)); [role, connectionId] = await Promise.all([OBR.player.getRole(), OBR.player.getConnectionId()]); playerId = OBR.player.id; roomId = OBR.room.id;
  OBR.broadcast.onMessage(SYNC_CHANNEL, async event => { const d = event.data || {}; if (d.type === "character-snapshot" && d.requestId === requestId && d.targetConnectionId === connectionId) { character = normalizeCharacter(d.character); render(); } if (d.type === "character-updated" && d.characterId === id) { const { store } = await readRoom(); if (store[id]) { character = store[id]; render(); } } });
  const { store } = await readRoom(); const c = store[id];
  if (c && isAuthorized(c, playerId, role)) { character = c; render(); } else if (role === "GM") throw new Error("Protagonista não encontrado."); else await requestRemote();
}
document.addEventListener("click", e => { const b = e.target.closest("[data-step]"); if (b) { const [k, n] = b.dataset.step.split(":"); setValue(k, Number(character?.system?.[k]?.value || 0) + Number(n)); return; } if (e.target.id === "save") void save(); if (e.target.id === "close") void OBR.modal.close(RESOURCE_MODAL_ID); });
for (const el of [$("#pv-input"), $("#pd-input")]) el.addEventListener("input", () => setValue(el.id.startsWith("pv") ? "PV" : "PD", el.value));
init().catch(e => { $("#loading").textContent = e.message || "ERRO AO CARREGAR"; console.error(e); });

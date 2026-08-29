import OBR, { buildShape } from "https://esm.unpkg.com/@owlbear-rodeo/sdk@3.1.0";
import {
  ID, ROOM_DB_KEY, SYNC_CHANNEL, SKILL_BRIDGE_CHANNEL, TOKEN_KEY, LEGACY_TOKEN_KEY, BAR_KEY,
  SHEET_MODAL_ID, LINK_MODAL_ID, RESOURCE_MODAL_ID, loadStore, normalizeCharacter,
  packRoomDb, unpackRoomDb, validateRoomDbSize, isAuthorized, profileFromCharacter, clamp
} from "./core.js";

let role = "PLAYER", playerId = "", roomId = "", connectionId = "", compendium = null;

async function senderPlayer(event) { const party = await OBR.party.getPlayers(); return party.find(p => p.connectionId === event.connectionId) || null; }
function tokenLink(item) { return item?.metadata?.[TOKEN_KEY] || item?.metadata?.[LEGACY_TOKEN_KEY] || null; }
async function readStore() { const meta = await OBR.room.getMetadata(); return meta[ROOM_DB_KEY] ? unpackRoomDb(meta[ROOM_DB_KEY], compendium) : {}; }
async function writeStore(store) {
  const db = packRoomDb(store, compendium, playerId), size = validateRoomDbSize(db);
  if (!size.ok) throw new Error(`Banco DSO excederia ${(size.bytes / 1024).toFixed(1)} KB.`);
  await OBR.room.setMetadata({ [ROOM_DB_KEY]: db }); return db;
}
async function ensureRoomDb() {
  if (role !== "GM") return;
  const meta = await OBR.room.getMetadata(); if (meta[ROOM_DB_KEY]) return;
  const legacy = loadStore(roomId), normalized = {};
  for (const [id, raw] of Object.entries(legacy || {})) { const c = normalizeCharacter(raw); c.id = id; normalized[id] = c; }
  try { await writeStore(normalized); if (Object.keys(normalized).length) OBR.notification.show("DSO System: fichas v0.4 migradas para o Owlbear."); }
  catch (e) { console.error(e); OBR.notification.show("DSO System: migração v0.4 excedeu o limite do banco da sala. Exporte um backup antes de editar."); }
}

async function sendProfile(c, targetConnectionId) { if (!c || !targetConnectionId) return; await OBR.broadcast.sendMessage(SKILL_BRIDGE_CHANNEL, { type: "profile", targetConnectionId, profile: profileFromCharacter(c) }, { destination: "REMOTE" }); }
async function sendProfilesFor(c) { const party = await OBR.party.getPlayers(); for (const pid of c.controllers || []) { const p = party.find(x => x.id === pid); if (p?.connectionId) await sendProfile(c, p.connectionId); } }

async function removeBars(tokenId) {
  const all = await OBR.scene.items.getItemAttachments([tokenId]);
  const ids = all.filter(i => i.id !== tokenId && i.metadata?.[BAR_KEY]?.tokenId === tokenId).map(i => i.id);
  if (ids.length) await OBR.scene.items.deleteItems(ids);
}
async function refreshTokenBars(token, c) {
  if (role !== "GM" || !token || !c) return;
  await removeBars(token.id); let bounds;
  try { bounds = await OBR.scene.items.getItemBounds([token.id]); } catch { return; }
  const width = Math.max(72, Number(bounds.width || 80) * .98), h = Math.max(16, Math.min(27, width * .10));
  const x = Number(bounds.min?.x ?? token.position?.x ?? 0) + (Number(bounds.width || width) - width) / 2, y = Number(bounds.max?.y ?? token.position?.y ?? 0) + 8;
  const ratio = r => r.max > 0 ? Math.max(0, Math.min(1, r.value / r.max)) : 0, meta = kind => ({ [BAR_KEY]: { tokenId: token.id, characterId: c.id, kind } });
  const shape = (kind, px, py, w, color) => buildShape().width(Math.max(1, w)).height(h).shapeType("RECTANGLE").position({ x: px, y: py }).fillColor(color).fillOpacity(1).strokeColor("#050608").strokeOpacity(1).strokeWidth(2).layer("ATTACHMENT").attachedTo(token.id).locked(true).disableHit(true).disableAutoZIndex(true).metadata(meta(kind)).name(`DSO ${kind}`).build();
  const pdY = y + h + 6;
  await OBR.scene.items.addItems([
    shape("pv-bg", x, y, width, "#252a31"), shape("pv-fill", x, y, width * ratio(c.system.PV), "#c52f3b"),
    shape("pd-bg", x, pdY, width, "#252a31"), shape("pd-fill", x, pdY, width * ratio(c.system.PD), "#e1e5e9")
  ]);
}
async function refreshBarsForCharacter(characterId) {
  if (role !== "GM") return; const store = await readStore(), c = store[characterId]; if (!c) return;
  const items = await OBR.scene.items.getItems(i => i.layer === "CHARACTER" && tokenLink(i)?.id === characterId);
  for (const token of items) await refreshTokenBars(token, c);
}
async function detachDeletedCharacter(characterId) {
  const linked = await OBR.scene.items.getItems(i => i.layer === "CHARACTER" && tokenLink(i)?.id === characterId);
  for (const token of linked) {
    await removeBars(token.id);
    await OBR.scene.items.updateItems([token.id], items => { for (const item of items) { item.metadata = item.metadata || {}; delete item.metadata[TOKEN_KEY]; delete item.metadata[LEGACY_TOKEN_KEY]; } }).catch(() => {});
  }
}

async function handleSync(event) {
  const d = event.data || {}; if (role !== "GM") return;
  if (d.type === "token-linked" && d.characterId) { await refreshBarsForCharacter(d.characterId); return; }
  if (d.type === "character-deleted" && d.characterId) { await detachDeletedCharacter(d.characterId); return; }
  const sender = await senderPlayer(event); if (!sender) return;
  const store = await readStore(), current = store[d.characterId];
  if (d.type === "request-character") {
    if (current && isAuthorized(current, sender.id, sender.role)) await OBR.broadcast.sendMessage(SYNC_CHANNEL, { type: "character-snapshot", requestId: d.requestId, targetConnectionId: event.connectionId, character: current }, { destination: "REMOTE" });
    return;
  }
  if (d.type === "update-character" && current && isAuthorized(current, sender.id, sender.role)) {
    try {
      const incoming = normalizeCharacter(d.character); incoming.id = current.id; incoming.controllers = [...(current.controllers || [])]; incoming.createdAt = current.createdAt; incoming.updatedAt = Date.now(); store[incoming.id] = incoming; await writeStore(store);
      await refreshBarsForCharacter(incoming.id); await sendProfilesFor(incoming);
      await OBR.broadcast.sendMessage(SYNC_CHANNEL, { type: "update-result", requestId: d.requestId, targetConnectionId: event.connectionId, ok: true, character: incoming }, { destination: "REMOTE" });
      await OBR.broadcast.sendMessage(SYNC_CHANNEL, { type: "character-updated", characterId: incoming.id }, { destination: "REMOTE" });
    } catch (e) {
      await OBR.broadcast.sendMessage(SYNC_CHANNEL, { type: "update-result", requestId: d.requestId, targetConnectionId: event.connectionId, ok: false, error: e.message || String(e) }, { destination: "REMOTE" });
    }
    return;
  }
  if (d.type === "resource-update" && current && isAuthorized(current, sender.id, sender.role)) {
    current.system.PV.value = clamp(d.PV ?? current.system.PV.value, 0, current.system.PV.max); current.system.PD.value = clamp(d.PD ?? current.system.PD.value, 0, current.system.PD.max); current.updatedAt = Date.now(); store[current.id] = normalizeCharacter(current);
    try { await writeStore(store); await refreshBarsForCharacter(current.id); await OBR.broadcast.sendMessage(SYNC_CHANNEL, { type: "character-updated", characterId: current.id }, { destination: "REMOTE" }); }
    catch (e) { console.error(e); }
  }
}

async function setup() {
  if (!OBR.isAvailable) return; compendium = await fetch("./data/compendium.json").then(r => r.json());
  await new Promise(r => OBR.onReady(r)); [role, connectionId] = await Promise.all([OBR.player.getRole(), OBR.player.getConnectionId()]); playerId = OBR.player.id; roomId = OBR.room.id;
  await ensureRoomDb();
  OBR.broadcast.onMessage(SYNC_CHANNEL, handleSync);
  OBR.broadcast.onMessage(SKILL_BRIDGE_CHANNEL, async event => {
    const d = event.data || {}; if (role !== "GM" || d.type !== "request-profile") return; const sender = await senderPlayer(event); if (!sender) return;
    const store = await readStore(), c = Object.values(store).find(x => x.controllers?.includes(sender.id)); if (c) await sendProfile(c, event.connectionId);
  });

  await OBR.contextMenu.create({
    id: `${ID}/token-sheet`, icons: [{ icon: "/icon.svg", label: "DSO System — Protagonista", filter: { every: [{ key: "layer", value: "CHARACTER" }] } }],
    async onClick(ctx) {
      const item = ctx.items?.[0]; if (!item) return; const link = tokenLink(item);
      if (link?.id) { await OBR.modal.open({ id: SHEET_MODAL_ID, url: `/sheet.html?id=${encodeURIComponent(link.id)}`, fullScreen: true }); return; }
      if (role !== "GM") { OBR.notification.show("Este token ainda não possui protagonista DSO vinculado."); return; }
      localStorage.setItem(`dso.system.pending-link.${roomId}`, JSON.stringify(ctx.items.map(i => i.id))); await OBR.modal.open({ id: LINK_MODAL_ID, url: "/link.html", width: 440, height: 560 });
    }
  });
  // Exibido em todo token de personagem; o clique valida o vínculo. Evita filtros de metadata frágeis entre versões do SDK.
  await OBR.contextMenu.create({
    id: `${ID}/token-resources`, icons: [{ icon: "/resources.svg", label: "DSO System — PV / PD", filter: { every: [{ key: "layer", value: "CHARACTER" }] } }],
    async onClick(ctx) { const item = ctx.items?.[0], link = tokenLink(item); if (!link?.id) { OBR.notification.show("Vincule este token a um Protagonista DSO primeiro."); return; } await OBR.modal.open({ id: RESOURCE_MODAL_ID, url: `/resources.html?id=${encodeURIComponent(link.id)}`, width: 390, height: 330 }); }
  }).catch(console.error);

  if (role === "GM") {
    const store = await readStore(), tokens = await OBR.scene.items.getItems(i => i.layer === "CHARACTER" && tokenLink(i)?.id);
    for (const token of tokens) { const c = store[tokenLink(token).id]; if (c) await refreshTokenBars(token, c); }
    for (const c of Object.values(store)) await sendProfilesFor(c);
  }
}
setup().catch(console.error);

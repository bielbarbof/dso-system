import OBR from "https://esm.unpkg.com/@owlbear-rodeo/sdk@3.1.0";
import { ROOM_DB_KEY, SYNC_CHANNEL, TOKEN_KEY, LEGACY_TOKEN_KEY, LINK_MODAL_ID, unpackRoomDb, roomDbCatalog, escapeHtml, classLabel } from "./core.js";

let roomId = "", compendium = null;
async function init() {
  compendium = await fetch("./data/compendium.json").then(r => r.json());
  await new Promise(r => OBR.onReady(r)); roomId = OBR.room.id;
  if (await OBR.player.getRole() !== "GM") return OBR.modal.close(LINK_MODAL_ID);
  const meta = await OBR.room.getMetadata(), db = meta[ROOM_DB_KEY], cat = db ? roomDbCatalog(db, compendium) : { characters: [] };
  document.querySelector("#list").innerHTML = cat.characters.map(c => `<button class="char" data-id="${escapeHtml(c.id)}"><strong>${escapeHtml(c.name)}</strong><span>${escapeHtml(classLabel(c.class))} // NÍVEL ${c.nivel || 1} // NEX ${c.NEX || 0}%</span><em>PV ${c.PV?.value ?? 0}/${c.PV?.max ?? 0} · PD ${c.PD?.value ?? 0}/${c.PD?.max ?? 0}</em></button>`).join("") || "<p>Nenhum protagonista criado.</p>";
  document.querySelector("#loading")?.remove();
}
document.addEventListener("click", async e => {
  const b = e.target.closest("[data-id]");
  if (b) {
    const ids = JSON.parse(localStorage.getItem(`dso.system.pending-link.${roomId}`) || "[]"), meta = await OBR.room.getMetadata(), store = meta[ROOM_DB_KEY] ? unpackRoomDb(meta[ROOM_DB_KEY], compendium) : {}, c = store[b.dataset.id];
    if (c && ids.length) {
      await OBR.scene.items.updateItems(ids, items => { for (const item of items) { item.metadata = item.metadata || {}; item.metadata[TOKEN_KEY] = { id: c.id, name: c.name }; delete item.metadata[LEGACY_TOKEN_KEY]; } });
      await OBR.broadcast.sendMessage(SYNC_CHANNEL, { type: "token-linked", characterId: c.id }, { destination: "ALL" });
    }
    localStorage.removeItem(`dso.system.pending-link.${roomId}`); await OBR.modal.close(LINK_MODAL_ID);
  }
  if (e.target.id === "cancel") await OBR.modal.close(LINK_MODAL_ID);
});
init().catch(e => { console.error(e); const l = document.querySelector("#loading"); if (l) l.textContent = `ERRO // ${e.message || e}`; });

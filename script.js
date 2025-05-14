import { getScene, getIsGM } from "https://cdn.owlbear.rodeo/v2/index.js";

window.addEventListener("load", async () => {
  const scene = await getScene();
  const isGM = await getIsGM();

  const select = document.getElementById("restriction-select");

  // Fonction d'application de la restriction
  function applyRestriction(mode) {
    if (!scene) return;

    const shouldRestrict =
      (mode === "everyone") ||
      (mode === "gm-only" && !isGM) ||
      (mode === "players-only" && !isGM);

    if (shouldRestrict) {
      console.log("➞️ Restriction active (mode:", mode, ")");
      scene.interactions.setInteractionFilter((item, action) => {
        if (item.layer !== "character") return true;
        return action === "move";
      });
    } else {
      console.log("✅ Pas de restriction (mode:", mode, ")");
      scene.interactions.setInteractionFilter(null);
    }
  }

  // Fonction de synchronisation depuis les métadonnées
  async function syncFromMetadata() {
    const metadata = await scene.metadata.get("token-move-settings");
    const mode = metadata?.mode || "players-only";
    applyRestriction(mode);
    if (isGM && select) {
      select.value = mode;
    }
  }

  // Initialisation
  if (isGM && select) {
    select.disabled = false;
    select.addEventListener("change", async () => {
      const value = select.value;
      console.log("📝 MJ a sélectionné :", value);
      await scene.metadata.set("token-move-settings", { mode: value });
      applyRestriction(value);
    });
  }

  // Écoute des mises à jour de metadata
  scene.metadata.listen("token-move-settings", (value) => {
    const mode = value?.mode || "players-only";
    console.log("🔄 Metadata mise à jour :", mode);
    applyRestriction(mode);
    if (isGM && select) select.value = mode;
  });

  syncFromMetadata();
});
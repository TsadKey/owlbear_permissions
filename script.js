import { getScene, getIsGM } from "https://cdn.owlbear.rodeo/v2/index.js";

window.addEventListener("load", async () => {
  const scene = await getScene();
  const isGM = await getIsGM();

  const select = document.getElementById("restriction-select");

  // Fonction d'application de la restriction en fonction du mode choisi
  function applyRestriction(mode) {
    if (!scene) return;

    // Déterminer si la restriction doit s'appliquer pour cet utilisateur
    const shouldRestrict =
      (mode === "everyone") ||
      (mode === "gm-only" && !isGM) ||
      (mode === "players-only" && isGM);

    if (shouldRestrict) {
      scene.interactions.setInteractionFilter((item, action) => {
        if (item.layer !== "character") return true; // ne touche que les tokens
        return action === "move";
      });
      console.log("Restriction active :", mode);
    } else {
      scene.interactions.setInteractionFilter(null);
      console.log("Aucune restriction appliquée :", mode);
    }
  }

  // Fonction pour synchroniser le choix du MJ via metadata
  async function syncFromMetadata() {
    const metadata = await scene.metadata.get("token-move-settings");
    const mode = metadata?.mode || "players-only";
    applyRestriction(mode);
    if (isGM) select.value = mode;
  }

  // Initialisation
  if (isGM) {
    select.disabled = false;
    select.addEventListener("change", async () => {
      const value = select.value;
      await scene.metadata.set("token-move-settings", { mode: value });
      applyRestriction(value);
    });
  }

  // Écoute les changements de metadata pour tout le monde
  scene.metadata.listen("token-move-settings", (value) => {
    applyRestriction(value?.mode || "players-only");
    if (isGM) select.value = value?.mode || "players-only";
  });

  syncFromMetadata();
});

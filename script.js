import { getScene, getIsGM, getMetadata, setMetadata } from "https://cdn.owlbear.rodeo/v2/index.js";

let restrictionMode = "players"; // fallback par défaut

const applyRestriction = async () => {
  const scene = await getScene();
  const isGM = await getIsGM();
  const metadata = await getMetadata();

  restrictionMode = metadata?.restrictionMode || "players";

  const shouldRestrict = () => {
    if (restrictionMode === "none") return false;
    if (restrictionMode === "gm") return isGM;
    if (restrictionMode === "players") return !isGM;
    if (restrictionMode === "all") return true;
    return false;
  };

  if (shouldRestrict()) {
    scene.interactions.setInteractionFilter((item, action) => {
      return action === "move";
    });
    console.log("Restriction active : " + restrictionMode);
  } else {
    console.log("Aucune restriction appliquée (" + restrictionMode + ")");
  }
};

window.addEventListener("load", async () => {
  await applyRestriction();

  // gestion des changements via l'UI
  document.querySelectorAll("input[name=restriction]").forEach(input => {
    input.addEventListener("change", async (e) => {
      const value = e.target.value;
      await setMetadata({ restrictionMode: value });
      restrictionMode = value;
      await applyRestriction();
    });
  });

  // Affichage de la valeur sélectionnée
  const current = await getMetadata();
  if (current?.restrictionMode) {
    document.querySelector(`input[value="${current.restrictionMode}"]`).checked = true;
  }
});

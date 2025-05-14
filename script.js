import { getScene } from "https://cdn.owlbear.rodeo/v2/index.js";

window.addEventListener("load", async () => {
  const scene = await getScene();

  if (!scene) {
    console.error("No active scene found.");
    return;
  }

  scene.interactions.setInteractionFilter((item, action) => {
    return action === "move";
  });

  console.log("Token movement only activated");
});

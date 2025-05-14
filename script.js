window.addEventListener("load", async () => {
  const isGM = (await OBR.player.getRole()) === "GM";

  const select = document.getElementById("restriction-select");

  OBR.scene.onReadyChange(async (ready) => {
    if (!ready) return;

    function applyRestriction(mode) {
      const shouldRestrict =
        mode === "everyone" ||
        (mode === "gm-only" && !isGM) ||
        (mode === "players-only" && !isGM);

      if (shouldRestrict) {
        console.log("\u279e\uFE0F Restriction active (mode:", mode, ")");
        OBR.scene.items.setInteractionFilter((item, action) => {
          if (item.layer !== "character") return true;
          return action === "move";
        });
      } else {
        console.log("\u2705 Pas de restriction (mode:", mode, ")");
        OBR.scene.items.setInteractionFilter(null);
      }
    }

    if (isGM && select) {
      select.disabled = false;
      select.addEventListener("change", async () => {
        const value = select.value;
        console.log("\ud83d\udcdd MJ a s\u00e9lectionn\u00e9 :", value);
        await OBR.scene.setMetadata({ "token-move-settings": { mode: value } });
        applyRestriction(value);
      });
    }

    OBR.scene.onMetadataChange((metadata) => {
      const mode = metadata["token-move-settings"]?.mode || "players-only";
      console.log("\ud83d\udd04 Metadata mise \u00e0 jour :", mode);
      applyRestriction(mode);
      if (isGM && select) select.value = mode;
    });

    const metadata = await OBR.scene.getMetadata();
    const mode = metadata["token-move-settings"]?.mode || "players-only";
    applyRestriction(mode);
    if (isGM && select) select.value = mode;
  });
});
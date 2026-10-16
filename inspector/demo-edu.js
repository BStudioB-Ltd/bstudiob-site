(() => {
  const frame = document.getElementById("edu-activity-frame");
  const evidence = document.getElementById("edu-evidence");
  const guidance = document.getElementById("edu-expected");
  if (!frame || !evidence || !guidance) return;

  const spriteCharacters = new Set(["mira", "barista", "suspect", "responder"]);
  const spriteMaps = new Map();

  async function replyWithSpriteMap(packet, source) {
    try {
      if (!spriteMaps.has(packet.character)) {
        // Resolve only our fixed asset path against the configured frame URL.
        const frameUrl = new URL(frame.src, document.baseURI);
        if (frameUrl.origin !== window.location.origin) return;
        const mapUrl = new URL(
          `assets/preview-sprites/${packet.character}/sprite-map.json`,
          frameUrl,
        );
        const pendingMap = fetch(mapUrl).then((response) => {
          if (!response.ok) throw new Error("Sprite map unavailable");
          return response.json();
        });
        spriteMaps.set(packet.character, pendingMap);
        pendingMap.catch(() => spriteMaps.delete(packet.character));
      }
      const map = await spriteMaps.get(packet.character);
      if (source !== frame.contentWindow) return;
      // The sandbox has an opaque origin, so the verified frame requires '*'.
      source.postMessage({
        type: "inspector-edu-sprite-map",
        version: 1,
        kind: "result",
        requestId: packet.requestId,
        character: packet.character,
        map,
      }, "*");
    } catch {
      // The child's bounded retry also covers transient fetch failures.
    }
  }

  const emptyRecord = "No evidence collected yet.";
  const defaultGuidance =
    "Choose Story Mode for Mira’s fictional café mission or Task Mode for Task 01. Story Mode’s fictional Rickroll welcome-page beat has optional Play, which loads the official Rick Astley video from YouTube. The Cave Bash menu and Task Mode do not use YouTube.";

  function clearEvidence() {
    const empty = document.createElement("li");
    empty.textContent = emptyRecord;
    evidence.replaceChildren(empty);
    guidance.textContent = defaultGuidance;
  }

  window.addEventListener("message", (message) => {
    if (message.source !== frame.contentWindow) return;
    const packet = message.data;
    if (packet?.type === "inspector-edu-sprite-map") {
      if (
        packet.version === 1 &&
        packet.kind === "request" &&
        typeof packet.requestId === "string" &&
        /^[a-z0-9-]{1,64}$/.test(packet.requestId) &&
        spriteCharacters.has(packet.character)
      ) {
        void replyWithSpriteMap(packet, message.source);
      }
      return;
    }
    if (
      !packet ||
      packet.type !== "inspector-edu-preview" ||
      packet.version !== 1 ||
      !packet.event ||
      typeof packet.event !== "object"
    ) {
      return;
    }

    const event = packet.event;
    if (event.kind === "reset") {
      clearEvidence();
      return;
    }

    if (event.kind === "evidence") {
      if (
        !["story", "task"].includes(event.mode) ||
        typeof event.record !== "string" ||
        event.record.length > 180 ||
        typeof event.guidance !== "string" ||
        event.guidance.length > 260
      ) {
        return;
      }
      const empty = evidence.querySelector("li");
      if (empty && empty.textContent === emptyRecord) empty.remove();
      const item = document.createElement("li");
      item.textContent = `${event.mode === "story" ? "Story" : "Task"}: ${event.record} (fixed sample)`;
      if (event.mode === "story" && event.video === "rickroll-requested") {
        // This link lives outside the sandboxed preview and requires a learner click.
        const videoLink = document.createElement("a");
        videoLink.href = "https://www.youtube.com/watch?v=dQw4w9WgXcQ";
        videoLink.target = "_blank";
        videoLink.rel = "noopener noreferrer";
        videoLink.textContent = "Open the official YouTube video (third-party playback fallback)";
        item.append(document.createTextNode(" — "), videoLink);
      }
      evidence.append(item);
      guidance.textContent = event.guidance;
      return;
    }

    if (
      event.kind === "complete" &&
      ["story", "task"].includes(event.mode) &&
      typeof event.guidance === "string" &&
      event.guidance.length <= 260
    ) {
      guidance.textContent = event.guidance;
    }
  });
})();
